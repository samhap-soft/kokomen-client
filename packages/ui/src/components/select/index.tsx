import { ChevronDown, Check, Search } from "lucide-react";
import { FC, useState, useRef, useEffect, useCallback, useMemo } from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  size?: "small" | "medium" | "large";
  error?: boolean;
  errorMessage?: string;
  className?: string;
  "aria-label"?: string;
  multiSelect?: boolean;
}

const Select: FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "선택해주세요",
  disabled = false,
  searchable = false,
  size = "medium",
  error = false,
  errorMessage,
  className = "",
  "aria-label": ariaLabel,
  multiSelect = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 선택된 옵션 찾기
  const selectedOption = multiSelect
    ? options.filter((option) => (value as string[]).includes(option.value))
    : options.find((option) => option.value === value);

  // 검색 필터링된 옵션들
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOptionLabel = useMemo(() => {
    if (selectedOption) {
      if (Array.isArray(selectedOption)) {
        if (selectedOption.length === 0) {
          return placeholder;
        } else if (selectedOption.length === 1) {
          return selectedOption[0].label;
        } else {
          return `${selectedOption[0].label} 외 ${selectedOption.length - 1}개`;
        }
      } else {
        return selectedOption.label ?? placeholder;
      }
    }
    return placeholder;
  }, [selectedOption, placeholder]);

  // 사이즈별 스타일 클래스
  const sizeClasses = {
    small: "text-sm px-3 py-1.5",
    medium: "text-sm px-4 py-2",
    large: "text-base px-4 py-3"
  };

  // 드롭다운 토글
  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  }, [disabled, isOpen, searchable]);

  // 옵션 선택
  const handleOptionSelect = useCallback(
    (option: SelectOption) => {
      if (!option.disabled) {
        onChange?.(option.value);
        if (!multiSelect) {
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
        }
      }
    },
    [onChange]
  );

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          toggleDropdown();
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[focusedIndex]);
          }
          break;
      }
    },
    [isOpen, filteredOptions, focusedIndex, handleOptionSelect, toggleDropdown]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 포커스된 아이템으로 스크롤
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[
        focusedIndex
      ] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  return (
    <div className={`relative ${className}`}>
      {/* Select Trigger */}
      <div
        ref={selectRef}
        className={`
          relative w-full bg-bg-elevated border rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${sizeClasses[size]}
          ${
            error
              ? "border-error hover:border-error-hover focus-within:border-error-hover"
              : "border-border hover:border-primary-border focus-within:border-primary-border"
          }
          ${
            disabled
              ? "bg-bg-container-disabled cursor-not-allowed opacity-60"
              : "hover:shadow-sm focus-within:shadow-sm"
          }
          ${isOpen ? "ring-2 ring-primary-bg" : ""}
        `}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-describedby={error && errorMessage ? "select-error" : undefined}
      >
        {/* 선택된 값 또는 플레이스홀더 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-text-primary truncate">
              {selectedOptionLabel}
            </span>
          </div>
          <ChevronDown
            className={`
              w-4 h-4 transition-transform duration-200
              ${isOpen ? "rotate-180" : ""}
              ${error ? "text-error" : "text-text-tertiary"}
            `}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg-elevated border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* 검색 입력 */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="검색..."
                  className="w-full pl-10 pr-3 py-2 text-sm bg-transparent border-none outline-none text-text-primary placeholder-text-placeholder"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsOpen(false);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* 옵션 리스트 */}
          <ul ref={listRef} className="max-h-48 overflow-y-auto" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-sm text-text-tertiary text-center">
                {searchable && searchTerm
                  ? "검색 결과가 없습니다"
                  : "옵션이 없습니다"}
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`
                    flex items-center justify-between px-4 py-2 cursor-pointer
                    transition-colors duration-150 active:bg-primary-light
                    ${index === focusedIndex ? "bg-primary-bg" : "hover:bg-fill-content"}
                    ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                    ${option.value === value ? "bg-primary-bg text-primary-light hover:bg-primary-bg-hover" : "text-text-primary"}
                    ${multiSelect && (value as string[]).includes(option.value) ? "bg-primary-bg text-primary-light hover:bg-primary-bg-hover" : "text-text-primary"}
                  `}
                  onClick={() => handleOptionSelect(option)}
                  onMouseDown={(e) => e.stopPropagation()}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && errorMessage && (
        <div id="select-error" className="mt-1 text-sm text-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export { Select };
export type { SelectProps, SelectOption };
