import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef((props, ref) => {
  const { className, ...otherProps } = props;
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...otherProps}
    >
      <SliderPrimitive.Track
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
      >
        <SliderPrimitive.Range 
          className="absolute h-full bg-blue-500 dark:bg-blue-400" 
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block h-4 w-4 rounded-full border border-gray-200 border-gray-200/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:border-gray-800/50 dark:bg-gray-950 dark:focus-visible:ring-gray-800"
      />
    </SliderPrimitive.Root>
  )
})

Slider.displayName = "Slider"

export { Slider }