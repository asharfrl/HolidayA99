import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, orderBy, query, Timestamp } from "firebase/firestore";

export interface DashboardStats {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
}

export interface ItineraryActivity {
  time: string;
  name: string;
  location: string;
}

export interface ItineraryItem {
  id: string;
  date: string;
  rawDate: Timestamp;
  title: string;
  totalCost: number;
  activities: ItineraryActivity[];
}

export const fetchDashboardData = async () => {
  try {
    // 1. Ambil Config (Total Budget)
    const configRef = doc(db, "config", "app_settings");
    const configSnap = await getDoc(configRef);
    const totalBudget = configSnap.exists() ? configSnap.data().total_budget || 0 : 0;

    // 2. Ambil Expenses (Pengeluaran)
    const expensesRef = collection(db, "expenses");
    const expensesSnap = await getDocs(expensesRef);
    
    let totalExpenses = 0;
    expensesSnap.forEach((doc) => {
      const data = doc.data();
      totalExpenses += typeof data.amount === 'number' ? data.amount : 0;
    });

    // 3. Ambil Itineraries (Jadwal)
    const itinerariesRef = collection(db, "itineraries");
    const itinerarySnap = await getDocs(itinerariesRef);

    const timelineMap = new Map<string, ItineraryItem>();

    // Helper Format Tanggal
    const formatDate = (timestamp: any) => {
      if (!timestamp || !timestamp.toDate) return "Tanggal Belum Diatur";
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    };

    itinerarySnap.forEach((doc) => {
      const data = doc.data();
      if (!data.date) return;

      const dateKey = formatDate(data.date);

      if (!timelineMap.has(dateKey)) {
        timelineMap.set(dateKey, {
          id: doc.id,
          date: dateKey,
          rawDate: data.date,
          title: `Perjalanan Tanggal ${dateKey}`,
          totalCost: 0, 
          activities: [],
        });
      }

      const currentDay = timelineMap.get(dateKey);
      if (currentDay) {
        currentDay.activities.push({
          time: data.time_start || "-",
          name: data.activity_name || "Aktivitas Tanpa Nama",
          location: data.city_name || "-",
        });
        
        // Logic Judul Dinamis
        if (currentDay.activities.length === 1) {
            currentDay.title = `${data.activity_name} di ${data.city_name}`;
        } else {
            currentDay.title = `${currentDay.activities.length} Aktivitas di ${data.city_name || 'Lokasi Beragam'}`;
        }
      }
    });

    // 4. Konversi ke Array & Sorting Final
    const timeline = Array.from(timelineMap.values()).map(item => {
        // PENTING: Sort aktivitas per hari berdasarkan JAM
        item.activities.sort((a, b) => a.time.localeCompare(b.time));
        return item;
    }).sort((a, b) => {
        // Sort timeline berdasarkan TANGGAL
        return a.rawDate.seconds - b.rawDate.seconds;
    });

    return {
      stats: {
        totalBudget,
        totalExpenses,
        remainingBudget: totalBudget - totalExpenses,
      },
      timeline,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      stats: { totalBudget: 0, totalExpenses: 0, remainingBudget: 0 },
      timeline: []
    };
  }
};