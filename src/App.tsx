import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Shell from './components/layout/Shell';
import Feed from './pages/Feed';
import Marketplace from './pages/Marketplace';
import WalletPage from './pages/Wallet';
import ProfilePage from './pages/Profile';
import { LogIn } from 'lucide-react';

function AppContent() {
  const { user, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-sans tracking-tight">FUTO Scholar</h1>
          <p className="text-slate-500 mb-8">Connect with fellow students, solve assignments, and earn Naira securely.</p>
          <button
            onClick={signIn}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-200 flex items-center justify-center space-x-2"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale invert" alt="Google" />
            <span>Sign in with Google</span>
          </button>
          <p className="mt-6 text-xs text-slate-400">By continuing, you agree to the FUTO Scholar Community Guidelines.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': return <Feed />;
      case 'market': return <Marketplace />;
      case 'wallet': return <WalletPage />;
      case 'profile': return <ProfilePage />;
      default: return <Feed />;
    }
  };

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
