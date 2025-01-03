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
    <nav className="sm:hidden flex w-auto items-center justify-between">
      <div className="flex gap-8">
        {/* <SearchIcon className="size-6" /> */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <MenuIcon className="size-6" />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed bg-background top-0 left-0 flex overflow-y-auto w-screen h-screen">
              <Dialog.Content className="p-6 w-full flex flex-col">
                <Dialog.Title className="hidden">Menu</Dialog.Title>

                <header className="text-nav flex justify-between items-center pb-6">
                  {logo}
                  <div className="flex flex-row gap-8">
                    {/* <SearchIcon className="size-6" /> */}
                    <Dialog.Close>
                      <X className="size-6" />
                    </Dialog.Close>
                  </div>
                </header>

                <div className="flex flex-col justify-between pt-6 pb-8 h-full">
                  <ol
                    className="flex flex-col gap-8 text-nav text-sm"
                    onClick={() => setOpen(false)}
                  >
                    {children}
                  </ol>
                  <footer>{footer}</footer>
                </div>
              </Dialog.Content>
            </Dialog.Overlay>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </nav>
  );
};
