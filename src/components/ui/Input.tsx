import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-oslo-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-lg border border-oslo-border bg-white px-3 py-2 text-sm text-oslo-ink placeholder:text-oslo-muted focus:border-oslo-blue focus:outline-none focus:ring-2 focus:ring-oslo-blue/20",
          error && "border-oslo-red",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-oslo-red">{error}</p>}
    </div>
  );
}
