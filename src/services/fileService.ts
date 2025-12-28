import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface FileData {
  id?: string;
  file_name: string;
  download_url: string;
  storage_path: string;
  category: "Foto" | "Dokumen";
  dateString: string;
  uploaded_by: string;
  created_at: Timestamp;
}

const COLLECTION_NAME = "files";

// Upload File
export const uploadFile = async (
  file: File, 
  dateString: string, 
  category: "Foto" | "Dokumen",
  uploader: string
) => {
  try {
    // Path folder: uploads/YYYY-MM-DD/timestamp_namafile
    const storagePath = `uploads/${dateString}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    // Upload Bytes
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Simpan Metadata
    await addDoc(collection(db, COLLECTION_NAME), {
      file_name: file.name,
      download_url: downloadURL,
      storage_path: storagePath,
      category,
      dateString,
      uploaded_by: uploader,
      created_at: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Hapus File
export const deleteFile = async (id: string, storagePath: string) => {
  try {
    // Hapus dari Storage
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef).catch((err) => console.warn("File di storage sudah hilang:", err));
    
    // Hapus dari Firestore
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Realtime Listener
export const subscribeFiles = (dateString: string, callback: (data: FileData[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("dateString", "==", dateString)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FileData[];
    
    // Sort manual Client-side (Terbaru di atas)
    const sorted = items.sort((a, b) => {
        const tA = a.created_at?.seconds || 0;
        const tB = b.created_at?.seconds || 0;
        return tB - tA;
    });
    callback(sorted);
  });
};