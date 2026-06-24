import { Map } from "lucide-react";
import { cn } from "@/lib/utils";

type MapboxSetupNoticeProps = {
  variant?: "full" | "compact";
  className?: string;
};

export function MapboxSetupNotice({ variant = "full", className }: MapboxSetupNoticeProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border-2 border-dashed border-oslo-border bg-oslo-blue-light px-4 py-3 text-sm",
          className,
        )}
      >
        <p className="font-medium text-oslo-blue">Kartet er ikke tilgjengelig</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-[60vh] min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-oslo-border bg-oslo-blue-light p-6 text-center",
        className,
      )}
    >
      <Map className="mb-3 h-10 w-10 text-oslo-blue" aria-hidden />
      <p className="font-medium text-oslo-blue">Kartet er ikke tilgjengelig</p>
      <p className="mt-2 max-w-sm text-sm text-oslo-muted">Prøv igjen senere.</p>
    </div>
  );
}
