import { cn } from "@/lib/utils";

interface MaterialIconProps {
  icon: string;
  className?: string;
  filled?: boolean;
  weight?: number;
}

export function MaterialIcon({
  icon,
  className,
  filled = false,
  weight = 400,
}: Readonly<MaterialIconProps>) {
  return (
    <span
      className={cn(
        "material-symbols-outlined",
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}`,
      }}
    >
      {icon}
    </span>
  );
}