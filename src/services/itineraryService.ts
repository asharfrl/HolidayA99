import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  onSnapshot
} from "firebase/firestore";

export interface Itinerary {
  id?: string;
  date: Timestamp;
  dateString: string;
  time_start: string;
  activity_name: string;
  location_type: "Wisata" | "Kuliner" | "Hotel" | "Lainnya";
  city_name: string;
  maps_link?: string;
  status: "Pending" | "Done";
  notes?: string;
}

const COLLECTION_NAME = "itineraries";

export const addItinerary = async (data: Omit<Itinerary, "id">) => {
  try {
    // Sanitasi data agar aman
    const cleanData = {
        ...data,
        maps_link: data.maps_link || "",
        notes: data.notes || ""
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding itinerary:", error);
    throw error;
  }
};

export const getItinerariesByDate = async (dateString: string) => {
  try {
    // FIX: Hapus orderBy untuk menghindari error index
    const q = query(
      collection(db, COLLECTION_NAME),
      where("dateString", "==", dateString)
    );
    
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Itinerary[];

    // Sorting manual di Client (Berdasarkan Jam)
    return items.sort((a, b) => (a.time_start || "").localeCompare(b.time_start || ""));
  } catch (error) {
    console.error("Error getting itineraries:", error);
    return [];
  }
};

export const toggleItineraryStatus = async (id: string, currentStatus: "Pending" | "Done") => {
  try {
    const newStatus = currentStatus === "Pending" ? "Done" : "Pending";
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

export const deleteItinerary = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting itinerary:", error);
  }
};

export const subscribeItineraries = (dateString: string, callback: (data: Itinerary[]) => void) => {
  // FIX: Hapus orderBy di sini juga
  const q = query(
    collection(db, COLLECTION_NAME),
    where("dateString", "==", dateString)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Itinerary[];
    
    // Sorting manual di Client (Berdasarkan Jam)
    const sortedItems = items.sort((a, b) => (a.time_start || "").localeCompare(b.time_start || ""));
    
    callback(sortedItems);
  }, (error) => {
      console.error("Error in itinerary listener:", error);
  });
};