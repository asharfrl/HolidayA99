import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface ReportData {
  summary: {
    totalBudget: number;
    totalExpenses: number;
    remainingBudget: number;
  };
  itineraries: any[];
  expenses: any[];
}

export const fetchFullReport = async () => {
  try {
    // 1. Ambil Budget
    // (Dalam kasus nyata, ini bisa dari 'config', tapi sementara kita hardcode atau ambil dari local state di page sebelumnya jika perlu)
    // Untuk service ini kita ambil fresh dari DB
    const configSnap = await getDocs(collection(db, "config"));
    let totalBudget = 0;
    configSnap.forEach((doc) => {
        if (doc.id === 'app_settings') {
            totalBudget = doc.data().total_budget || 0;
        }
    });

    // 2. Ambil Semua Jadwal
    const itinSnap = await getDocs(collection(db, "itineraries"));
    const itineraries = itinSnap.docs.map(doc => doc.data());

    // 3. Ambil Semua Pengeluaran
    const expSnap = await getDocs(collection(db, "expenses"));
    const expenses = expSnap.docs.map(doc => doc.data());

    // 4. Hitung Total
    const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 5. Sorting (Client Side)
    itineraries.sort((a, b) => {
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateA - dateB || (a.time_start || "").localeCompare(b.time_start || "");
    });

    expenses.sort((a, b) => {
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateA - dateB; // Ascending by date for report
    });

    return {
      summary: {
        totalBudget,
        totalExpenses,
        remainingBudget: totalBudget - totalExpenses
      },
      itineraries,
      expenses
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
};