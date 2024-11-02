import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  updateDoc,
  orderBy,
  limit as firestoreLimit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseError } from 'firebase/app';

export interface Appreciation {
  id?: string;
  text: string;
  date: Date;
  author: 'Emma' | 'Richard';
}

export interface ScheduledMoment {
  id?: string;
  title: string;
  description: string;
  date: Date;
  desireId?: string;
}

export interface Desire {
  id?: string;
  title: string;
  description: string;
  date: Date;
  author: 'Emma' | 'Richard';
  priority: number;
  isHot: boolean;
  category?: string;
}

export const appreciationsDB = {
  async add(appreciation: Appreciation) {
    const appreciationsRef = collection(db, 'appreciations');
    const docRef = await addDoc(appreciationsRef, {
      ...appreciation,
      date: appreciation.date.toISOString()
    });
    return docRef.id;
  },

  async getAll() {
    const appreciationsRef = collection(db, 'appreciations');
    const snapshot = await getDocs(appreciationsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date)
    })) as Appreciation[];
  },

  async delete(id: string) {
    const docRef = doc(db, 'appreciations', id);
    await deleteDoc(docRef);
  },
};

export const scheduledMomentsDB = {
  async add(moment: ScheduledMoment) {
    const momentsRef = collection(db, 'scheduled-moments');
    const docRef = await addDoc(momentsRef, {
      ...moment,
      date: moment.date.toISOString()
    });
    return docRef.id;
  },

  async getAll() {
    const momentsRef = collection(db, 'scheduled-moments');
    const snapshot = await getDocs(momentsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date)
    })) as ScheduledMoment[];
  },

  async delete(id: string) {
    const docRef = doc(db, 'scheduled-moments', id);
    await deleteDoc(docRef);
  },

  async update(id: string, data: Partial<ScheduledMoment>) {
    const docRef = doc(db, 'scheduled-moments', id);
    await updateDoc(docRef, {
      ...data,
      date: data.date?.toISOString()
    });
  },
};

export const desiresDB = {
  async add(desire: Desire) {
    try {
      const desiresRef = collection(db, 'desires');
      const docRef = await addDoc(desiresRef, {
        ...desire,
        date: desire.date.toISOString()
      });
      return docRef.id;
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Firebase error:', error.code, error.message);
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  },

  async getAll() {
    const desiresRef = collection(db, 'desires');
    const snapshot = await getDocs(desiresRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date)
    })) as Desire[];
  },

  async getAllByAuthor(author: 'Emma' | 'Richard') {
    const desiresRef = collection(db, 'desires');
    const q = query(desiresRef, where('author', '==', author));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date)
    })) as Desire[];
  },

  async delete(id: string) {
    const docRef = doc(db, 'desires', id);
    await deleteDoc(docRef);
  },

  async update(id: string, data: Partial<Desire>) {
    const docRef = doc(db, 'desires', id);
    await updateDoc(docRef, {
      ...data,
      date: data.date?.toISOString()
    });
  },

  async getByMode(isHot: boolean) {
    const desiresRef = collection(db, 'desires');
    const q = query(desiresRef, where('isHot', '==', isHot));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date)
    })) as Desire[];
  },

  async getTopDesires(author: 'Emma' | 'Richard', limit: number) {
    const desires = await this.getAllByAuthor(author);
    return desires
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  },

  async getByCategory(category: string) {
    const desires = await this.getAll();
    return desires.filter(desire => desire.category === category);
  },

  async clear() {
    const desiresRef = collection(db, 'desires');
    const snapshot = await getDocs(desiresRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  subscribe(callback: (desires: Desire[]) => void) {
    const desiresRef = collection(db, 'desires');
    return onSnapshot(desiresRef, (snapshot) => {
      const desires = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date)
      })) as Desire[];
      callback(desires);
    });
  }
};