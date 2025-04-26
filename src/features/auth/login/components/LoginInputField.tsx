
import React, { KeyboardEvent } from 'react';
import { Label } from '@/components/ui/label';

export interface LoginInputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const LoginInputField: React.FC<LoginInputFieldProps> = ({
  id,
  label,
  type,
  value,
  placeholder,
  autoComplete,
  error,
  disabled = false,
  onChange,
  onBlur,
  onKeyDown,
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          error ? "border-destructive" : "border-input"
        }`}
        disabled={disabled}
        required
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-destructive text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
