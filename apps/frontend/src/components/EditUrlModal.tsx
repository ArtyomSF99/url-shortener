"use client";

import { JSX, useState, useEffect, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Url } from "../types";
import { apiService } from "../lib/api";
import { API_BASE_URL } from "../lib/constants";

/**
 * Modal component for editing a short URL slug.
 */
interface EditUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: Url | null;
  onUpdateSuccess: (updatedUrl: Url) => void;
}

export function EditUrlModal({
  isOpen,
  onClose,
  url,
  onUpdateSuccess,
}: EditUrlModalProps): JSX.Element | null {
  const [newSlug, setNewSlug] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { token } = useAuth();

  useEffect(() => {
    if (url) {
      setNewSlug(url.slug);
      setError("");
    }
  }, [url]);

  if (!isOpen || !url) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const updatedUrl = await apiService.updateSlug(url.id, newSlug, token);

      onUpdateSuccess(updatedUrl);
      
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayDomain = API_BASE_URL.replace(/^https?:\/\//, "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Slug</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700"
            >
              New Slug
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {displayDomain}/
              </span>
              <input
                type="text"
                id="slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
