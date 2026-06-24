import Image from "next/image";
import { cn } from "@/lib/utils";

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
