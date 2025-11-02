/**
 * Form Field Component
 * Wrapper for form inputs with label and optional description
 */

import { ReactNode } from 'react';
import { Label } from './ui/label';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  description?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, htmlFor, description, children, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-sm text-zinc-500">{description}</p>
      )}
    </div>
  );
}

