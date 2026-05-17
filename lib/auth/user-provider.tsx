"use client";

import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { userAtom } from "@/lib/auth/atom";
import type { SafeUser } from "@/lib/db/schema";
import { ReactNode } from "react";

const HydrateAtoms = ({
  initialValues,
  children,
}: {
  initialValues: any;
  children: ReactNode;
}) => {
  useHydrateAtoms(initialValues);
  return <>{children}</>;
};

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser: SafeUser | null;
  children: ReactNode;
}) {
  return (
    <Provider>
      <HydrateAtoms initialValues={[[userAtom, initialUser]]}>
        {children}
      </HydrateAtoms>
    </Provider>
  );
}
