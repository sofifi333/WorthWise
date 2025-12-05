/**
 * Institution Selector Component
 * Searchable combobox for selecting institutions
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

  // If we have a value but it's not in the current institutions list, try to find it
  // First check the query cache for any schools queries
  const queryClient = useQueryClient();
  const selectedInstitution = React.useMemo(() => {
    if (!value) return null;
    // Check if already in the current list
    const found = institutions.find(inst => inst.id === value);
    if (found) return found;
    
    // Try to find in query cache
    const cacheData = queryClient.getQueryData<InstitutionOption[]>(['schools', '']);
    if (cacheData) {
      const cached = cacheData.find(inst => inst.id === value);
      if (cached) return cached;
    }
    
    // Try other cache entries
    const allCacheData = queryClient.getQueriesData<InstitutionOption[]>({ queryKey: ['schools'] });
    for (const [, data] of allCacheData) {
      if (data) {
        const cached = data.find(inst => inst.id === value);
        if (cached) return cached;
      }
    }
    
    return null;
  }, [value, institutions, queryClient]);

  // Convert institutions to combobox options, including selected institution if not in list
  const options: ComboboxOption[] = useMemo(() => {
    const institutionList = [...institutions];
    // Add selected institution if it's not already in the list
    if (selectedInstitution && !institutionList.find(inst => inst.id === selectedInstitution.id)) {
      institutionList.push(selectedInstitution);
    }
    return institutionList.map((institution: InstitutionOption) => ({
      value: institution.id,
      label: institution.name,
      subtitle: `${institution.city}, ${institution.state_code} • ${institution.ownership_label}`
    }));
  }, [institutions, selectedInstitution]);

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
