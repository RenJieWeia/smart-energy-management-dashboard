
import React from 'react';
import { Home, Clock, Star, Map, BarChart2 } from 'lucide-react';

const Sidebar: React.FC = () => {
  const icons = [
    { Icon: Home, active: true },
    { Icon: Clock, active: false },
    { Icon: Star, active: false },
    { Icon: Map, active: false },
    { Icon: BarChart2, active: false },
  ];

  return (
    <div className="w-14 h-full flex flex-col items-center pt-20 space-y-8 border-r border-cyan-500/20 bg-[#020b1c]/50">
      {icons.map(({ Icon, active }, idx) => (
        <div 
          key={idx} 
          className={`p-2 rounded-lg cursor-pointer transition-all ${active ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-cyan-300'}`}
        >
          <Icon size={24} />
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
