"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface DateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DateSelectionModal({ isOpen, onClose }: DateSelectionModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Menutup modal saat klik di luar area
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!isOpen || !modalRef.current) return;
      if (!modalRef.current.contains(target as Node)) {
        onClose();
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [isOpen, onClose]);

  // Menutup modal dengan tombol ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!isOpen || keyCode !== 27) return;
      onClose();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      router.push(`/timeline/${selectedDate}`);
      onClose();
    }
  };

  return (
    <div className="fixed left-0 top-0 z-[999999] flex h-full w-full items-center justify-center bg-black/80 px-4 py-5 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-2xl dark:bg-gray-800 md:px-10 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="pb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Pilih Tanggal Perjalanan 📅
        </h3>
        <span className="mx-auto mb-6 block h-1.5 w-16 rounded bg-brand-500"></span>
        
        <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Tentukan tanggal untuk melihat atau menambah rincian kegiatan.
        </p>


        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <div className="relative">
              {/* Input Date dengan Fix Dark Mode */}
              <input
                ref={dateInputRef}
                type="date"
                required
                value={selectedDate}
                // Trik agar area input bisa di-klik di seluruh bagian
                onClick={() => {
                  try {
                    if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
                        (dateInputRef.current as any).showPicker();
                    }
                  } catch (err) {}
                }}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ colorScheme: "light dark" }} // Memaksa browser menyesuaikan popup kalender
                className="w-full cursor-pointer rounded-xl border-2 border-gray-300 bg-transparent px-6 py-4 text-lg font-medium text-gray-900 outline-none transition focus:border-brand-500 active:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 min-h-[60px]"
              />
              
              {/* Icon Kalender (Visual Only) */}
              <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-center font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 p-3 text-center font-bold text-white transition hover:bg-brand-700 shadow-lg shadow-brand-500/30"
            >
              Buka Detail
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}