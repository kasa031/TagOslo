import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

type LogoVariant = "emblem" | "skirt" | "full";

type LogoProps = {
  variant?: LogoVariant;
  size?: number;
  className?: string;
  priority?: boolean;
};

const ASSETS: Record<LogoVariant, { src: string; alt: string }> = {
  emblem: { src: "/logo-ring.png", alt: "TagOslo — Oslos våpen" },
  skirt: { src: "/logo-skirt.png", alt: "TagOslo" },
  full: { src: "/logo.png", alt: "TagOslo" },
};

export function Logo({
  variant = "emblem",
  size = 36,
  className,
  priority,
}: LogoProps) {
  const { src, alt } = ASSETS[variant];

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

type BrandWordmarkProps = {
  className?: string;
  /** Lys tekst på mørk bakgrunn (forside-hero). */
  tone?: "light" | "dark";
};

/** «Tag» + «Oslo» med Oslo-farger — brukes i header og hero. */
export function BrandWordmark({ className, tone = "dark" }: BrandWordmarkProps) {
  const tagClass = tone === "light" ? "text-white" : "text-oslo-ink";
  const osloClass = tone === "light" ? "text-oslo-cream" : "text-oslo-blue";

  return (
    <span
      className={cn("inline-block font-extrabold leading-none tracking-tight", className)}
      aria-label={APP_NAME}
    >
      <span className={tagClass}>Tag</span>
      <span className={osloClass}>Oslo</span>
    </span>
  );
}
