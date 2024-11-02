import { openDB } from 'idb';

const DB_NAME = 'intimacy-scheduler-v2'; // Changed DB name to force fresh start
const DB_VERSION = 1; // Reset version number

export interface Appreciation {
  id?: number;
  text: string;
  date: Date;
  author: 'Emma' | 'Richard';
}

export interface ScheduledMoment {
  id?: number;
  title: string;
  description: string;
  date: Date;
  desireId?: number;
}

export interface Desire {
  id?: number;
  title: string;
  description: string;
  date: Date;
  author: 'Emma' | 'Richard';
  priority: number;
  isHot: boolean;
  category?: string;
}

export const db = await openDB<{
  appreciations: Appreciation;
  'scheduled-moments': ScheduledMoment;
  desires: Desire;
}>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Create stores with correct schema
    const appreciationsStore = db.createObjectStore('appreciations', { 
      keyPath: 'id', 
      autoIncrement: true 
    });

    const scheduledMomentsStore = db.createObjectStore('scheduled-moments', { 
      keyPath: 'id', 
      autoIncrement: true 
    });

    const desiresStore = db.createObjectStore('desires', { 
      keyPath: 'id', 
      autoIncrement: true 
    });

    // Create indexes
    desiresStore.createIndex('author', 'author');
    desiresStore.createIndex('priority', 'priority');
    desiresStore.createIndex('isHot', 'isHot');
  },
});

export const appreciationsDB = {
  async add(appreciation: Appreciation) {
    return db.add('appreciations', appreciation);
  },
  async getAll() {
    return db.getAll('appreciations');
  },
  async delete(id: number) {
    return db.delete('appreciations', id);
  },
};

export const scheduledMomentsDB = {
  async add(moment: ScheduledMoment) {
    return db.add('scheduled-moments', moment);
  },
  async getAll() {
    return db.getAll('scheduled-moments');
  },
  async delete(id: number) {
    return db.delete('scheduled-moments', id);
  },
  async update(id: number, data: Partial<ScheduledMoment>) {
    const tx = db.transaction('scheduled-moments', 'readwrite');
    const store = tx.objectStore('scheduled-moments');
    const moment = await store.get(id);
    if (!moment) throw new Error('Moment not found');
    await store.put({ ...moment, ...data });
    return tx.done;
  },
};

export const desiresDB = {
  async add(desire: Desire) {
    return db.add('desires', desire);
  },
  async getAll() {
    return db.getAll('desires');
  },
  async getAllByAuthor(author: 'Emma' | 'Richard') {
    const tx = db.transaction('desires', 'readonly');
    const store = tx.objectStore('desires');
    const authorIndex = store.index('author');
    return authorIndex.getAll(author);
  },
  async getTopDesires(author: 'Emma' | 'Richard', limit: number) {
    const desires = await this.getAllByAuthor(author);
    return desires
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  },
  async delete(id: number) {
    return db.delete('desires', id);
  },
  async updatePriority(id: number, priority: number) {
    const tx = db.transaction('desires', 'readwrite');
    const store = tx.objectStore('desires');
    const desire = await store.get(id);
    if (!desire) throw new Error('Desire not found');
    await store.put({ ...desire, priority });
    return tx.done;
  },
};