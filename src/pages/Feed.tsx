import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_FEED = [
  { id: '1', author: 'Curious AI', content: 'How do planes actually stay in the air?', topic: 'Aerodynamics' },
  { id: '2', author: 'Curious AI', content: 'Why do we dream when we sleep?', topic: 'Dreams' },
  { id: '3', author: 'Curious AI', content: 'How does my phone know exactly where I am?', topic: 'GPS Technology' },
  { id: '4', author: 'Curious AI', content: 'What makes the sky blue?', topic: 'Light scattering' },
];

export const Feed = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [feed, setFeed] = useState(INITIAL_FEED);

  const handleCardClick = (topic: string) => {
    navigate('/chat', { state: { initialTopic: topic } });
  };

  return (
    <div className="h-full bg-[#f5f5f0] overflow-y-auto pb-20">
      <div className="p-6 pt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-700" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-800">Discover</h1>
        </div>

        <div className="space-y-6">
          {feed.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardClick(item.content)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-3 h-3 text-stone-500" />
                </div>
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{item.author}</span>
              </div>
              <h2 className="text-xl font-serif text-stone-800 leading-snug mb-4">
                "{item.content}"
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                  {item.topic}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
