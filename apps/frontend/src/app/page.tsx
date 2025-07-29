"use client";

import { JSX, useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../lib/api";

/**
 * Home page component for URL shortening.
 */
export default function Home(): JSX.Element {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [url, setUrl] = useState<string>("");
  const [shortUrl, setShortUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    
    if (!token) {
      setError("You must be logged in to create a short URL.");

      return;
    }

    setIsLoading(true);
    setError("");
    setShortUrl("");
    setIsCopied(false);

    try {
      const data = await apiService.createShortUrl(url, token);
      
      setShortUrl(`${window.location.origin}/${data.slug}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (): void => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);

    setIsCopied(true);

    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 pt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {token ? (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800">
              Create a new Short URL
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="url"
                  className="text-sm font-medium text-gray-700"
                >
                  Enter the URL to shorten
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {isLoading ? "Shortening..." : "Shorten"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Welcome!</h1>
            <p className="mt-2 text-gray-600">
              Please{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                login
              </Link>{" "}
              or{" "}
              <Link
                href="/register"
                className="text-indigo-600 hover:underline"
              >
                register
              </Link>{" "}
              to create a short URL.
            </p>
          </div>
        )}

        {shortUrl && (
          <div className="p-4 mt-4 text-center bg-green-100 border border-green-400 text-green-700 rounded-md">
            <p>Success! Here&apos;s your short URL:</p>
            <div className="flex items-center justify-center mt-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-indigo-600 hover:underline"
              >
                {shortUrl}
              </a>
              <button
                onClick={handleCopy}
                className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600"
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 mt-4 text-center bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
