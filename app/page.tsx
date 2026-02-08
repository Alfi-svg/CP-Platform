"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } =
      await supabase.auth.getSession();

    if (data.session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      Loading...
    </div>
  );
}
