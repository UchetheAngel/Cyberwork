import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, where, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Assignment, AssignmentStatus } from '../types';
import { Plus, Tag, Clock, CheckCircle2, User as UserIcon } from 'lucide-react';
import { handleFirestoreError, OperationType, formatNaira } from '../utils';

export default function Marketplace() {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    level: '100',
    courseCode: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assignments');
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'assignments'), {
        ...formData,
        price: parseFloat(formData.price),
        creatorId: user.uid,
        completerId: null,
        status: 'OPEN',
        createdAt: Timestamp.now(),
        deadline: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // Default 1 week
      });
      setShowAddForm(false);
      setFormData({ title: '', description: '', price: '', level: '100', courseCode: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assignments');
    } finally {
      setLoading(false);
    }
  };

  const claimAssignment = async (assignmentId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'assignments', assignmentId), {
        completerId: user.uid,
        status: 'ASSIGNED'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignmentId}`);
    }
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-emerald-100 text-emerald-700';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-purple-100 text-purple-700';
      case 'PAID': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Assignment Market</h2>
          <p className="text-slate-500">Find help or earn money by helping others.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Post Assignment</span>
        </button>
      </header>

      {showAddForm && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold mb-6">Create New Task</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. MTH 101 Assignment 2"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Description</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                placeholder="Details about the assignment, specific requirements..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Reward (₦)</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Course Code</label>
              <input
                required
                type="text"
                value={formData.courseCode}
                onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="MTH101"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
              <select
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 text-slate-500 font-semibold hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-50 transition-all hover:bg-emerald-700 flex items-center space-x-2"
              >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div> : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest ${getStatusColor(assignment.status)}`}>
                {assignment.status}
              </span>
              <span className="text-emerald-600 font-black text-lg">{formatNaira(assignment.price)}</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">{assignment.title}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{assignment.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-slate-400">
                <Tag size={14} />
                <span className="text-xs font-medium uppercase">{assignment.courseCode || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <UserIcon size={14} />
                <span className="text-xs font-medium">{assignment.level} Level</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500">
                <Clock size={14} />
                <span className="text-xs font-medium">1 week left</span>
              </div>
              {assignment.completerId && (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle2 size={14} />
                  <span className="text-xs font-bold uppercase">Taken</span>
                </div>
              )}
            </div>

            <div className="mt-auto">
              {assignment.status === 'OPEN' && assignment.creatorId !== user?.uid ? (
                <button 
                  onClick={() => claimAssignment(assignment.id)}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Claim Assignment</span>
                </button>
              ) : assignment.creatorId === user?.uid ? (
                <div className="w-full bg-slate-50 text-slate-400 py-3 rounded-xl font-bold text-sm text-center border border-dashed border-slate-200">
                  Your Posting
                </div>
              ) : (
                <div className="w-full bg-slate-50 text-slate-400 py-3 rounded-xl font-bold text-sm text-center">
                  Task Assigned
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
