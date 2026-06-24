import { Map, List } from "lucide-react";
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
        <p className="font-medium text-oslo-blue">Adressesøk krever kart</p>
        <p className="mt-1 text-xs text-oslo-muted">
          Du kan fortsatt bla i sted-listen nedenfor.
        </p>
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
      <p className="font-medium text-oslo-blue">Kartet er ikke tilgjengelig akkurat nå</p>
      <p className="mt-2 max-w-sm text-sm text-oslo-muted">
        Interaktivt kart vises når tjenesten er konfigurert. Du kan fortsatt søke og lese steder i
        listen.
      </p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-oslo-blue">
        <List className="h-4 w-4" aria-hidden />
        Scroll ned til «Steder i utvalget»
      </p>
    </div>
  );
}
