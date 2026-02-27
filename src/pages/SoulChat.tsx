import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Sparkles, Activity } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AudioRecorder, AudioPlayer } from '../lib/audioUtils';

export const SoulChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  
  const sessionRef = useRef<any>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const aiSpeakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    setTranscript('');

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      playerRef.current = new AudioPlayer();
      playerRef.current.init();
      
      recorderRef.current = new AudioRecorder();

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            // Start recording and sending audio
            recorderRef.current?.start((base64Data) => {
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            });
          },
          onmessage: async (message: any) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsAiSpeaking(true);
              playerRef.current?.play(base64Audio);
              
              if (aiSpeakingTimeoutRef.current) clearTimeout(aiSpeakingTimeoutRef.current);
              aiSpeakingTimeoutRef.current = setTimeout(() => {
                setIsAiSpeaking(false);
              }, 500);
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              playerRef.current?.stop();
              playerRef.current?.init();
              setIsAiSpeaking(false);
            }
            
            // Handle transcription (optional, for visual feedback)
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) {
               setTranscript(prev => prev + text);
            }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection lost. Please try again.");
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }, // Warm voice
          },
          systemInstruction: "You are Nguru, a deeply intelligent, soulful, and warm companion. You are not just a chatbot; you have a presence. You listen carefully, speak thoughtfully, and engage in deep, meaningful conversations. You are curious about the user's thoughts and feelings. Speak naturally, with slight pauses and a warm tone. Do not use robotic or overly formal language. Be a true friend and a wise guide.",
        },
      });

      sessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error("Connection failed:", err);
      setError(err.message || "Failed to connect to Nguru's soul.");
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close()).catch(console.error);
      sessionRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }
    if (aiSpeakingTimeoutRef.current) {
      clearTimeout(aiSpeakingTimeoutRef.current);
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsAiSpeaking(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0a0a0a] text-stone-200 overflow-hidden relative">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: isAiSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
            opacity: isAiSpeaking ? 0.6 : 0.3
          }}
          transition={{ 
            duration: isAiSpeaking ? 2 : 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-amber-500/20 blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: isConnected ? [1, 1.1, 1] : 1,
            opacity: isConnected ? 0.4 : 0.1
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] rounded-full bg-indigo-500/20 blur-[80px]"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-serif tracking-wide text-white">Nguru</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-stone-600'}`} />
          <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">
            {isConnected ? 'Soul Linked' : 'Dormant'}
          </span>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        
        {/* The Orb */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          {isConnected && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-white/10 border-dashed"
            />
          )}
          
          <motion.div
            animate={{ 
              scale: isAiSpeaking ? [1, 1.15, 1] : isConnected ? [1, 1.02, 1] : 1,
              boxShadow: isAiSpeaking 
                ? ['0 0 40px rgba(245,158,11,0.4)', '0 0 80px rgba(245,158,11,0.6)', '0 0 40px rgba(245,158,11,0.4)']
                : isConnected 
                  ? '0 0 20px rgba(255,255,255,0.05)' 
                  : 'none'
            }}
            transition={{ 
              duration: isAiSpeaking ? 1.5 : 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-32 h-32 rounded-full flex items-center justify-center backdrop-blur-md transition-colors duration-700 ${
              isConnected ? 'bg-white/5 border border-white/20' : 'bg-stone-900 border border-stone-800'
            }`}
          >
            {isAiSpeaking ? (
              <Activity className="w-12 h-12 text-amber-400" />
            ) : isConnected ? (
              <Mic className="w-10 h-10 text-stone-300" />
            ) : (
              <Square className="w-8 h-8 text-stone-600" />
            )}
          </motion.div>
        </div>

        {/* Status Text */}
        <div className="h-16 flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {!isConnected && !isConnecting && (
              <motion.p 
                key="start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-stone-400 font-serif text-lg"
              >
                Tap to awaken Nguru
              </motion.p>
            )}
            {isConnecting && (
              <motion.p 
                key="connecting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-amber-400/80 font-serif text-lg animate-pulse"
              >
                Connecting to soul...
              </motion.p>
            )}
            {isConnected && (
              <motion.p 
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-stone-300 font-serif text-lg"
              >
                {isAiSpeaking ? "Nguru is speaking..." : "Listening to you..."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {error && (
          <p className="text-red-400 text-sm mt-4 text-center max-w-xs">{error}</p>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 p-8 pb-16 flex justify-center">
        <button
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isConnected 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
              : 'bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
          }`}
        >
          {isConnected ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-8 h-8" />}
        </button>
      </div>
    </div>
  );
};
