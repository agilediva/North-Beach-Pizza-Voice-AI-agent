import React, { useState } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { OrderState } from './types';
import { PIZZA_MENU, PRICES } from './constants';
import Receipt from './components/Receipt';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [order, setOrder] = useState<OrderState>({
    customerName: '',
    items: [],
    paymentMethod: null,
    status: 'Greeting',
    total: 0
  });

  const { isLive, volume, startSession, stopSession, error } = useGeminiLive({
    onOrderUpdate: (newOrder) => setOrder(newOrder)
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side: Menu Board */}
        <div className="md:w-1/2 bg-red-900 text-orange-50 p-6 md:p-12 overflow-y-auto">
            <div className="border-4 border-double border-yellow-500 p-6 h-full shadow-2xl bg-red-800 relative">
                 {/* Decorative tacks */}
                 <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-yellow-400 shadow"></div>
                 <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-400 shadow"></div>
                 <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-yellow-400 shadow"></div>
                 <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-yellow-400 shadow"></div>

                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl mb-2 brand-font text-yellow-400 drop-shadow-md">Mario's Pizza</h1>
                    <p className="uppercase tracking-[0.2em] text-sm text-yellow-200">North Beach • San Francisco</p>
                </div>

                <div className="flex justify-center space-x-8 text-xl font-bold mb-8 border-b border-red-700 pb-4">
                    <div className="text-center">
                        <span className="block text-sm text-red-300 uppercase">Slice</span>
                        ${PRICES.SLICE}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm text-red-300 uppercase">Whole Pie</span>
                        ${PRICES.WHOLE}
                    </div>
                </div>

                <div className="grid gap-4">
                    {PIZZA_MENU.map((item, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between items-baseline border-b border-red-700 border-dashed pb-1">
                                <h3 className="text-xl font-bold text-yellow-100">{item.name}</h3>
                            </div>
                            <p className="text-red-300 text-sm mt-1 italic">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Side: Interaction Area */}
        <div className="md:w-1/2 bg-stone-100 flex flex-col items-center justify-center p-6 relative">
            <div className="w-full max-w-md mb-8">
                 <Receipt order={order} />
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 w-full md:w-1/2 md:left-auto md:right-0 bg-white border-t border-stone-200 p-6 shadow-lg z-50">
                <div className="flex flex-col items-center">
                    {error && (
                        <div className="mb-4 text-red-600 bg-red-50 px-4 py-2 rounded text-sm w-full text-center border border-red-200">
                            {error}
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-6 w-full justify-center">
                        <Visualizer isActive={isLive} volume={volume} />
                        
                        {!isLive ? (
                             <button 
                                onClick={startSession}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                Start Order
                             </button>
                        ) : (
                            <button 
                                onClick={stopSession}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                End Call
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;