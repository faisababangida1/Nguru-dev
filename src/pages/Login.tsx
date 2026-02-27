import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured, auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = () => {
  const { mockSignIn } = useAuth();

  const handleGoogleLogin = async () => {
    if (isFirebaseConfigured) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Login failed", error);
      }
    } else {
      mockSignIn();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-[#f5f5f0]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Lightbulb className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">Nguru</h1>
        <p className="text-lg text-stone-600 mb-12 max-w-xs">
          Your teacher friend who turns confusion into excitement.
        </p>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full max-w-sm py-4 px-6 bg-stone-900 text-white rounded-2xl font-medium text-lg shadow-md hover:bg-stone-800 transition-colors flex items-center justify-center gap-3"
        >
          {isFirebaseConfigured ? "Continue with Google" : "Start Learning (Demo)"}
        </button>
      </motion.div>
    </div>
  );
};
