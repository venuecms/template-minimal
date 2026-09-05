"use client";

import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";

import type { Account } from "@/lib/auth";

import { accountQueryOptions } from "./queries";

interface AccountContextType {
  /** The signed-in visitor, or null once we know there is no session. */
  account: Account | null;
  /** True until the first `me` answer lands, so the trigger can stay quiet. */
  isLoading: boolean;
  siteKey: string;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({
  siteKey,
  enabled,
  children,
}: PropsWithChildren<{
  siteKey: string;
  /**
   * Whether this site offers accounts at all. Sites that do not should never
   * pay for the `me` request, and by the schema's default most do not.
   */
  enabled: boolean;
}>) => {
  // Reading only: signing in and out write the new session into this same entry
  // themselves, so there is nothing here to refresh on their behalf.
  const { data, isPending } = useQuery({
    ...accountQueryOptions(siteKey),
    enabled,
  });

  const contextValue = useMemo(
    () => ({
      account: data ?? null,
      // A disabled query never resolves, which would otherwise read as
      // "loading" forever.
      isLoading: enabled && isPending,
      siteKey,
    }),
    [data, enabled, isPending, siteKey],
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};
