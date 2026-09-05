"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { UserIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { AccountMenu } from "./AccountMenu";
import { CredentialsForm } from "./CredentialsForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { useAccount } from "./provider";

type Mode = "login" | "signup" | "reset";

/**
 * The nav's account control: the trigger plus the dialog behind it. Which of
 * the three signed-out screens shows is local state, so moving between log in,
 * sign up and reset never leaves the dialog.
 */
export const AccountButton = ({ className }: { className?: string }) => {
  const t = useTranslations("account");
  const { account, isLoading } = useAccount();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reopening should always start from log in rather than wherever the last
    // visit left off.
    if (!isOpen) {
      setMode("login");
    }
  };

  // An account signed up with only an email has no name to show yet, so fall
  // back to the generic label rather than an empty button and a blank title.
  const accountLabel = account ? account.name || t("account") : null;

  const title =
    accountLabel ??
    (mode === "signup"
      ? t("signup")
      : mode === "reset"
        ? t("reset_password")
        : t("login"));

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        className={cn("flex items-center gap-2 text-sm text-nav", className)}
      >
        <UserIcon className="size-6" aria-hidden="true" />
        {/* The label names the button rather than an aria-label overriding it,
            so what a screen reader announces matches what is on screen. Until
            the session is known it stays generic and unseen: rendering "Log in"
            first would flash the wrong state at someone already signed in. */}
        <span className={cn("sr-only", !isLoading && "sm:not-sr-only")}>
          {isLoading ? t("account") : (accountLabel ?? t("login"))}
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 flex items-start justify-center overflow-y-auto bg-background/90 p-6">
          <Dialog.Content className="flex w-full max-w-sm flex-col gap-6 border border-muted bg-background p-6">
            <header className="flex items-center justify-between gap-4">
              <Dialog.Title className="text-lg">{title}</Dialog.Title>
              <Dialog.Close aria-label={t("close")}>
                <X className="size-5" />
              </Dialog.Close>
            </header>

            <Dialog.Description className="sr-only">{title}</Dialog.Description>

            {/* Same reason the label waits: opening before `me` answers would
                show the log-in form to someone already signed in. */}
            {isLoading ? null : account ? (
              <AccountMenu onSignedOut={() => setOpen(false)} />
            ) : mode === "reset" ? (
              <ResetPasswordForm onBack={() => setMode("login")} />
            ) : (
              <CredentialsForm
                mode={mode}
                onModeChange={setMode}
                onSignedIn={() => setOpen(false)}
              />
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
