import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';
import { SYSTEM_INSTRUCTION, PRICES } from '../constants';
import { OrderState } from '../types';

interface UseGeminiLiveProps {
  onOrderUpdate: (order: OrderState) => void;
}

export const useGeminiLive = ({ onOrderUpdate }: UseGeminiLiveProps) => {
  const [isLive, setIsLive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); // Type 'any' used because Session type isn't fully exported in all SDK versions yet

  // API Client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Tool Definition
  const updateOrderTool: FunctionDeclaration = {
    name: 'updateOrder',
    parameters: {
      type: Type.OBJECT,
      description: 'Update the current pizza order details, customer info, and status.',
      properties: {
        customerName: { type: Type.STRING, description: "Customer's name" },
        paymentMethod: { type: Type.STRING, description: "Cash or Credit Card" },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pizzaName: { type: Type.STRING },
              size: { type: Type.STRING, description: "Slice or Whole Pie" },
              quantity: { type: Type.NUMBER }
            }
          }
        },
        status: { type: Type.STRING, description: "Greeting, Ordering, Confirming, or Completed" }
      },
      required: ['items']
    }
  };

  const startSession = useCallback(async () => {
    try {
      setError(null);
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [updateOrderTool] }],
        responseModalities: [Modality.AUDIO], 
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
        }
      };

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: config.model,
        config: {
            systemInstruction: config.systemInstruction,
            tools: config.tools,
            responseModalities: [Modality.AUDIO], // Cast as any if Type issue persists in some environments
            speechConfig: config.speechConfig,
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setIsLive(true);
            
            // Setup Input Processing
            if (!inputAudioContextRef.current) return;
            
            inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(rms);

              const pcmBlob = createPcmBlob(inputData);
              
              sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            inputSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                    base64ToUint8Array(base64Audio),
                    ctx,
                    24000,
                    1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNodeRef.current);
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
             }

             // Handle Interruptions
             if (message.serverContent?.interrupted) {
                 sourcesRef.current.forEach(s => s.stop());
                 sourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
             }

             // Handle Tool Calls
             if (message.toolCall) {
                const responses = [];
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'updateOrder') {
                        const args = fc.args as any;
                        
                        // Calculate total locally to ensure accuracy
                        let calculatedTotal = 0;
                        const processedItems = (args.items || []).map((item: any) => {
                            const price = item.size?.toLowerCase().includes('slice') ? PRICES.SLICE : PRICES.WHOLE;
                            const qty = item.quantity || 1;
                            calculatedTotal += price * qty;
                            return { ...item, price };
                        });

                        const newOrderState: OrderState = {
                            customerName: args.customerName || '',
                            paymentMethod: args.paymentMethod as any || null,
                            status: (args.status as any) || 'Ordering',
                            items: processedItems,
                            total: calculatedTotal
                        };
                        
                        onOrderUpdate(newOrderState);
                        
                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: { result: "Order updated successfully" }
                        });
                    }
                }
                
                if (responses.length > 0) {
                    sessionPromise.then(session => {
                        session.sendToolResponse({ functionResponses: responses });
                    });
                }
             }
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            setIsLive(false);
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            setError("Connection error. Please try again.");
            setIsLive(false);
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError("Failed to access microphone or connect.");
    }
  }, [onOrderUpdate, ai, updateOrderTool]);

  const stopSession = useCallback(() => {
    // Stop Microphone
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    
    // Stop Audio Output
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();

    // Close Session
    if (sessionRef.current) {
        sessionRef.current.then((session: any) => session.close());
    }

    setIsLive(false);
    setVolume(0);
  }, []);

  return { isLive, volume, startSession, stopSession, error };
};