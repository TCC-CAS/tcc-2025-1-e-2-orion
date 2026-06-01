'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/account/profile');
        if (res.status === 'OK') {
          setAuthorized(true);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  if (!authorized) {
    return null; // Retorna nada enquanto redireciona ou valida
  }

  return <>{children}</>;
}
