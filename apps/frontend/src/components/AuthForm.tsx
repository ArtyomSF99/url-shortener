"use client";

import { JSX, useState, FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";

/**
 * Authentication form component for login and registration.
 */
interface AuthFormProps {
  formType: "login" | "register";
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function AuthForm({ formType, onSubmit }: AuthFormProps): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    // Simple frontend validation for email and password
    if (!email.trim()) {
      setError("Email is required.");
      toast.error("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      toast.error("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await onSubmit(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = formType === "login";
  const title = isLogin ? "Sign in to your account" : "Create a new account";
  const buttonText = isLogin ? "Sign in" : "Register";
  const loadingText = isLogin ? "Signing in..." : "Registering...";
  const linkText = isLogin
    ? "Not a member? Sign up now"
    : "Already have an account? Sign in";
  const linkHref = isLogin ? "/register" : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 pt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">{title}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isLoading ? loadingText : buttonText}
          </button>
        </form>

        <p className="text-center text-sm">
          <Link
            href={linkHref}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {linkText}
          </Link>
        </p>
      </div>
    </main>
  );
}
