"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: FormDataEntryValue | null) {
  return String(email ?? "").trim().toLowerCase();
}

function normalizeString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function registerAction(formData: FormData) {
  const name = normalizeString(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = normalizeString(formData.get("password"));

  if (!name || !email || !password) {
    redirect("/inscription?error=missing_fields");
  }

  if (password.length < 8) {
    redirect("/inscription?error=password_too_short");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/inscription?error=email_already_used");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      plan: "FREE",
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/apres-connexion",
  });
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizeString(formData.get("password"));

  if (!email || !password) {
    redirect("/connexion?error=missing_fields");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/apres-connexion",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/connexion?error=invalid_credentials");
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/connexion",
  });
}

