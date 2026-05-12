import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Post as PostType } from '../types';
import { Send, Heart, MessageCircle, Share2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils';

export default function Feed() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostType));
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
    return unsubscribe;
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !user || !profile) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile.displayName,
        authorPhoto: profile.photoURL,
        content: newPost,
        likesCount: 0,
        createdAt: Timestamp.now(),
      });
      setNewPost('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Social Feed</h2>
        <p className="text-slate-500">What's happening in FUTO today?</p>
      </header>

      {/* Post Composer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8">
        <div className="flex space-x-4">
          <img
            src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.uid}
            className="w-12 h-12 rounded-full border border-slate-100"
            alt="me"
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something with your fellow scholars..."
              className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[100px] transition-all"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || isPosting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 transition-all shadow-md active:scale-95"
              >
                <span>{isPosting ? 'Posting...' : 'Post'}</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-emerald-100 transition-colors">
            <div className="flex space-x-3 mb-4">
              <img
                src={post.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.authorId}
                className="w-10 h-10 rounded-full bg-slate-100"
                alt={post.authorName}
              />
              <div>
                <h4 className="font-bold text-slate-900 leading-tight">{post.authorName}</h4>
                <p className="text-xs text-slate-400">
                  {post.createdAt?.toDate().toLocaleString()}
                </p>
              </div>
            </div>
            
            <p className="text-slate-700 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
              {post.content}
            </p>

            <div className="flex items-center space-x-6 pt-4 border-t border-slate-50">
              <button className="flex items-center space-x-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
                <Heart size={18} />
                <span className="text-xs font-semibold">{post.likesCount || 0}</span>
              </button>
              <button className="flex items-center space-x-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                <MessageCircle size={18} />
                <span className="text-xs font-semibold">Reply</span>
              </button>
              <button className="flex items-center space-x-1.5 text-slate-400 hover:text-purple-500 transition-colors ml-auto">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
