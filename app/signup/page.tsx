"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const signup = async () => {
    const { error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup success! Now login.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl">
        Signup
      </h1>

      <input
        placeholder="Email"
        className="border p-2 block my-2"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 block my-2"
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <button
        onClick={signup}
        className="bg-green-500 text-white px-4 py-2"
      >
        Sign Up
      </button>
    </div>
  );
}
