"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  useEffect(() => {
    const fetchActiveDates = async () => {
      try {
        const dates = new Set<string>();
        const itinSnap = await getDocs(collection(db, "itineraries"));
        itinSnap.forEach(doc => {
            const data = doc.data();
            if (data.dateString) dates.add(data.dateString);
        });
        const expSnap = await getDocs(collection(db, "expenses"));
        expSnap.forEach(doc => {
            const data = doc.data();
            if (data.dateString) dates.add(data.dateString);
        });
        setActiveDates(dates);
      } catch (error) {
        console.error("Gagal memuat data kalender:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveDates();
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;
    router.push(`/timeline/${dateString}`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Timeline Liburan 🗓️
        </h2>
        <nav>
          <ol className="flex items-center gap-2 text-sm">
            <li><Link className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white" href="/">Dashboard</Link></li>
            <li className="font-medium text-primary">/ Timeline</li>
          </ol>
        </nav>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header Bulan */}
        <div className="flex items-center justify-between border-b border-stroke p-4 dark:border-strokedark sm:p-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-black dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
                <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded bg-gray hover:bg-opacity-90 dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90 transition">
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" /></svg>
                </button>
                <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded bg-gray hover:bg-opacity-90 dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90 transition">
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" /></svg>
                </button>
            </div>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-primary hover:underline">
            Hari Ini
          </button>
        </div>

        {/* Legend */}
        <div className="flex justify-end px-6 py-2 gap-4 text-xs bg-gray-50 dark:bg-meta-4/20 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-500 dark:text-gray-300">Ada Kegiatan/Biaya</span>
            </div>
        </div>

        {/* Tabel Kalender */}
        <table className="w-full">
          <thead>
            {/* Header Hari (Min, Sen, Sel...) */}
            <tr className="grid grid-cols-7 bg-primary text-white">
              {dayNames.map((day, index) => (
                <th key={index} className="flex h-12 items-center justify-center text-xs font-semibold sm:text-base border-r border-white/10 last:border-r-0">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="grid grid-cols-7">
              {/* Offset Hari Kosong */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <td key={`empty-${index}`} className="h-20 border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4/30 md:h-32"></td>
              ))}

              {/* Tanggal */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                const hasEvent = activeDates.has(dateKey);

                return (
                  <td
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`relative h-20 cursor-pointer border border-stroke transition md:h-32
                        dark:border-strokedark 
                        ${isToday 
                            ? "bg-blue-50 dark:bg-meta-4" 
                            : hasEvent 
                                ? "bg-blue-50/30 hover:bg-gray-100 dark:bg-boxdark dark:hover:bg-meta-4" 
                                : "hover:bg-gray-50 dark:hover:bg-meta-4"
                        }
                    `}
                  >
                    <div className="flex flex-col h-full p-2">
                      <span className={`font-bold text-sm h-7 w-7 flex items-center justify-center rounded-full 
                        ${isToday 
                            ? "bg-primary text-white shadow-md" 
                            : "text-gray-700 dark:text-gray-300" // Warna angka tanggal fix dark mode
                        }`}>
                        {day}
                      </span>
                      
                      {hasEvent && (
                        <div className="mt-auto">
                            <div className="hidden md:block bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded border border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800 truncate text-center">
                                Terisi ✓
                            </div>
                            <div className="md:hidden flex justify-center mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            </div>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}