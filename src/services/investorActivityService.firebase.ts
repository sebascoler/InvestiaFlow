import { InvestorActivity } from '../types/investorActivity';

const getFirestore = async () => {
  const { db } = await import('../firebase/config');
  const { collection, query, where, orderBy, limit, getDocs, Timestamp } = await import('firebase/firestore');
  const firestore = db();
  return { firestore, collection, query, where, orderBy, limit, getDocs, Timestamp };
};

function mapDocToActivity(docSnap: any, TimestampClass: any): InvestorActivity {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    teamId: data.teamId,
    leadId: data.leadId,
    leadName: data.leadName,
    leadEmail: data.leadEmail,
    type: data.type,
    documentId: data.documentId || null,
    documentName: data.documentName || null,
    createdAt: data.createdAt && TimestampClass && data.createdAt instanceof TimestampClass
      ? data.createdAt.toDate()
      : data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt),
  };
}

export const firebaseInvestorActivityService = {
  async getActivities(teamId: string, limitCount: number = 50): Promise<InvestorActivity[]> {
    const { firestore, collection, query, where, orderBy, limit, getDocs, Timestamp } = await getFirestore();
    if (!firestore) return [];

    const q = query(
      collection(firestore, 'investorActivities'),
      where('teamId', '==', teamId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => mapDocToActivity(d, Timestamp));
  },

  async getActivitiesForLead(leadId: string, limitCount: number = 20): Promise<InvestorActivity[]> {
    const { firestore, collection, query, where, orderBy, limit, getDocs, Timestamp } = await getFirestore();
    if (!firestore) return [];

    const q = query(
      collection(firestore, 'investorActivities'),
      where('leadId', '==', leadId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => mapDocToActivity(d, Timestamp));
  },
};
