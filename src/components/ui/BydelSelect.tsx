import { cn } from "@/lib/utils";
import { BYDELER } from "@/lib/constants";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  showAllOption?: boolean;
};

export function BydelSelect({
  className,
  label = "Bydel",
  showAllOption = false,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? "bydel-select";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-oslo-ink">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          "rounded-lg border border-oslo-border bg-white px-3 py-2 text-sm text-oslo-ink focus:border-oslo-blue focus:outline-none focus:ring-2 focus:ring-oslo-blue/20",
          className,
        )}
        {...props}
      >
        {showAllOption && <option value="">Alle bydeler</option>}
        {BYDELER.map((bydel) => (
          <option key={bydel.id} value={bydel.id}>
            {bydel.label}
          </option>
        ))}
      </select>
    </div>
  );
}
