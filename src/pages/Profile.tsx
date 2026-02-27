import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Profile = () => {
  const { user, profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <div className="h-full bg-[#f5f5f0] overflow-y-auto pb-20 p-6 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-stone-500" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-800">
            {user?.displayName || 'Curious Learner'}
          </h1>
          <p className="text-stone-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Your Learning Style</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-stone-500 mb-1">You love explanations that are:</p>
              <p className="font-medium text-stone-800">{profile.explanationStyle}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Topics that excite you:</p>
              <p className="font-medium text-stone-800">{profile.excitement}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">You prefer to avoid:</p>
              <p className="font-medium text-stone-800">{profile.dislikes}</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Recent Wonders</h2>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl">
              <p className="text-amber-900 font-serif italic">"{profile.wonder}"</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl">
              <p className="text-stone-700 font-serif italic">"{profile.recentConfusion}"</p>
            </div>
          </div>
        </section>

        <button
          onClick={signOut}
          className="w-full py-4 px-6 bg-white text-red-500 rounded-2xl font-medium shadow-sm border border-stone-100 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
