"use client";

import { JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

/**
 * Navigation bar component.
 */
export function Navbar(): JSX.Element {
  const { token, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = (): void => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          URL Shortener
        </Link>
        <div className="flex space-x-4 items-center">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : token ? (
            <>
              <Link
                href="/urls"
                className="text-gray-700 hover:text-indigo-600"
              >
                My URLs
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-gray-700 hover:text-indigo-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
