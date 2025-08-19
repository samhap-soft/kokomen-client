import { useEffect, useRef, useState } from "react";

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
    toggleSidebar
  };
};

export const useModal = (
  initialOpen = false,
  backgroundClickToClose = false
): {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  modalRef: React.RefObject<HTMLDivElement>;
} => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = (): void => setIsOpen(true);
  const closeModal = (): void => setIsOpen(false);
  const toggleModal = (): void => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        backgroundClickToClose
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    modalRef
  };
};
