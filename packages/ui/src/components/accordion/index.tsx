import { cn } from "../../utils/index.ts";
import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  ReactNode,
  ButtonHTMLAttributes,
  HTMLAttributes
} from "react";

interface AccordionContextType {
  activeKeys: string | number | null | (string | number)[];
  toggleItem: (itemKey: string | number) => void;
  allowMultiple: boolean;
  getItemState: (itemKey: string | number) => {
    isOpen: boolean;
    disabled: boolean;
  };
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "AccordionTrigger and AccordionContent must be used within an AccordionItem, which must be inside an Accordion"
    );
  }
  return context;
}

interface AccordionItemContextType {
  itemKey: string | number;
  isOpen: boolean;
  disabled: boolean;
  headerId: string;
  panelId: string;
  toggleOpen: () => void;
}

const AccordionItemContext = createContext<
  AccordionItemContextType | undefined
>(undefined);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      "AccordionTrigger and AccordionContent must be used within an AccordionItem"
    );
  }
  return context;
}

interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultActiveKey?: string | number | (string | number)[];
  disabledKeys?: Record<string | number, boolean>;
}

export function Accordion({
  children,
  allowMultiple = false,
  defaultActiveKey,
  disabledKeys = {},
  className,
  ...props
}: AccordionProps & HTMLAttributes<HTMLDivElement>) {
  const [activeKeys, setActiveKeys] = useState<
    string | number | null | (string | number)[]
  >(() => {
    if (allowMultiple) {
      return Array.isArray(defaultActiveKey)
        ? defaultActiveKey
        : defaultActiveKey !== undefined
          ? [defaultActiveKey]
          : [];
    }
    return defaultActiveKey !== undefined ? defaultActiveKey : null;
  });

  const toggleItem = (itemKey: string | number) => {
    if (disabledKeys[itemKey]) return; // 비활성화된 아이템은 토글하지 않음

    if (allowMultiple) {
      setActiveKeys((prevKeys) => {
        const currentKeys = prevKeys as (string | number)[];
        return currentKeys.includes(itemKey)
          ? currentKeys.filter((key) => key !== itemKey)
          : [...currentKeys, itemKey];
      });
    } else {
      setActiveKeys((prevKey) => (prevKey === itemKey ? null : itemKey));
    }
  };

  const getItemState = (itemKey: string | number) => {
    const isOpen = allowMultiple
      ? (activeKeys as (string | number)[]).includes(itemKey)
      : activeKeys === itemKey;
    const disabled = !!disabledKeys[itemKey];
    return { isOpen, disabled };
  };

  const contextValue: AccordionContextType = {
    activeKeys,
    toggleItem,
    allowMultiple,
    getItemState
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn(`rounded-md divide-y`, className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  itemKey: string | number;
  children: ReactNode; // 이제 AccordionTrigger와 AccordionPanel/Content를 자식으로 받음
  disabled?: boolean; // 개별 아이템에 대한 disabled prop
}

export function AccordionItem({
  itemKey,
  children,
  disabled: itemDisabledProp = false, // AccordionItem에 직접 전달된 disabled
  className,
  ...props
}: AccordionItemProps & HTMLAttributes<HTMLDivElement>) {
  const { toggleItem, getItemState } = useAccordionContext();

  const { isOpen: contextIsOpen, disabled: contextDisabled } =
    getItemState(itemKey);
  const isDisabled = itemDisabledProp || contextDisabled; // Accordion의 disabledKeys와 Item의 disabled prop 중 하나라도 true면 disabled

  const isOpen = contextIsOpen && !isDisabled; // 비활성화 상태면 열리지 않음

  const headerId = `accordion-header-${itemKey}`;
  const panelId = `accordion-panel-${itemKey}`;

  const toggleOpen = () => {
    if (!isDisabled) {
      toggleItem(itemKey);
    }
  };

  const itemContextValue: AccordionItemContextType = {
    itemKey,
    isOpen,
    disabled: isDisabled,
    headerId,
    panelId,
    toggleOpen
  };

  return (
    <AccordionItemContext.Provider value={itemContextValue}>
      <div
        className={cn(
          `${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const { isOpen, disabled, headerId, panelId, toggleOpen } =
    useAccordionItemContext();

  return (
    <h2>
      <button
        type="button"
        id={headerId}
        className={`flex items-center justify-between w-full p-4 text-left font-medium text-gray-700 bg-primary-bg-light hover:bg-primary-bg-hover focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 transition-colors duration-150 ease-in-out ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${isOpen ? "bg-primary-bg-hover" : ""} ${className || ""}`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-disabled={disabled}
        disabled={disabled}
        {...props}
      >
        {children}
        <svg
          className={`w-5 h-5 transform transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </h2>
  );
}

export function AccordionContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { isOpen, panelId, headerId } = useAccordionItemContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<string>("0px");

  const handleResize = () => {
    if (isOpen && panelRef.current) {
      setPanelHeight(`${panelRef.current.scrollHeight}px`);
    } else {
      setPanelHeight("0px");
    }
  };

  useEffect(() => {
    handleResize();
  }, [isOpen, children]);

  useEffect(() => {
    let observer: MutationObserver | null = null;

    if (panelRef.current) {
      observer = new MutationObserver(handleResize);
      observer.observe(panelRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isOpen]);

  return (
    <div
      id={panelId}
      ref={panelRef}
      role="region"
      aria-labelledby={headerId}
      className={cn(
        `overflow-hidden transition-[max-height] duration-300 ease-in-out`,
        className
      )}
      style={{ maxHeight: panelHeight }}
      {...props}
    >
      <div className="p-4 text-gray-600">{children}</div>
    </div>
  );
}
