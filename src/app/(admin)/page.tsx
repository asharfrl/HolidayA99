"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchDashboardData, DashboardStats, ItineraryItem } from "@/services/dashboardService";
import DateSelectionModal from "@/components/dashboard/DateSelectionModal";

export default function Dashboard() {
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = Cookies.get("auth_role");
    setRole(userRole || "user");
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center text-gray-500">Memuat...</div>;
  }

  return (
    <>
      {role === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
}

// --- DASHBOARD ADMIN ---
const AdminDashboard = () => {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard Admin 🛠️
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Pusat kontrol untuk Web Liburan Keluarga A99
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 px-4">
        {/* Menu Kota */}
        <Link
          href="/cities"
          className="group relative flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V7l8-4 8 4v14M19 21V11l-6-4" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
            Data Kota & Destinasi
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tambah, edit, atau hapus data kota tujuan liburan.
          </p>
        </Link>

        {/* Menu Kelola / Cetak */}
        <Link
          href="/manage"
          className="group relative flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-orange-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-500/10 dark:text-orange-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
            Kelola & Cetak Laporan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lihat ringkasan total dan cetak PDF perjalanan.
          </p>
        </Link>
      </div>
    </div>
  );
};

// --- DASHBOARD USER ---
const UserDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBudget: 0,
    totalExpenses: 0,
    remainingBudget: 0,
  });
  const [timeline, setTimeline] = useState<ItineraryItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const getData = async () => {
      const data = await fetchDashboardData();
      if (data) {
        setStats(data.stats);
        setTimeline(data.timeline);
      }
      setLoadingData(false);
    };
    getData();
  }, []);

  // FUNGSI NAVIGASI: Klik Card -> Buka Detail
  const handleNavigateToDetail = (item: ItineraryItem) => {
    if (!item.rawDate) return;
    
    // Konversi Timestamp ke format YYYY-MM-DD
    const date = item.rawDate.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    router.push(`/timeline/${year}-${month}-${day}`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl py-6 px-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Perjalanan Keluarga A99 🚀
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Liburan Akhir Tahun 2025
        </p>
      </div>

      {/* 1. Ringkasan Budget */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Budget"
          amount={loadingData ? "..." : formatRupiah(stats.totalBudget)}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-500/10"
        />
        <StatCard
          title="Pengeluaran"
          amount={loadingData ? "..." : formatRupiah(stats.totalExpenses)}
          color="text-red-500"
          bgColor="bg-red-50 dark:bg-red-500/10"
        />
        <StatCard
          title="Sisa Saldo"
          amount={loadingData ? "..." : formatRupiah(stats.remainingBudget)}
          color={stats.remainingBudget < 0 ? "text-red-500" : "text-green-500"}
          bgColor={
            stats.remainingBudget < 0
              ? "bg-red-50 dark:bg-red-500/10"
              : "bg-green-50 dark:bg-green-500/10"
          }
        />
      </div>

      {/* 2. Timeline */}
      <div className="mt-10">
        <div className="mx-auto max-w-3xl">
          <h3 className="mb-6 text-center text-lg font-bold text-gray-800 dark:text-white">
            📅 Riwayat Perjalanan
          </h3>

          {loadingData ? (
            <div className="text-center text-gray-500">Memuat data perjalanan...</div>
          ) : timeline.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
              <p className="text-gray-500">Belum ada jadwal perjalanan. Tekan tombol (+) untuk menambahkan.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 md:ml-0 md:pl-0 space-y-8">
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  className="relative flex flex-col md:flex-row items-start md:items-center group pl-8 md:pl-0"
                >
                  <div className="absolute left-[-9px] top-0 md:relative md:left-auto md:top-auto flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-brand-500 dark:bg-gray-900 z-10 md:mr-6 md:ml-[-10px]"></div>
                  
                  {/* Card Klik-able */}
                  <div 
                    onClick={() => handleNavigateToDetail(item)}
                    className="flex-1 w-full md:w-auto rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                            <span className="block text-xs font-semibold uppercase tracking-wider text-brand-500">
                            Hari ke-{index + 1}
                            </span>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-800">
                                Klik untuk Edit ✏️
                            </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500">{item.date}</p>
                        
                        {/* Preview Kegiatan Singkat */}
                        {item.activities.length > 0 && (
                            <ul className="mt-3 space-y-1 border-t border-gray-100 pt-2 dark:border-gray-800">
                                {item.activities.slice(0, 3).map((act, i) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        <span className="font-mono text-gray-400">{act.time}</span> 
                                        <span>{act.name}</span>
                                    </li>
                                ))}
                                {item.activities.length > 3 && (
                                    <li className="text-xs text-gray-400 italic pl-3.5">
                                        + {item.activities.length - 3} kegiatan lainnya...
                                    </li>
                                )}
                            </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-300"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <DateSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

const StatCard = ({ title, amount, color, bgColor }: any) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 text-center">
    <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${bgColor} ${color}`}>
      <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.11-1.54-3.52-3.19h2.16c.35.88 1.15 1.48 2.06 1.48.98 0 1.76-.59 1.76-1.53 0-.79-.53-1.32-1.76-1.61l-1.02-.24c-2.02-.48-3.08-1.55-3.08-3.09 0-1.55 1.15-2.73 2.72-3.08V5h2.67v1.89c1.47.31 2.65 1.34 3.08 2.81h-2.14c-.33-.8-.96-1.25-1.76-1.25-.87 0-1.48.58-1.48 1.4 0 .66.44 1.18 1.54 1.45l1.01.25c2.18.54 3.32 1.62 3.32 3.25 0 1.64-1.22 2.87-2.93 3.24z" />
      </svg>
    </div>
    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
      {title}
    </span>
    <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
      {amount}
    </h4>
  </div>
);