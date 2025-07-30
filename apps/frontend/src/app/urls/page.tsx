"use client";

import { useEffect, useState, useCallback, JSX } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
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
          <h1
            className="text-2xl font-bold"
            data-tooltip-id="global-tooltip"
            data-tooltip-content="My Shortened URLs"
          >
            My Shortened URLs
          </h1>
          <div className="flex items-center space-x-2">
            <span
              className="text-sm font-medium"
              data-tooltip-id="global-tooltip"
              data-tooltip-content="Sort your links by creation date or number of visits"
            >
              Sort by:
            </span>
            <button
              onClick={() => setSortBy("createdAt")}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === "createdAt"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200"
              }`}
              data-tooltip-id="global-tooltip"
              data-tooltip-content="Sort by newest links"
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy("visits")}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === "visits" ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
              data-tooltip-id="global-tooltip"
              data-tooltip-content="Sort by most visited links"
            >
              Most Visited
            </button>
            <button
              onClick={handleReload}
              data-tooltip-id="global-tooltip"
              data-tooltip-content="Reload URLs"
              className="px-3 py-1 text-sm rounded-md bg-gray-300 hover:bg-gray-400"
              type="button"
              disabled={isLoading}
            >
              <FiRefreshCw
                className={`inline-block ${isLoading ? "animate-spin" : ""}`}
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Reload"
              />
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
                    <th
                      className="py-2 px-4 text-left"
                      data-tooltip-id="global-tooltip"
                      data-tooltip-content="Your short link"
                    >
                      Short URL
                    </th>
                    <th
                      className="py-2 px-4 text-left"
                      data-tooltip-id="global-tooltip"
                      data-tooltip-content="The original long URL"
                    >
                      Original URL
                    </th>
                    <th
                      className="py-2 px-4 text-end"
                      data-tooltip-id="global-tooltip"
                      data-tooltip-content="Number of visits"
                    >
                      Visits
                    </th>
                    <th
                      className="py-2 px-4 text-center"
                      data-tooltip-id="global-tooltip"
                      data-tooltip-content="Edit your link"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url.id} className="border-b">
                      <td
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content={`${API_BASE_URL}/${url.slug}`}
                        className="py-2 px-4"
                      >
                        <a
                          href={`${API_BASE_URL}/${url.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                          data-tooltip-id="global-tooltip"
                          data-tooltip-content="Open short URL in new tab"
                        >
                          {`${API_BASE_URL}/${url.slug}`}
                        </a>
                      </td>
                      <td
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content={url.originalUrl}
                        className="py-2 px-4 truncate max-w-md"
                      >
                        {url.originalUrl}
                      </td>
                      <td
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content={String(url.visits)}
                        className="py-2 px-4 text-end"
                      >
                        {url.visits}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={() => handleOpenModal(url)}
                          className="text-indigo-600 hover:text-indigo-900"
                          data-tooltip-id="global-tooltip"
                          data-tooltip-content="Edit this link's slug"
                        >
                          <FaPencilAlt />
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
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Previous page"
              >
                Previous
              </button>
              <span
                className="text-sm"
                data-tooltip-id="global-tooltip"
                data-tooltip-content={`Current page: ${currentPage} of ${totalPages}`}
              >
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 disabled:opacity-50"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Next page"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          !error && (
            <p
              data-tooltip-id="global-tooltip"
              data-tooltip-content="You haven't created any URLs yet."
            >
              You haven&apos;t created any URLs yet.
            </p>
          )
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
