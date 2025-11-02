/**
 * Institution Selector Component
 * Searchable combobox for selecting institutions
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { optionsApi } from '@/lib/api';
import { InstitutionOption } from '@/types/api';

interface InstitutionSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InstitutionSelector({
  value,
  onValueChange,
  placeholder = "Search for an institution...",
  disabled = false,
  className
}: InstitutionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch institutions with search
  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ['schools', searchQuery],
    queryFn: () => optionsApi.getSchools({ 
      search: searchQuery || undefined,
      limit: searchQuery ? 50 : 20  // More results when searching
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert institutions to combobox options
  const options: ComboboxOption[] = useMemo(() => 
    institutions.map((institution: InstitutionOption) => ({
      value: institution.id,
      label: institution.name,
      subtitle: `${institution.city}, ${institution.state_code} • ${institution.ownership_label}`
    })),
    [institutions]
  );

  const handleValueChange = (newValue: string | number) => {
    onValueChange(Number(newValue));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={handleValueChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      searchPlaceholder="Type to search institutions..."
      emptyMessage={searchQuery ? "No institutions found" : "Start typing to search"}
      loading={isLoading}
      disabled={disabled}
      className={className}
    />
  );
}
