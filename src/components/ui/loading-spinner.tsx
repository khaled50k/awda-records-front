
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10", 
    lg: "h-16 w-16"
  }

  return (
    <div className="flex items-center justify-center">
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute inset-0 rounded-full border-2 border-gaza-green/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gaza-green animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-gaza-green/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  )
}
