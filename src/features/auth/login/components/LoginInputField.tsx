
import React, { KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginInputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  endAdornment?: React.ReactNode;
}

export const LoginInputField: React.FC<LoginInputFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  autoComplete,
  error,
  disabled,
  required = false,
  endAdornment
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {endAdornment}
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={error ? "border-destructive" : ""}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
  );
};
