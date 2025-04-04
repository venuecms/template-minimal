import { InputHTMLAttributes, forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  initialValue?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ initialValue, onChange, ...props }, ref) => {
    const { className, ...rest } = props;
    const [value, setValue] = useState(initialValue || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setValue(inputValue);

      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        ref={ref}
        value={value}
        onChange={handleChange}
        className={cn(
          "h-6 border border-muted bg-transparent p-1 text-primary outline-transparent",
          className,
        )}
        {...rest}
      />
    );
  },
);

Input.displayName = "Input";
