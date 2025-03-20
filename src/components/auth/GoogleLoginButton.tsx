'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export function GoogleLoginButton() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (result?.ok) {
        // Get the user's role from the session
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        const userRole = session?.user?.role;

        // Redirect based on role
        switch (userRole) {
          case 'ADMIN':
            router.push('/dashboard');
            break;
          case 'TEACHER':
            router.push('/teacher/dashboard');
            break;
          case 'STUDENT':
            router.push('/student/dashboard');
            break;
          case 'PARENT':
            router.push('/parent/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="w-5 h-5" />
      Continue with Google
    </Button>
  );
} 