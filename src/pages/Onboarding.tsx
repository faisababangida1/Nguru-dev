import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, ArrowRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../lib/storage';

const QUESTIONS = [
  { id: 'wonder', text: "What's one thing in the world you've always wondered about?" },
  { id: 'excitement', text: "What topics or subjects make you feel most alive and excited?" },
  { id: 'explanationStyle', text: "How do you love explanations best — super simple, with fun everyday stories, step-by-step, or cool analogies?" },
  { id: 'dislikes', text: "Are there any ways of learning that don't feel good for you?" },
  { id: 'ageGroup', text: "Roughly what age group are you (kid, teen, adult, parent, grandparent)?" },
  { id: 'recentConfusion', text: "Tell me one recent moment when you felt 'whoa!' or 'I don't get this'." }
];

export const Onboarding = () => {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (step >= 0) {
      setAnswers(prev => ({ ...prev, [QUESTIONS[step].id]: currentInput }));
    }
    
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
      setCurrentInput('');
    } else {
      // Finish onboarding
      if (user) {
        const finalAnswers = { ...answers, [QUESTIONS[step].id]: currentInput, isOnboarded: true };
        await saveUserProfile(user.uid, finalAnswers);
        await refreshProfile();
        navigate('/');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f0] p-6">
      <AnimatePresence mode="wait">
        {step === -1 ? (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-8">
              <Lightbulb className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-800 mb-6 leading-tight">
              Hi! I'm Nguru, your curious learning friend.
            </h1>
            <p className="text-stone-600 text-lg mb-12">
              To make everything we talk about feel perfect for YOU and help us go deeper together, may I ask a few quick, fun questions?
            </p>
            <button 
              onClick={() => setStep(0)}
              className="w-full py-4 px-6 bg-stone-900 text-white rounded-2xl font-medium text-lg shadow-md hover:bg-stone-800 transition-colors"
            >
              Let's go!
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col max-w-md mx-auto w-full pt-12"
          >
            <div className="mb-8">
              <span className="text-amber-600 font-bold tracking-widest text-xs uppercase mb-4 block">
                Question {step + 1} of {QUESTIONS.length}
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-800 leading-snug">
                {QUESTIONS[step].text}
              </h2>
            </div>

            <div className="flex-1">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-40 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm focus:ring-2 focus:ring-amber-500/50 outline-none resize-none text-lg text-stone-800"
                autoFocus
              />
            </div>

            <div className="mt-auto pt-6 flex gap-4">
              <button className="w-16 h-16 bg-white rounded-2xl border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors shadow-sm">
                <Mic className="w-6 h-6" />
              </button>
              <button 
                onClick={handleNext}
                disabled={!currentInput.trim()}
                className="flex-1 py-4 px-6 bg-stone-900 text-white rounded-2xl font-medium text-lg shadow-md hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:bg-stone-300 flex items-center justify-center gap-2"
              >
                {step === QUESTIONS.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
