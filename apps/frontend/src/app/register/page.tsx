'use client';

import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '../../components/AuthForm';
import { apiService } from '../../lib/api';

/**
 * Register page component.
 */
export default function RegisterPage(): JSX.Element {
  const router = useRouter();

  const handleRegister = async (email: string, password: string): Promise<void> => {
    await apiService.register({ email, password });

    router.push('/login');
  };

  return <AuthForm formType="register" onSubmit={handleRegister} />;
}