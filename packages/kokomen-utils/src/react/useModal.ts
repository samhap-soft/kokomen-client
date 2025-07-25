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

export const useModal = (
  initialOpen = false
): {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
} => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openModal = (): void => setIsOpen(true);
  const closeModal = (): void => setIsOpen(false);
  const toggleModal = (): void => setIsOpen(!isOpen);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};
