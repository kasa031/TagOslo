import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  accent?: string;
};

export function Card({ children, className, title, description, accent }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border-2 border-oslo-border bg-white p-5",
        accent,
        className,
      )}
    >
      {(title || description) && (
        <header className="mb-4">
          {title && <h2 className="text-lg font-bold text-oslo-ink">{title}</h2>}
          {description && (
            <p className="mt-1 text-sm text-oslo-muted">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
