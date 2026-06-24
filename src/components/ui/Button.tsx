import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "summer";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary: "bg-oslo-blue text-white hover:bg-oslo-blue-dark disabled:bg-oslo-muted",
  secondary:
    "border-2 border-oslo-blue bg-white text-oslo-blue hover:bg-oslo-blue-light",
  ghost: "text-oslo-blue hover:bg-oslo-blue-light",
  danger: "bg-oslo-red text-white hover:opacity-90",
  summer: "bg-summer-coral text-white hover:bg-summer-magenta",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-2xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
