'use client'
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import { Toaster } from "@/components/ui/sonner";
import './globals.css';

function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-inter">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem
          storageKey="app-theme"
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;