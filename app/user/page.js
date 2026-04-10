"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/user/signin');
  }, [router]);

  return null;
}
