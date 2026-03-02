import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary ring-primary/20",
        secondary: "bg-secondary text-secondary-foreground ring-border",
        success: "bg-green-50 text-green-700 ring-green-600/20",
        warning: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
        danger: "bg-red-50 text-red-700 ring-red-600/20",
        info: "bg-blue-50 text-blue-700 ring-blue-600/20",
        outline: "bg-transparent text-foreground ring-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
