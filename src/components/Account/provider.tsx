"use client";

import { useQuery } from "@tanstack/react-query";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { type Account, getAccount } from "@/lib/auth";

interface AccountContextType {
  /** The signed-in visitor, or null once we know there is no session. */
  account: Account | null;
  /** True until the first `me` answer lands, so the trigger can stay quiet. */
  isLoading: boolean;
  /**
   * Re-reads the session after a sign-in or sign-out changes the cookie, and
   * resolves to what it found — the caller needs that to tell a sign-in that
   * took from one whose cookie never stuck.
   */
  refresh: () => Promise<Account | null>;
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
  const { data, isPending, refetch } = useQuery({
    queryKey: ["account", siteKey],
    queryFn: () => getAccount(siteKey),
    enabled,
    // Whether there is a session is a property of the visitor's cookie, not of
    // the site's content, so it must never be served from an earlier visitor's
    // cached answer the way the content queries are.
    staleTime: 0,
    gcTime: 0,
  });

  const refresh = useCallback(async () => {
    const { data: account } = await refetch();
    return account ?? null;
  }, [refetch]);

  const contextValue = useMemo(
    () => ({
      account: data ?? null,
      // A disabled query never resolves, which would otherwise read as
      // "loading" forever.
      isLoading: enabled && isPending,
      refresh,
      siteKey,
    }),
    [data, enabled, isPending, refresh, siteKey],
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
