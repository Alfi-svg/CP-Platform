"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");

  const login = async () => {
    await supabase.auth.signInWithOtp({
      email,
    });
    alert("Check your email!");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <h1 className="text-2xl mb-4">Login</h1>

        <input
          className="border p-2"
          placeholder="Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <button
          onClick={login}
          className="bg-blue-500 text-white p-2 ml-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}
