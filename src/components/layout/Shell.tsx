import { ReactNode } from 'react';
import { Home, ClipboardList, Wallet, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { motion } from 'motion/react';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-6 py-4 transition-colors ${
      active ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default function Shell({ children, activeTab, setActiveTab }: { children: ReactNode, activeTab: string, setActiveTab: (tab: string) => void }) {
  const { user, profile, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-600 tracking-tighter">FUTO Scholar</h1>
        </div>

        <nav className="flex-1 mt-4">
          <SidebarItem
            icon={<Home size={20} />}
            label="Feed"
            active={activeTab === 'feed'}
            onClick={() => setActiveTab('feed')}
          />
          <SidebarItem
            icon={<ClipboardList size={20} />}
            label="Marketplace"
            active={activeTab === 'market'}
            onClick={() => setActiveTab('market')}
          />
          <SidebarItem
            icon={<Wallet size={20} />}
            label="Wallet"
            active={activeTab === 'wallet'}
            onClick={() => setActiveTab('wallet')}
          />
          <SidebarItem
            icon={<User size={20} />}
            label="Profile"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <img src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid} className="w-10 h-10 rounded-full border border-slate-200" alt="avatar" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{profile?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors w-full px-2 py-1"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2 w-full max-w-md">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments or posts..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="md:hidden">
             <h1 className="text-xl font-bold text-emerald-600">FUTO Scholar</h1>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeTab}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {children}
          </motion.div>
        </section>

        {/* Mobile Navbar */}
        <nav className="md:hidden flex h-16 bg-white border-t border-slate-200">
          <button onClick={() => setActiveTab('feed')} className={`flex-1 flex flex-col items-center justify-center ${activeTab === 'feed' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Home size={20} />
            <span className="text-[10px] mt-1">Feed</span>
          </button>
          <button onClick={() => setActiveTab('market')} className={`flex-1 flex flex-col items-center justify-center ${activeTab === 'market' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <ClipboardList size={20} />
            <span className="text-[10px] mt-1">Market</span>
          </button>
          <button onClick={() => setActiveTab('wallet')} className={`flex-1 flex flex-col items-center justify-center ${activeTab === 'wallet' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Wallet size={20} />
            <span className="text-[10px] mt-1">Wallet</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex-1 flex flex-col items-center justify-center ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <User size={20} />
            <span className="text-[10px] mt-1">Profile</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
