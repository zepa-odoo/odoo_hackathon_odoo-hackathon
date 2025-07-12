"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  );
} 