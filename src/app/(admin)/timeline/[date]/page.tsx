"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { Itinerary, addItinerary, subscribeItineraries, deleteItinerary, toggleItineraryStatus } from "@/services/itineraryService";
import { Expense, addExpense, subscribeExpenses, deleteExpense } from "@/services/expenseService";

export default function FreshDetailPage() {
  const { date } = useParams();
  const dateString = Array.isArray(date) ? date[0] : date;
  const router = useRouter();

  // State Data
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  
  // State UI
  const [activeTab, setActiveTab] = useState<"jadwal" | "biaya">("jadwal");
  const [showForm, setShowForm] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    time: "", activity: "", location: "", type: "Wisata", // Itinerary
    title: "", amount: "", category: "Makan", paidBy: "" // Expense
  });

  // 1. Load Data Realtime
  useEffect(() => {
    if (!dateString) return;
    const unsubItin = subscribeItineraries(dateString, setItineraries);
    const unsubExp = subscribeExpenses(dateString, setExpenses);
    return () => { unsubItin(); unsubExp(); };
  }, [dateString]);

  // 2. Load Data Kota (Untuk Dropdown)
  useEffect(() => {
    const fetchCities = async () => {
        try {
            const snap = await getDocs(collection(db, "cities"));
            const list = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
            setCities(list);
            // Set default kota jika ada
            if(list.length > 0) setFormData(prev => ({ ...prev, location: list[0].name }));
        } catch (e) {
            console.error("Gagal load kota", e);
        }
    };
    fetchCities();
  }, []);

  // Handlers Input
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler Submit (Simpan Data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!dateString) return;
    const dateObj = new Date(dateString);
    dateObj.setHours(12,0,0,0);

    try {
        if(activeTab === "jadwal") {
            // Validasi Kota
            if (cities.length === 0) {
                alert("Admin belum menambahkan data kota. Silakan hubungi Admin.");
                return;
            }
            await addItinerary({
                date: Timestamp.fromDate(dateObj), dateString, status: "Pending",
                time_start: formData.time, activity_name: formData.activity, 
                city_name: formData.location, location_type: formData.type as any
            });
        } else {
            await addExpense({
                date: Timestamp.fromDate(dateObj), dateString,
                title: formData.title, amount: Number(formData.amount),
                category: formData.category as any, paid_by: formData.paidBy
            });
        }
        setShowForm(false);
        // Reset field penting saja
        setFormData(prev => ({ ...prev, time: "", activity: "", title: "", amount: "" }));
    } catch (err) { alert("Gagal menyimpan data."); }
  };

  // Helper UI Format
  const dateObj = new Date(dateString || "");
  const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
  const dayNum = dateObj.getDate();
  const monthYear = dateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // LOGIC SORTING (Penting)
  const sortedItineraries = [...itineraries].sort((a, b) => {
    // 1. Status: Pending di atas, Done di bawah
    if (a.status !== b.status) return a.status === 'Done' ? 1 : -1;
    // 2. Waktu: Pagi -> Malam
    return (a.time_start || "").localeCompare(b.time_start || "");
  });

  return (
    <div className="mx-auto max-w-5xl p-4 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* HEADER FRESH - RESPONSIVE FIX */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-400 p-6 md:p-8 text-white shadow-xl flex flex-col md:block dark:from-blue-700 dark:to-blue-500">
        <button onClick={() => router.back()} className="absolute top-4 left-4 md:top-6 md:left-6 rounded-full bg-white/20 p-2 hover:bg-white/30 transition z-10 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        
        <div className="flex flex-col items-center text-center mt-2 md:mt-4">
            <span className="text-sm md:text-lg font-medium tracking-widest uppercase opacity-90">{monthYear}</span>
            <h1 className="text-5xl md:text-6xl font-bold mt-2">{dayNum}</h1>
            <span className="text-xl md:text-2xl font-semibold mt-1">{dayName}</span>
        </div>

        {/* Total Pengeluaran */}
        <div className="mt-6 md:mt-0 md:absolute md:bottom-6 md:right-8 text-center md:text-right border-t border-white/20 pt-4 md:border-0 md:pt-0">
            <p className="text-xs text-blue-100 uppercase font-bold">Total Pengeluaran Hari Ini</p>
            <p className="text-2xl font-bold">Rp {totalExpense.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
            <button 
                onClick={() => { setActiveTab("jadwal"); setShowForm(false); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "jadwal" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"}`}
            >
                Jadwal Kegiatan
            </button>
            <button 
                onClick={() => { setActiveTab("biaya"); setShowForm(false); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "biaya" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"}`}
            >
                Rincian Biaya
            </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        
        {/* TOMBOL TAMBAH (JIKA FORM TERTUTUP) */}
        {!showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className={`w-full py-4 mb-6 rounded-2xl border-2 border-dashed font-bold transition-all flex items-center justify-center gap-2
                ${activeTab === "jadwal" 
                    ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/40" 
                    : "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:border-orange-300 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/40"}`}
            >
                <span className="text-xl font-bold">+</span> Tambah {activeTab === "jadwal" ? "Kegiatan Baru" : "Pengeluaran Baru"}
            </button>
        )}

        {/* --- FORM INPUT RAPI --- */}
        {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg mb-8 animate-in slide-in-from-top-4 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Isi Data {activeTab === 'jadwal' ? 'Jadwal 🗓️' : 'Biaya 💰'}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === "jadwal" ? (
                        <>
                            {/* Baris 1: Jam & Kategori */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Jam Mulai
                                    </label>
                                    <input 
                                        name="time" 
                                        type="time" 
                                        required 
                                        value={formData.time} 
                                        onChange={handleInputChange} 
                                        // FIX: Trik agar picker muncul saat diklik area input
                                        onClick={(e) => { try { (e.currentTarget as any).showPicker() } catch (err) {} }}
                                        className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                                        style={{ colorScheme: "light dark" }}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Kategori
                                    </label>
                                    <div className="relative bg-transparent dark:bg-gray-700 rounded-lg">
                                        <select 
                                            name="type" 
                                            value={formData.type} 
                                            onChange={handleInputChange} 
                                            className="relative z-20 w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="Wisata">Wisata 🏖️</option>
                                            <option value="Kuliner">Kuliner 🍜</option>
                                            <option value="Hotel">Hotel 🏨</option>
                                            <option value="Lainnya">Lainnya 📌</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">▼</span>
                                    </div>
                                </div>
                            </div>

                            {/* Baris 2: Nama Aktivitas */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Aktivitas
                                </label>
                                <input 
                                    name="activity" 
                                    placeholder="Contoh: Pergi ke Pantai Parangtritis" 
                                    required 
                                    value={formData.activity} 
                                    onChange={handleInputChange} 
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            {/* Baris 3: Lokasi */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Lokasi / Kota
                                </label>
                                <div className="relative bg-transparent dark:bg-gray-700 rounded-lg">
                                    <select 
                                        name="location" 
                                        value={formData.location} 
                                        onChange={handleInputChange} 
                                        disabled={cities.length === 0}
                                        className="relative z-20 w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                    >
                                        {cities.length === 0 ? <option>Data Kota Kosong</option> : cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">▼</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Form Pengeluaran */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Judul Pengeluaran
                                </label>
                                <input 
                                    name="title" 
                                    placeholder="Contoh: Beli Tiket Masuk" 
                                    required 
                                    value={formData.title} 
                                    onChange={handleInputChange} 
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Nominal (Rp)
                                    </label>
                                    <input 
                                        name="amount" 
                                        type="number" 
                                        placeholder="0" 
                                        required 
                                        value={formData.amount} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Kategori
                                    </label>
                                    <div className="relative bg-transparent dark:bg-gray-700 rounded-lg">
                                        <select 
                                            name="category" 
                                            value={formData.category} 
                                            onChange={handleInputChange} 
                                            className="relative z-20 w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="Makan">Makan 🍔</option>
                                            <option value="Tiket">Tiket 🎫</option>
                                            <option value="Bensin">Bensin ⛽</option>
                                            <option value="Hotel">Hotel 🏨</option>
                                            <option value="Belanja">Belanja 🛍️</option>
                                            <option value="Lainnya">Lainnya 💰</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">▼</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Dibayar Oleh
                                </label>
                                <input 
                                    name="paidBy" 
                                    placeholder="Contoh: Farial" 
                                    required 
                                    value={formData.paidBy} 
                                    onChange={handleInputChange} 
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setShowForm(false)} 
                            className="flex-1 py-3 rounded-lg border border-stroke text-gray-700 font-bold hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className={`flex-1 py-3 rounded-lg text-white font-bold shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 
                            ${activeTab === 'jadwal' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                            Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* --- LIST DATA --- */}
        {activeTab === "jadwal" ? (
            <div className="relative pl-8 space-y-8 border-l-2 border-gray-200 dark:border-gray-700 ml-4">
                {sortedItineraries.length === 0 && <div className="text-gray-400 italic pl-2 py-4">Belum ada kegiatan untuk tanggal ini.</div>}
                {sortedItineraries.map((item) => (
                    <div key={item.id} className="relative group">
                        {/* Dot Connector */}
                        <div className={`absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-white dark:border-gray-900 ${item.status === 'Done' ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                        
                        <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all ${item.status === 'Done' ? 'opacity-60 grayscale' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg text-sm">{item.time_start}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => item.id && toggleItineraryStatus(item.id, item.status)} className="text-xs font-bold uppercase tracking-wider text-green-600 hover:bg-green-50 px-2 py-1 rounded transition dark:text-green-400 dark:hover:bg-green-900/20">
                                        {item.status === 'Done' ? 'Selesai ✓' : 'Tandai Selesai'}
                                    </button>
                                    <button onClick={() => item.id && deleteItinerary(item.id)} className="text-gray-400 hover:text-red-500 px-2 dark:text-gray-500 dark:hover:text-red-400">🗑️</button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{item.activity_name}</h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-3">
                                <span className="flex items-center gap-1 font-medium">📍 {item.city_name}</span>
                                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{item.location_type}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {expenses.length === 0 && <div className="text-center text-gray-400 italic py-4">Belum ada pengeluaran.</div>}
                {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                        <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mr-4 dark:bg-orange-900/20 dark:text-orange-400 flex-shrink-0">
                            {exp.category === 'Makan' ? '🍔' : exp.category === 'Bensin' ? '⛽' : '💸'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-white truncate">{exp.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Oleh: <span className="font-medium text-gray-700 dark:text-gray-300">{exp.paid_by}</span></p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="font-bold text-gray-800 dark:text-white text-lg">Rp {Number(exp.amount).toLocaleString('id-ID')}</div>
                            <button onClick={() => exp.id && deleteExpense(exp.id)} className="text-xs text-red-400 hover:text-red-600 mt-1 dark:text-red-500 dark:hover:text-red-400">Hapus Data</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}