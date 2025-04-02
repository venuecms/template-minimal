import { InputHTMLAttributes, useState } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  initialValue?: string;
  onChange?: (value: string) => void;
}

export const Input = ({ initialValue, onChange, ...props }: InputProps) => {
  const { className, ...rest } = props;
  const [value, setValue] = useState(initialValue || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    if (onChange) {
      onChange(inputValue);
    }
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      className={cn(
        "h-6 border border-muted bg-transparent p-1 text-primary outline-transparent",
        className,
      )}
      {...rest}
    />
  );
};
