"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image"; // Import Image
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAnonymously } from "firebase/auth"; // PENTING: Login ke Firebase
import { auth } from "@/lib/firebase"; 

// Helper cookie manual (tetap dipertahankan sesuai request)
function setAuthCookie(role: string, days: number) {
  if (typeof document !== 'undefined') {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = "auth_role=" + role + ";" + expires + ";path=/";
  }
}

export default function SignInForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let role = "";
      // 1. Cek Password
      if (password === "aswier99") {
        role = "user";
      } else if (password === "admin99") {
        role = "admin";
      } else {
        throw new Error("Password salah! Silakan coba lagi.");
      }

      // 2. Login ke Firebase (WAJIB agar data muncul)
      await signInAnonymously(auth);

      // 3. Set Cookie & Redirect
      setAuthCookie(role, 7);
      router.push("/");

    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.message.includes("Password salah")) {
        setError(err.message);
      } else {
        setError("Gagal login ke database. Cek koneksi internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            {/* LOGO DI TENGAH */}
            <div className="mb-6 flex justify-center w-full">
                <Image
                  className="dark:hidden"
                  src="/images/logo/a99.png"
                  alt="Logo A99"
                  width={180} // Ukuran sedikit diperbesar agar proporsional
                  height={50}
                  style={{ height: 'auto', width: 'auto' }}
                  priority
                />
                <Image
                  className="hidden dark:block"
                  src="/images/logo/a99-dark.png"
                  alt="Logo A99"
                  width={180}
                  height={50}
                  style={{ height: 'auto', width: 'auto' }}
                  priority
                />
            </div>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Masukkan password untuk masuk ke dashboard.
            </p>
          </div>
          
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                
                {/* Input Password */}
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Pesan Error */}
                {error && (
                  <p className="text-sm text-error-500 text-center animate-pulse">
                    {error}
                  </p>
                )}

                {/* Tombol Submit */}
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Menghubungkan..." : "Masuk"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}