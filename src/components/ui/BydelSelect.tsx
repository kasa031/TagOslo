import { cn } from "@/lib/utils";
import { BYDELER } from "@/lib/constants";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  /** Vis «Alle bydeler» (tom verdi) — for filtre */
  showAllOption?: boolean;
  /** Vis «Hele Oslo» — for tilbakemeldinger til bypolitikere */
  showHeleOsloOption?: boolean;
  heleOsloOptionLabel?: string;
};

export function BydelSelect({
  className,
  label = "Bydel",
  showAllOption = false,
  showHeleOsloOption = false,
  heleOsloOptionLabel = "Hele Oslo (ikke bydelspolitiker)",
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
        {showHeleOsloOption && <option value="HELE_OSLO">{heleOsloOptionLabel}</option>}
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
