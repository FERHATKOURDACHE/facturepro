"use client";

import { signIn } from "next-auth/react";

type GoogleOAuthButtonProps = {
  label: string;
};

export function GoogleOAuthButton({ label }: GoogleOAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        void signIn("google", {
          redirectTo: "/dashboard",
        });
      }}
      className="mt-6 flex w-full justify-center rounded-full border border-slate-200 bg-white px-6 py-4 font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
