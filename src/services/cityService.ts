import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot
} from "firebase/firestore";

export interface City {
  id?: string;
  name: string;
}

const COLLECTION_NAME = "cities";

// 1. Tambah Kota (Hanya Nama)
export const addCity = async (name: string) => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      name: name,
      created_at: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error adding city:", error);
    throw error;
  }
};

// 2. Ambil Semua Kota (Realtime Listener)
export const subscribeCities = (callback: (data: City[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME)); 

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as City[];
    
    // Sort A-Z Client-side
    const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));
    callback(sortedItems);
  });
};

// 3. Hapus Kota
export const deleteCity = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting city:", error);
    throw error;
  }
};