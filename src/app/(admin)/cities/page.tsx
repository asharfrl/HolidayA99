"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { addCity, deleteCity, subscribeCities, City } from "@/services/cityService";

export default function CitiesPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");

  // Cek Role Admin
  useEffect(() => {
    const role = Cookies.get("auth_role");
    if (role !== "admin") {
      alert("Akses ditolak. Halaman ini khusus Admin.");
      router.push("/");
    }
  }, [router]);

  // Load Data Kota
  useEffect(() => {
    const unsubscribe = subscribeCities((data) => {
      setCities(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Mohon isi nama kota.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCity(name);
      setName(""); // Reset Form
      alert("Berhasil menambahkan kota!");
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan kota. Cek koneksi internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kota ini?")) {
      try {
        await deleteCity(id);
      } catch (error) {
        alert("Gagal menghapus kota.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Kelola Data Kota 🏙️
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Daftar kota tujuan liburan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* KOLOM KIRI: Form Tambah */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sticky top-24">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
              Tambah Kota Baru
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Kota
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Yogyakarta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Kota"}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: List Kota */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white">Daftar Kota ({cities.length})</h3>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Memuat data...</div>
            ) : cities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Belum ada kota yang ditambahkan.</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {cities.map((city) => (
                  <li key={city.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            🏙️
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{city.name}</span>
                    </div>
                    <button
                        onClick={() => city.id && handleDelete(city.id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        title="Hapus Kota"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}