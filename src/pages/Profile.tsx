import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { User, School, BookOpen, Fingerprint, Save, CheckCircle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    level: profile?.level || '100',
    department: profile?.department || ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h2>
        <p className="text-slate-500">Update your student information and bio.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner Area */}
        <div className="h-32 bg-emerald-600"></div>
        
        <div className="px-8 pb-8">
           <div className="relative -mt-12 mb-6 flex items-end justify-between">
              <img 
                src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.uid} 
                className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg bg-white"
                alt="Profile"
              />
              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active Scholar</span>
              </div>
           </div>

           <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <User size={12} />
                    <span>Full Name</span>
                 </label>
                 <input 
                   disabled
                   value={profile?.displayName}
                   className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-500 cursor-not-allowed"
                 />
                 <p className="text-[10px] text-slate-400">Name is synced with Google Account.</p>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <School size={12} />
                    <span>Academic Level</span>
                 </label>
                 <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                 >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                 </select>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <BookOpen size={12} />
                    <span>Department</span>
                 </label>
                 <input 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Computer Science"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <Fingerprint size={12} />
                    <span>Bio</span>
                 </label>
                 <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    placeholder="Tell your fellow scholars about yourself..."
                 />
              </div>

              <div className="md:col-span-2 flex items-center justify-between border-t border-slate-50 pt-6">
                 {saved ? (
                   <div className="flex items-center space-x-2 text-emerald-600 font-bold transition-all animate-bounce">
                     <CheckCircle size={20} />
                     <span>Profile Updated!</span>
                   </div>
                 ) : <div></div>}
                 
                 <button 
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10 py-4 rounded-2xl flex items-center space-x-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                 >
                   {loading ? 'Saving...' : 'Save Profile'}
                   {!loading && <Save size={20} />}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
