import { db, isFirebaseConfigured } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';

export const getUserProfile = async (uid: string) => {
  if (isFirebaseConfigured) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } else {
    const data = localStorage.getItem(`profile_${uid}`);
    return data ? JSON.parse(data) : null;
  }
};

export const saveUserProfile = async (uid: string, profile: any) => {
  if (isFirebaseConfigured) {
    await setDoc(doc(db, 'users', uid), profile, { merge: true });
  } else {
    localStorage.setItem(`profile_${uid}`, JSON.stringify(profile));
  }
};

export const saveChatMessage = async (uid: string, message: any) => {
  if (isFirebaseConfigured) {
    await addDoc(collection(db, 'users', uid, 'chats'), {
      ...message,
      timestamp: serverTimestamp()
    });
  } else {
    const chats = JSON.parse(localStorage.getItem(`chats_${uid}`) || '[]');
    chats.push({ ...message, timestamp: Date.now() });
    localStorage.setItem(`chats_${uid}`, JSON.stringify(chats));
  }
};

export const getChatHistory = async (uid: string) => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, 'users', uid, 'chats'), orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } else {
    return JSON.parse(localStorage.getItem(`chats_${uid}`) || '[]');
  }
};
