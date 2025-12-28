"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { collection, getDocs } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { getAppConfig, updateAppConfig } from "@/services/configService";
import Alert from "@/components/ui/alert/Alert";

// Interface Data Ringkas
interface ReportData {
  recentExpenses: any[];
  totalExpenses: number;
}

export default function ManagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<number>(0);
  const [tempBudget, setTempBudget] = useState("");
  const [data, setData] = useState<ReportData>({ recentExpenses: [], totalExpenses: 0 });
  const [alertState, setAlertState] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Helper Format Rupiah
  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  // 1. Cek Admin & Load Data
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const role = Cookies.get("auth_role");
      if (role !== "admin") {
        router.push("/");
        return;
      }

      try {
        // A. Load Config Budget
        const config = await getAppConfig();
        setBudget(config.total_budget || 0);
        setTempBudget((config.total_budget || 0).toString());

        // B. Load Expenses untuk Summary (Kita hanya butuh total dan 5 data terakhir untuk preview)
        const expSnap = await getDocs(collection(db, "expenses"));
        const allExpenses = expSnap.docs.map(d => d.data());
        
        // Hitung total
        const total = allExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        
        // Ambil 5 terakhir untuk preview (client sort simplified)
        const sortedExpenses = allExpenses.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)).slice(0, 5);

        setData({ recentExpenses: sortedExpenses, totalExpenses: total });

      } catch (error) {
        console.error("Error loading manage data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [router]);

  // 2. Handle Update Budget
  const handleUpdateBudget = async () => {
    try {
      const newBudget = parseInt(tempBudget);
      if (isNaN(newBudget)) return;
      
      await updateAppConfig({ total_budget: newBudget });
      setBudget(newBudget);
      setAlertState({ type: "success", message: "Budget berhasil diperbarui!" });
      setTimeout(() => setAlertState(null), 3000);
    } catch (error) {
      setAlertState({ type: "error", message: "Gagal update budget." });
    }
  };

  // 3. Handle Print (Direct to new page)
  const handleOpenPrintPage = () => {
    // Membuka halaman cetak di tab baru
    window.open('/print-report', '_blank');
  };

  const remainingBudget = budget - data.totalExpenses;
  const percentageUsed = budget > 0 ? (data.totalExpenses / budget) * 100 : 0;

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Memuat Data Admin...</div>;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-10">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Panel Kelola</h1>
        <p className="text-gray-500 dark:text-gray-400">Atur anggaran dan cetak laporan pertanggungjawaban.</p>
      </div>

      {alertState && (
        <div className="mb-6">
            <Alert variant={alertState.type} title={alertState.type === 'success' ? 'Berhasil' : 'Error'} message={alertState.message} />
        </div>
      )}

      {/* GRID LAYOUT UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: SETTINGS & PREVIEW TABLE */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* KARTU 1: BUDGET SETTING */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Total Anggaran</h3>
                            <p className="text-xs text-gray-500">Batas maksimal pengeluaran liburan.</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <input 
                            type="number" 
                            value={tempBudget}
                            onChange={(e) => setTempBudget(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="0"
                        />
                    </div>
                    <button 
                        onClick={handleUpdateBudget}
                        className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-500/30"
                    >
                        Simpan
                    </button>
                </div>
            </div>

            {/* KARTU 2: RINGKASAN DATA (PREVIEW 5 TERAKHIR) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Pengeluaran Terkini</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-400">5 Data Terakhir</span>
                </div>
                
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Keterangan</th>
                                <th className="px-4 py-3 text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {data.recentExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-4 py-8 text-center text-gray-400 italic">Belum ada data.</td>
                                </tr>
                            ) : (
                                data.recentExpenses.map((exp, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800 dark:text-white">{exp.title}</p>
                                            <p className="text-xs text-gray-500">{exp.dateString} • {exp.category}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                            {formatRupiah(exp.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        {/* KOLOM KANAN: SUMMARY CARD & PRINT BUTTON */}
        <div className="lg:col-span-1 space-y-8">
            
            {/* KARTU STATUS KEUANGAN (GRADIENT) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                
                <h4 className="text-blue-100 font-medium mb-1">Sisa Saldo Tersedia</h4>
                <div className="text-4xl font-bold mb-6 tracking-tight">{formatRupiah(remainingBudget)}</div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-blue-100 mb-1">
                            <span>Terpakai</span>
                            <span>{percentageUsed.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ${percentageUsed > 90 ? 'bg-red-400' : 'bg-green-400'}`}
                                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                        <div>
                            <p className="text-xs text-blue-200">Total Pengeluaran</p>
                            <p className="font-semibold">{formatRupiah(data.totalExpenses)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-200">Total Budget</p>
                            <p className="font-semibold">{formatRupiah(budget)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KARTU AKSES LAPORAN (PRINT) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center dark:bg-gray-800 dark:border-gray-700">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-4 dark:bg-orange-900/20 dark:text-orange-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Laporan Lengkap</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Lihat rincian seluruh perjalanan dan cetak ke format PDF A4.
                </p>
                <button 
                    onClick={handleOpenPrintPage}
                    className="w-full py-3 px-4 rounded-xl border-2 border-orange-500 text-orange-600 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    Buka Halaman Cetak
                </button>
            </div>

        </div>

      </div>
    </div>
  );
}