import { QAThread, QAMessage, QAThreadStatus, QASenderType } from '../types/qa';

const getFirestore = async () => {
  const { db } = await import('../firebase/config');
  const { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, Timestamp, serverTimestamp, increment } = await import('firebase/firestore');
  const firestore = db();
  return { firestore, collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, Timestamp, serverTimestamp, increment };
};

// Map Firestore doc to QAThread
function mapThread(docSnap: any, TimestampClass: any): QAThread {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    teamId: data.teamId,
    leadId: data.leadId,
    leadName: data.leadName,
    leadEmail: data.leadEmail,
    documentId: data.documentId || null,
    documentName: data.documentName || null,
    subject: data.subject,
    status: data.status as QAThreadStatus,
    lastMessageBy: data.lastMessageBy as QASenderType,
    messageCount: data.messageCount ?? 0,
    createdAt: data.createdAt && TimestampClass && data.createdAt instanceof TimestampClass
      ? data.createdAt.toDate()
      : data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt),
    updatedAt: data.updatedAt && TimestampClass && data.updatedAt instanceof TimestampClass
      ? data.updatedAt.toDate()
      : data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt),
  };
}

// Map Firestore doc to QAMessage
function mapMessage(docSnap: any, TimestampClass: any): QAMessage {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    threadId: data.threadId,
    senderType: data.senderType as QASenderType,
    senderName: data.senderName,
    senderId: data.senderId,
    content: data.content,
    createdAt: data.createdAt && TimestampClass && data.createdAt instanceof TimestampClass
      ? data.createdAt.toDate()
      : data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt),
    readAt: data.readAt
      ? (data.readAt && TimestampClass && data.readAt instanceof TimestampClass
        ? data.readAt.toDate()
        : data.readAt instanceof Date
          ? data.readAt
          : new Date(data.readAt))
      : null,
  };
}

export const firebaseQAService = {
  async getThreads(teamId: string): Promise<QAThread[]> {
    const { firestore, collection, query, where, orderBy, getDocs, Timestamp } = await getFirestore();
    if (!firestore) return [];

    const q = query(
      collection(firestore, 'qaThreads'),
      where('teamId', '==', teamId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => mapThread(d, Timestamp));
  },

  async getThreadsForLead(leadId: string): Promise<QAThread[]> {
    const { firestore, collection, query, where, orderBy, getDocs, Timestamp } = await getFirestore();
    if (!firestore) return [];

    const q = query(
      collection(firestore, 'qaThreads'),
      where('leadId', '==', leadId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => mapThread(d, Timestamp));
  },

  async getMessages(threadId: string): Promise<QAMessage[]> {
    const { firestore, collection, query, where, orderBy, getDocs, Timestamp } = await getFirestore();
    if (!firestore) return [];

    const q = query(
      collection(firestore, 'qaMessages'),
      where('threadId', '==', threadId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => mapMessage(d, Timestamp));
  },

  async sendMessage(threadId: string, content: string, senderType: 'founder' | 'investor', senderName: string, senderId: string): Promise<QAMessage> {
    const { firestore, collection, addDoc, updateDoc, doc, serverTimestamp, increment } = await getFirestore();
    if (!firestore) throw new Error('Firestore not available');

    // Add message to qaMessages collection
    const messageData = {
      threadId,
      senderType,
      senderName,
      senderId,
      content,
      createdAt: serverTimestamp(),
      readAt: null,
    };
    const msgRef = await addDoc(collection(firestore, 'qaMessages'), messageData);

    // Update thread: increment messageCount, update lastMessageBy, updatedAt, and status
    const threadRef = doc(firestore, 'qaThreads', threadId);
    const threadUpdate: Record<string, any> = {
      lastMessageBy: senderType,
      messageCount: increment(1),
      updatedAt: serverTimestamp(),
    };
    if (senderType === 'founder') {
      threadUpdate.status = 'answered';
    }
    await updateDoc(threadRef, threadUpdate);

    return {
      id: msgRef.id,
      threadId,
      senderType,
      senderName,
      senderId,
      content,
      createdAt: new Date(),
      readAt: null,
    };
  },

  async updateThreadStatus(threadId: string, status: 'open' | 'answered' | 'closed'): Promise<void> {
    const { firestore, updateDoc, doc, serverTimestamp } = await getFirestore();
    if (!firestore) throw new Error('Firestore not available');

    const threadRef = doc(firestore, 'qaThreads', threadId);
    await updateDoc(threadRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  },
};
