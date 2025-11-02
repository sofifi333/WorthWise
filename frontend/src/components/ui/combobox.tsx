/**
 * Combobox Component
 * Searchable dropdown for large datasets like institutions
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string | number;
  label: string;
  subtitle?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  onSearch,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  loading = false,
  disabled = false,
  className
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (option.subtitle && option.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);
    
    // Call external search handler if provided
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle option selection
  const handleSelect = (option: ComboboxOption) => {
    onValueChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={inputRef}>
      {/* Input Field */}
      <div
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <input
          type="text"
          className="flex-1 bg-transparent outline-none cursor-pointer"
          placeholder={isOpen ? searchPlaceholder : (selectedOption?.label || placeholder)}
          value={isOpen ? searchQuery : (selectedOption?.label || '')}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={!isOpen}
        />
        <div className="flex items-center">
          {loading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          )}
          <svg
            className={cn(
              "h-4 w-4 transition-transform text-muted-foreground",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
          <ul
            ref={listRef}
            className="max-h-60 overflow-auto py-1"
            role="listbox"
          >
            {loading ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    index === highlightedIndex && "bg-accent text-accent-foreground",
                    option.value === value && "bg-primary/10 font-medium"
                  )}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.subtitle && (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {option.subtitle}
                      </span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
