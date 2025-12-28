import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ID Dokumen Settings
const CONFIG_DOC_ID = "app_settings";

export const getAppConfig = async () => {
  try {
    const docRef = doc(db, "config", CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as { total_budget: number };
    } else {
      return { total_budget: 0 };
    }
  } catch (error) {
    console.error("Error fetching config:", error);
    return { total_budget: 0 };
  }
};

export const updateAppConfig = async (data: { total_budget: number }) => {
  try {
    const docRef = doc(db, "config", CONFIG_DOC_ID);
    // Gunakan setDoc dengan merge: true agar jika dokumen belum ada, akan dibuatkan
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating config:", error);
    throw error;
  }
};