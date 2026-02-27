import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, User } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white border-t border-stone-200 px-6 py-3 pb-safe flex justify-between items-center z-50">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
              isActive ? "text-amber-600" : "text-stone-400 hover:text-stone-600"
            )
          }
        >
          <Icon className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
