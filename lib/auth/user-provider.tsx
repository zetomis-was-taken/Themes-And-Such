"use client";

import { useHydrateAtoms } from "jotai/utils";
import { userAtom } from "@/lib/auth/atom";
import type { SafeUser } from "@/lib/db/schema";

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser: SafeUser | null;
  children: React.ReactNode;
}) {
  useHydrateAtoms([[userAtom, initialUser]]);
  return <>{children}</>;
}
