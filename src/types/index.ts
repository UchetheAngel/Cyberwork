import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  bio: string;
  level: string;
  department: string;
  walletBalance: number;
  photoURL: string;
  createdAt: Timestamp;
}

export type AssignmentStatus = 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'PAID';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  creatorId: string;
  completerId: string | null;
  status: AssignmentStatus;
  courseCode: string;
  deadline: Timestamp;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  likesCount: number;
  createdAt: Timestamp;
}

export type TransactionType = 'TRANSFER' | 'ASSIGNMENT_PAYMENT';
export type TransactionStatus = 'SUCCESS' | 'FAILED';

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  commission: number;
  type: TransactionType;
  status: TransactionStatus;
  assignmentId?: string;
  createdAt: Timestamp;
}
