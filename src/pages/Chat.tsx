import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mic, Send, Square, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateNguruResponse } from '../services/gemini';
import { saveChatMessage, getChatHistory } from '../lib/storage';
import ReactMarkdown from 'react-markdown';

export const Chat = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const initialTopic = location.state?.initialTopic;
  
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        const history = await getChatHistory(user.uid);
        if (history.length > 0) {
          setMessages(history.map((h: any) => ({ role: h.role, content: h.content })));
        } else if (initialTopic) {
          handleSend(initialTopic);
        } else {
          setMessages([{ role: 'model', content: "Hi! I'm Nguru. What are we curious about today?" }]);
        }
      }
    };
    loadHistory();
  }, [user, initialTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find a warm, friendly voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !user || !profile) return;

    const userMsg = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    await saveChatMessage(user.uid, userMsg);

    try {
      const response = await generateNguruResponse(text, profile, messages);
      const modelMsg = { role: 'model' as const, content: response };
      setMessages(prev => [...prev, modelMsg]);
      await saveChatMessage(user.uid, modelMsg);
      speak(response);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Oops, my brain got a little tangled. Can we try that again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input isn't supported in this browser yet.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      // Stop logic would go here if we kept a ref to the recognition object
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f0]">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-4 rounded-3xl ${
                msg.role === 'user' 
                  ? 'bg-stone-900 text-white rounded-br-sm' 
                  : 'bg-white text-stone-800 shadow-sm border border-stone-100 rounded-bl-sm'
              }`}
            >
              {msg.role === 'model' && (
                <button onClick={() => speak(msg.content)} className="mb-2 text-amber-500 hover:text-amber-600">
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl rounded-bl-sm shadow-sm border border-stone-100 flex gap-1">
              <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-stone-200 p-4 pb-safe">
        <div className="flex items-center gap-2 max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Nguru anything..."
            className="flex-1 bg-stone-100 text-stone-800 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          />
          
          <button
            onClick={toggleListen}
            className={`absolute right-14 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-stone-300 transition-colors"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
