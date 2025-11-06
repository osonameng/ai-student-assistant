"use client";

import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const user = useUser();

  return (
    <header className="w-full border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        {user ? (
          // When logged in → logo disabled (not clickable)
          <div className="font-semibold text-xl flex items-center gap-2 text-emerald-500 select-none cursor-default">
            <span className="text-2xl">📘</span>
            <span>StudyMate.ai</span>
          </div>
        ) : (
          // When logged out → clickable logo with hover animation
          <Link
            href="/"
            className="font-semibold text-xl flex items-center gap-2 text-emerald-500 transition-transform hover:scale-105 hover:text-emerald-400"
          >
            <span className="text-2xl">📘</span>
            <span>StudyMate.ai</span>
          </Link>
        )}

        {/* Auth Buttons */}
        {showAuthButtons && !user && (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
              >
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-500 transition-all">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}