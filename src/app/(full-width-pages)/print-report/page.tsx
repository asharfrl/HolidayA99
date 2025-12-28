"use client";
import React, { useEffect, useState } from "react";
import { fetchFullReport, ReportData } from "@/services/reportService";
import Image from "next/image";

export default function PrintReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper Format Rupiah
  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  
  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
      if(!dateString) return "-";
      return new Date(dateString).toLocaleDateString("id-ID", {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
  }

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchFullReport();
      setData(result);
      setLoading(false);
      
      // Auto Print setelah data dimuat (Opsional, tapi praktis)
      if (result) {
        setTimeout(() => window.print(), 1000);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Menyiapkan Laporan...</div>;
  if (!data) return <div className="p-10 text-center">Gagal memuat data laporan.</div>;

  return (
    <div className="bg-white min-h-screen text-black font-sans p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
      
      {/* --- HEADER LAPORAN --- */}
      <div className="text-center border-b-4 border-gray-800 pb-6 mb-8">
        <div className="flex justify-center mb-4">
             {/* Ganti src logo sesuai kebutuhan, pastikan path benar */}
             {/* Menggunakan text placeholder jika logo tidak termuat di print preview kadang lebih aman */}
             <h1 className="text-4xl font-extrabold uppercase tracking-widest text-gray-900">
                Laporan Perjalanan
             </h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-600">Keluarga A99 - Akhir Tahun 2025</h2>
        <p className="text-sm text-gray-500 mt-2">Dicetak pada: {new Date().toLocaleString("id-ID")}</p>
      </div>

      {/* --- RINGKASAN KEUANGAN (KARTU) --- */}
      <div className="mb-10">
        <h3 className="text-lg font-bold uppercase mb-4 border-l-4 border-gray-800 pl-3">Ringkasan Keuangan</h3>
        <div className="grid grid-cols-3 gap-6">
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 print:bg-gray-50">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Anggaran</div>
                <div className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(data.summary.totalBudget)}</div>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 print:bg-gray-50">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Pengeluaran</div>
                <div className="text-2xl font-bold text-red-600 mt-1">{formatRupiah(data.summary.totalExpenses)}</div>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 print:bg-gray-50">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Sisa Saldo</div>
                <div className="text-2xl font-bold text-green-700 mt-1">{formatRupiah(data.summary.remainingBudget)}</div>
            </div>
        </div>
      </div>

      {/* --- TABEL PENGELUARAN --- */}
      <div className="mb-10 break-inside-avoid">
        <h3 className="text-lg font-bold uppercase mb-4 border-l-4 border-gray-800 pl-3">Rincian Pengeluaran</h3>
        <table className="w-full text-sm text-left border-collapse border border-gray-300">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs print:bg-gray-200">
                <tr>
                    <th className="border border-gray-300 px-3 py-2 w-10 text-center">No</th>
                    <th className="border border-gray-300 px-3 py-2 w-32">Tanggal</th>
                    <th className="border border-gray-300 px-3 py-2">Keterangan</th>
                    <th className="border border-gray-300 px-3 py-2 w-24">Kategori</th>
                    <th className="border border-gray-300 px-3 py-2 w-24">Oleh</th>
                    <th className="border border-gray-300 px-3 py-2 w-32 text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                {data.expenses.map((exp, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                        <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">{idx + 1}</td>
                        <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">{exp.dateString}</td>
                        <td className="border border-gray-300 px-3 py-2 font-medium">{exp.title}</td>
                        <td className="border border-gray-300 px-3 py-2">{exp.category}</td>
                        <td className="border border-gray-300 px-3 py-2">{exp.paid_by}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-mono">{formatRupiah(exp.amount)}</td>
                    </tr>
                ))}
                {data.expenses.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-4 text-gray-500 italic">Tidak ada data pengeluaran.</td></tr>
                )}
            </tbody>
            <tfoot>
                <tr className="bg-gray-100 font-bold print:bg-gray-200">
                    <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right">TOTAL PENGELUARAN</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{formatRupiah(data.summary.totalExpenses)}</td>
                </tr>
            </tfoot>
        </table>
      </div>

      {/* --- AGENDA PERJALANAN --- */}
      <div className="break-inside-avoid">
        <h3 className="text-lg font-bold uppercase mb-4 border-l-4 border-gray-800 pl-3">Agenda Perjalanan</h3>
        
        {Array.from(new Set(data.itineraries.map(i => i.dateString))).map((dateKey) => (
            <div key={dateKey as string} className="mb-6 break-inside-avoid border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center print:bg-gray-800 print:text-white">
                    <span className="font-bold text-sm uppercase">
                        {formatDate(dateKey as string)}
                    </span>
                </div>
                <div className="p-4 bg-white">
                    <ul className="space-y-3">
                        {data.itineraries
                            .filter(i => i.dateString === dateKey)
                            .map((item, idx) => (
                                <li key={idx} className="flex items-start text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                    <span className="font-mono font-bold w-16 text-gray-600 flex-shrink-0 bg-gray-100 px-2 rounded text-center mr-3 print:bg-gray-100">
                                        {item.time_start}
                                    </span>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">{item.activity_name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <span>📍 {item.city_name}</span>
                                            <span className="mx-1">•</span>
                                            <span className="uppercase tracking-wide text-[10px] border border-gray-300 px-1 rounded">
                                                {item.location_type}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        ))}
        {data.itineraries.length === 0 && (
            <p className="text-center italic text-gray-500 border border-dashed border-gray-300 p-6 rounded">Belum ada agenda perjalanan.</p>
        )}
      </div>

      {/* --- FOOTER HALAMAN CETAK --- */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
        <p>Dokumen ini digenerate secara otomatis oleh Sistem Web Liburan Keluarga A99.</p>
        <p>Harap disimpan sebagai arsip perjalanan.</p>
      </div>

    </div>
  );
}