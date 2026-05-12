import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, doc, runTransaction, getDocs } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { handleFirestoreError, OperationType, formatNaira } from '../utils';

export default function WalletPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('transactionUsers', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
    }, (error) => {
      // If index is missing, it might fail initially.
      console.error(error);
    });

    return unsubscribe;
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !amount || !recipientEmail) return;
    
    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) return setStatus({ type: 'error', message: 'Invalid amount' });
    if (profile.walletBalance < transferAmount) return setStatus({ type: 'error', message: 'Insufficient balance' });

    setIsSending(true);
    setStatus(null);

    try {
      // Find recipient
      const userQuery = query(collection(db, 'users'), where('email', '==', recipientEmail.trim()));
      const userSnap = await getDocs(userQuery);
      
      if (userSnap.empty) {
        throw new Error('User not found');
      }

      const recipientDoc = userSnap.docs[0];
      const recipientData = recipientDoc.data();
      const recipientId = recipientDoc.id;

      if (recipientId === user.uid) {
        throw new Error('You cannot send money to yourself');
      }

      // Perform transaction: Deduct from sender, add to receiver, take commission
      const commission = transferAmount * 0.05; // 5% commission
      const finalAmount = transferAmount - commission;

      await runTransaction(db, async (tx) => {
        const senderRef = doc(db, 'users', user.uid);
        const receiverRef = doc(db, 'users', recipientId);

        tx.update(senderRef, { walletBalance: profile.walletBalance - transferAmount });
        tx.update(receiverRef, { walletBalance: (recipientData.walletBalance || 0) + finalAmount });

        const txRef = doc(collection(db, 'transactions'));
        tx.set(txRef, {
          fromId: user.uid,
          toId: recipientId,
          amount: transferAmount,
          commission: commission,
          finalAmount: finalAmount,
          type: 'TRANSFER',
          status: 'SUCCESS',
          createdAt: Timestamp.now(),
          transactionUsers: [user.uid, recipientId] // Filter helper
        });
      });

      setStatus({ type: 'success', message: `Successfully sent ${formatNaira(finalAmount)} to ${recipientEmail}. Commission of ${formatNaira(commission)} taken.` });
      setAmount('');
      setRecipientEmail('');
      await refreshProfile();
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Transfer failed' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your Wallet</h2>
        <p className="text-slate-500">Manage your earnings and transfers safely.</p>
      </header>

      {/* Balance Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Balance</p>
          <h3 className="text-5xl font-black">{formatNaira(profile?.walletBalance || 0)}</h3>
          
          <div className="mt-10 flex space-x-4">
             <div className="bg-white/10 rounded-2xl p-4 flex-1 backdrop-blur-md">
                <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Commission Rate</p>
                <p className="font-bold text-emerald-400">5.0%</p>
             </div>
             <div className="bg-white/10 rounded-2xl p-4 flex-1 backdrop-blur-md">
                <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Status</p>
                <p className="font-bold text-emerald-400">Verified</p>
             </div>
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 blur-[80px] rounded-full -ml-10 -mb-10"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transfer Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
               <Send size={20} />
            </div>
            <h3 className="text-xl font-bold">Transfer Money</h3>
          </div>

          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient Email</label>
              <input
                required
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="friend@futo.edu.ng"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₦)</label>
              <input
                required
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>

            {status && (
              <div className={`p-4 rounded-xl flex items-start space-x-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.type === 'success' ? <Sparkles className="shrink-0" size={18} /> : <AlertCircle className="shrink-0" size={18} />}
                <p className="text-xs font-medium">{status.message}</p>
              </div>
            )}

            <button
              disabled={isSending}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 mt-4 active:scale-95"
            >
              {isSending ? 'Processing...' : 'Send Money'}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          <div className="space-y-4 overflow-y-auto max-h-[400px] flex-1">
            {transactions.length === 0 ? (
              <p className="text-center text-slate-400 py-10 italic text-sm">No transactions yet.</p>
            ) : transactions.map(tx => {
              const isOutgoing = tx.fromId === user?.uid;
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${isOutgoing ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {isOutgoing ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{isOutgoing ? 'Transfer Sent' : 'Money Received'}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        {tx.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${isOutgoing ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isOutgoing ? '-' : '+'}{formatNaira(isOutgoing ? tx.amount : (tx as any).finalAmount || tx.amount)}
                    </p>
                    {isOutgoing && <p className="text-[10px] text-slate-300 font-bold">Inc. fee</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
