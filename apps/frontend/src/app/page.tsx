"use client";

import React, { FormEvent, JSX, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../lib/api";
import { API_BASE_URL } from "@/lib/constants";

/**
 * Home page component for URL shortening.
 */
export default function Home(): JSX.Element {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [url, setUrl] = useState<string>("");
  const [shortUrl, setShortUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!token) {
      toast.error("You must be logged in to create a short URL.");
      return;
    }

    if (!url.trim()) {
      toast.error("URL is required.");
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    setIsLoading(true);
    setShortUrl("");

    try {
      const data = await apiService.createShortUrl(formattedUrl, token);

      setShortUrl(
        API_BASE_URL ? `${API_BASE_URL}/${data.slug}` : `/${data.slug}`
      );
      toast.success("URL shortened successfully!");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (): void => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard!");
  };

  if (isAuthLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        data-tooltip-id="global-tooltip"
        data-tooltip-content="Authenticating your session..."
      >
        <span
          data-tooltip-id="global-tooltip"
          data-tooltip-content="Loading the application..."
        >
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 pt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {token ? (
          <>
            <h1
              className="text-2xl font-bold text-center text-gray-800"
              data-tooltip-id="global-tooltip"
              data-tooltip-content="Paste your long URL below to create a short version."
            >
              Create a new Short URL
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="url"
                  className="text-sm font-medium text-gray-700"
                  data-tooltip-id="global-tooltip"
                  data-tooltip-content="The long URL you want to make shorter."
                >
                  Enter the URL to shorten
                </label>
                <input
                  id="url"
                  name="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com"
                  data-tooltip-id="global-tooltip"
                  data-tooltip-content="Input your long URL here."
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Click to generate your short URL."
              >
                {isLoading ? (
                  <span
                    data-tooltip-id="global-tooltip"
                    data-tooltip-content="Shortening your URL..."
                  >
                    Shortening...
                  </span>
                ) : (
                  <span
                    data-tooltip-id="global-tooltip"
                    data-tooltip-content="Submit to create a short URL."
                  >
                    Shorten
                  </span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h1
              className="text-2xl font-bold text-gray-800"
              data-tooltip-id="global-tooltip"
              data-tooltip-content="Welcome to the URL Shortener"
            >
              Welcome!
            </h1>
            <p
              className="mt-2 text-gray-600"
              data-tooltip-id="global-tooltip"
              data-tooltip-content="You need an account to shorten URLs and manage them."
            >
              Please{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:underline"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Go to the login page"
              >
                login
              </Link>{" "}
              or{" "}
              <Link
                href="/register"
                className="text-indigo-600 hover:underline"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Create a new account"
              >
                register
              </Link>{" "}
              to create a short URL.
            </p>
          </div>
        )}

        {shortUrl && (
          <div className="p-4 mt-4 text-center bg-green-100 border border-green-400 text-green-700 rounded-md">
            <p
              data-tooltip-id="global-tooltip"
              data-tooltip-content="Your shortened URL has been created."
            >
              Success! Here&apos;s your short URL:
            </p>
            <div className="flex items-center justify-center mt-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-indigo-600 hover:underline"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Click to visit your new short URL."
              >
                {shortUrl}
              </a>
              <button
                onClick={handleCopy}
                className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Copy the short URL to your clipboard."
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
