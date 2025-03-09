import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function UnsupportedUrlView({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-6"
      role="alert"
      aria-live="polite"
    >
      <div 
        className={cn(
          "max-w-md w-full space-y-6",
          "animate-in fade-in slide-in-from-bottom-4 duration-1000"
        )}
      >
        {/* Icon with animation */}
        <div className="relative flex justify-center" aria-hidden="true">
          <div className={cn(
            "absolute inset-0 bg-yellow-500/20 dark:bg-yellow-500/10",
            "rounded-full blur-2xl animate-pulse"
          )} />
          <div className={cn(
            "relative p-4 rounded-full",
            "bg-gradient-to-b from-yellow-100 to-yellow-50",
            "dark:from-yellow-500/20 dark:to-yellow-500/5",
            "border border-yellow-200/50 dark:border-yellow-500/20",
            "shadow-lg shadow-yellow-500/20",
            "animate-bounce duration-2000"
          )}>
            <AlertTriangle 
              className="h-12 w-12 text-yellow-600 dark:text-yellow-500"
              aria-label="Warning"
            />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4 text-center px-4">
          <h2 className={cn(
            "text-2xl font-bold bg-gradient-to-r",
            "from-yellow-600 via-orange-600 to-red-600",
            "dark:from-yellow-200 dark:via-yellow-100 dark:to-orange-200",
            "bg-clip-text text-transparent",
            "animate-in fade-in duration-1000 delay-200"
          )}>
            Restricted Navigation
          </h2>
          
          <p className={cn(
            "text-muted-foreground/80 leading-relaxed",
            "animate-in fade-in duration-1000 delay-300"
          )}>
            This special page (<code className="font-mono text-sm bg-muted/50 px-1.5 py-0.5 rounded">chrome://</code>, 
            <code className="font-mono text-sm bg-muted/50 px-1.5 py-0.5 rounded ml-1">about:blank</code>, etc.) 
            cannot be used with the assistant.
          </p>
          
          <p className={cn(
            "text-muted-foreground/80",
            "animate-in fade-in duration-1000 delay-400"
          )}>
            Please navigate to a standard website to continue.
          </p>
        </div>

        {/* Button */}
        <div className={cn(
          "px-4 pt-2",
          "animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500"
        )}>
          <Button 
            onClick={onRedirect}
            className={cn(
              "w-full h-12 gap-2",
              "bg-gradient-to-r from-blue-600 to-indigo-600",
              "hover:from-blue-600 hover:to-blue-600",
              "dark:from-blue-600 dark:to-indigo-500",
              "dark:hover:from-blue-500 dark:hover:to-blue-500",
              "shadow-lg shadow-blue-500/20",
              "transition-all duration-300",
              "hover:shadow-xl hover:shadow-blue-500/30",
              "hover:-translate-y-0.5 active:translate-y-0",
              "group"
            )}
            aria-label="Go to Google"
          >
            <span>Go to Google</span>
            <ArrowRight className={cn(
              "w-4 h-4 transition-transform duration-200",
              "group-hover:translate-x-0.5"
            )} />
          </Button>
        </div>

        {/* Background decoration */}
        <div 
          className={cn(
            "fixed inset-0 -z-10",
            "bg-gradient-to-b from-background to-muted/50",
            "dark:from-background dark:to-background"
          )}
          aria-hidden="true"
        >
          <div className={cn(
            "absolute inset-0",
            "bg-[radial-gradient(40%_50%_at_50%_50%,theme(colors.yellow.500/0.05)_0%,transparent_100%)]",
            "dark:bg-[radial-gradient(40%_50%_at_50%_50%,theme(colors.yellow.500/0.08)_0%,transparent_100%)]"
          )} />
        </div>
      </div>
    </div>
  );
} 