'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabse';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }

    checkAuth();
  }, [router]);

  return null; // or a loading spinner if you want
}
