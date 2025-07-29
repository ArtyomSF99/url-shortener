"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { AuthForm } from "../../components/AuthForm";
import { apiService } from "../../lib/api";

/**
 * Login page component.
 */
export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<void> => {
    const data = await apiService.login({ email, password });
    
    login(data.access_token);

    router.push("/");
  };

  return <AuthForm formType="login" onSubmit={handleLogin} />;
}
