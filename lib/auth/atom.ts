import { atom } from "jotai";
import type { SafeUser } from "@/lib/db/schema";

export const userAtom = atom<SafeUser | null | undefined>(undefined);
