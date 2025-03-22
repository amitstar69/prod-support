
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Ensure value is a valid number between 0-100
  const safeValue = React.useMemo(() => {
    if (typeof value !== 'number' || isNaN(value)) {
      console.warn(`Progress component received invalid value: ${value}`);
      return 0;
    }
    
    // Clamp value between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));
    if (clampedValue !== value) {
      console.warn(`Progress component value clamped from ${value} to ${clampedValue}`);
    }
    
    return clampedValue;
  }, [value]);

  // Log the progress value for debugging
  React.useEffect(() => {
    console.log(`Progress component value: ${safeValue}% (original: ${value})`);
  }, [safeValue, value]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
