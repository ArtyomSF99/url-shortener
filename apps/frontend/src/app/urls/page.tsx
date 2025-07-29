"use client";

import { useEffect, useState, useCallback, JSX } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { EditUrlModal } from "../../components/EditUrlModal";
import { apiService } from "../../lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { SortByType, Url } from "@/types";

export default function UrlsPage(): JSX.Element {
  const { token, isLoading: isAuthLoading } = useAuth();

  const [urls, setUrls] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortByType>("createdAt");

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUrl, setSelectedUrl] = useState<Url | null>(null);

  const fetchUrls = useCallback(async () => {
    if (!token) {
      setIsLoading(false);

      return;
    }

    setIsLoading(true);

    try {
      const data = await apiService.getMyLinks(token, currentPage, sortBy);
      
      setUrls(data.data);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, sortBy]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchUrls();
    }
  }, [token, isAuthLoading, fetchUrls]);

  const handleOpenModal = (url: Url) => {
    setSelectedUrl(url);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUrl(null);
    setIsModalOpen(false);
  };

  const handleUpdateSuccess = (updatedUrl: Url) => {
    setUrls((currentUrls) =>
      currentUrls.map((u) => (u.id === updatedUrl.id ? updatedUrl : u))
    );
  };

  const handleReload = () => {
    fetchUrls();
  };

  if (isLoading || isAuthLoading) {
    return (
      <main className="container mx-auto p-8 text-center pt-24">
        Loading...
      </main>
    );
  }

  if (!token) {
    return (
      <main className="container mx-auto p-8 text-center pt-24">
        <p>
          Please{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            login
          </Link>{" "}
          to see your URLs.
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto p-8 pt-24">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Shortened URLs</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sort by:</span>
            <button
              onClick={() => setSortBy("createdAt")}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === "createdAt"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy("visits")}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === "visits" ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              Most Visited
            </button>
            <button
              onClick={handleReload}
              className={`px-3 py-1 text-sm rounded-md bg-gray-300 hover:bg-gray-400 transition-transform duration-300 ${
              isLoading ? "animate-spin" : ""
              }`}
              title="Reload URLs"
              type="button"
              disabled={isLoading}
            >
              <span
              className={`inline-block transition-transform duration-300 ${
                isLoading ? "animate-spin" : ""
              }`}
              style={{ display: "inline-block" }}
              >
              &#10227;
              </span>
            </button>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {urls.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 text-left">Short URL</th>
                    <th className="py-2 px-4 text-left">Original URL</th>
                    <th className="py-2 px-4 text-left">Visits</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url.id} className="border-b">
                      <td className="py-2 px-4">
                        <a
                          href={`${API_BASE_URL}/${url.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {`${API_BASE_URL}/${url.slug}`}
                        </a>
                      </td>
                      <td className="py-2 px-4 truncate max-w-md">
                        {url.originalUrl}
                      </td>
                      <td className="py-2 px-4">{url.visits}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleOpenModal(url)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          !error && <p>You haven&apos;t created any URLs yet.</p>
        )}
      </main>

      <EditUrlModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        url={selectedUrl}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </>
  );
}
