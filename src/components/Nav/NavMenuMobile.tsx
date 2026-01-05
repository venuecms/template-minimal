"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { MenuIcon, SearchIcon, X } from "lucide-react";
import { ReactNode, useState } from "react";

export const NavMenuMobile = ({
  logo,
  children,
  footer,
}: {
  logo: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex w-auto items-center justify-between sm:hidden text-lg">
      <div className="flex gap-8">
        {/* <SearchIcon className="size-6" /> */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <MenuIcon className="size-6" />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed left-0 top-0 flex h-screen w-screen overflow-y-auto bg-background">
              <Dialog.Content className="flex w-full flex-col p-6">
                <Dialog.Title className="hidden">Menu</Dialog.Title>

                <header className="flex items-center justify-between pb-6 text-nav">
                  {logo}
                  <div className="flex flex-row gap-8">
                    {/* <SearchIcon className="size-6" /> */}
                    <Dialog.Close>
                      <X className="size-8" />
                    </Dialog.Close>
                  </div>
                </header>

                <div className="flex h-full flex-col justify-between pb-16 pt-6">
                  <ol
                    className="flex flex-col gap-8 text-nav"
                    onClick={() => setOpen(false)}
                  >
                    {children}
                  </ol>
                  <footer className="text-sm">{footer}</footer>
                </div>
              </Dialog.Content>
            </Dialog.Overlay>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </nav>
  );
};
