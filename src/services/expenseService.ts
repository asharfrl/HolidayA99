import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  onSnapshot
} from "firebase/firestore";

export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: "Makan" | "Tiket" | "Bensin" | "Hotel" | "Belanja" | "Lainnya";
  paid_by: string;
  date: Timestamp;
  dateString: string;
}

const COLLECTION_NAME = "expenses";

export const addExpense = async (data: Omit<Expense, "id">) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};

export const subscribeExpenses = (dateString: string, callback: (data: Expense[]) => void) => {
  // FIX: Hapus orderBy("date", "desc") untuk menghindari crash index
  const q = query(
    collection(db, COLLECTION_NAME),
    where("dateString", "==", dateString)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[];
    
    // Sorting manual di Client (Terbaru di atas)
    // Menggunakan timestamp.seconds untuk sorting
    const sortedItems = items.sort((a, b) => {
        const timeA = a.date?.seconds || 0;
        const timeB = b.date?.seconds || 0;
        return timeB - timeA; // Descending
    });

    callback(sortedItems);
  }, (error) => {
      console.error("Error in expense listener:", error);
  });
};