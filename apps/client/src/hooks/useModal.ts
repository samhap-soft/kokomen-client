import { useState } from "react";

export const useSidebar = (
  initialOpen = false
): {
  open: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
} => {
  const [open, setOpen] = useState(initialOpen);

  const openSidebar = (): void => setOpen(true);
  const closeSidebar = (): void => setOpen(false);
  const toggleSidebar = (): void => setOpen(!open);

  return {
    open,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
};
