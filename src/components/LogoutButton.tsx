"use client";

import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // or "/" if that’s your main login/signup screen
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
    >
      Logout
    </Button>
  );
}