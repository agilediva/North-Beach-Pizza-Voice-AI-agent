# Mario's North Beach Pizza — Voice Agent 🍕

A real-time, bi-directional voice ordering agent for Mario's Pizza in North Beach, San Francisco, built with React, Vite, and the **Gemini Live Audio API**.

---

## Overview

Customers can converse naturally with **Genie**, a virtual counter clerk at Mario's Pizza. As you speak, the agent parses your order in real time via Gemini function calling and updates a live printed-style receipt on screen with itemized pricing, customer name, pickup status, and payment method.

## Features

- **Real-Time Voice Streaming**: Bi-directional, full-duplex speech interaction powered by the Gemini Live API (`gemini-2.5-flash-native-audio-preview`).
- **Live Tool Calling (`updateOrder`)**: Streams structured order data back into the React interface as you converse.
- **Dynamic Receipt & Audio Visualizer**: Visual representation of audio waveform and an authentic vintage receipt that calculates totals and tracks status.
- **Interruption Handling**: Instant client-side audio cutoff if you interrupt the agent mid-sentence.
- **San Francisco North Beach Menu**: Supports whole pies, single slices, custom toppings, and real-time pricing calculation.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Google Fonts (*Lobster* & *Roboto*)
- **AI & Audio**:
  - `Google` (Gemini Multimodal Live API over WebSockets)
  - Web Audio API (16 kHz PCM microphone capture, 24 kHz streaming playback)

