import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AI_MODELS, AIModel, getLimitText, isUnlimited } from "../config/aiModels"
import { Crown, Infinity } from "lucide-react"
import { cn } from "@/lib/utils"

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = React.useState<string>('claude-3-sonnet')

  React.useEffect(() => {
    // Charger le modèle sauvegardé au démarrage
    chrome.storage.local.get('selectedModel', (result) => {
      if (result.selectedModel) {
        setSelectedModel(result.selectedModel)
      } else {
        // Sauvegarder le modèle par défaut
        chrome.storage.local.set({ selectedModel: 'claude-3-sonnet' })
      }
    })
  }, [])

  const handleSelectModel = (value: string) => {
    setSelectedModel(value)
    chrome.storage.local.set({ selectedModel: value })
  }

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel)

  return (
    <Select value={selectedModel} onValueChange={handleSelectModel}>
      <SelectTrigger 
        className={cn(
          "w-[220px] h-8 px-2.5 text-sm",
          "bg-background/50 hover:bg-accent/50",
          "border-0 focus:ring-0 focus:ring-offset-0",
          "transition-colors duration-200",
          "[&>span]:flex [&>span]:items-center [&>span]:gap-2",
          "rounded-lg"
        )}
      >
        <SelectValue>
          {selectedModelData && (
            <>
              <span className="text-primary font-medium truncate max-w-[120px]">
                {selectedModelData.name}
              </span>
              <span className={cn(
                "text-xs shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full",
                "bg-primary/10 text-primary",
                "border border-primary/20"
              )}>
                {isUnlimited(selectedModelData) ? (
                  <>
                    <Infinity className="h-3 w-3" />
                    <span>Illimité</span>
                  </>
                ) : (
                  <span>{selectedModelData.messageLimit.daily} msg/jour</span>
                )}
              </span>
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={cn(
        "bg-popover/95 backdrop-blur-sm",
        "border-border/50 w-[300px]",
        "shadow-lg shadow-black/10",
        "rounded-lg overflow-hidden"
      )}>
        {AI_MODELS.map((model) => (
          <SelectItem 
            key={model.id} 
            value={model.id}
            className={cn(
              "py-2 pl-3 pr-4 text-sm cursor-pointer",
              "data-[state=checked]:bg-accent/40",
              "focus:bg-accent/40",
              "transition-colors duration-200",
              "hover:bg-accent/30",
              "border-b border-border/50 last:border-0"
            )}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium truncate max-w-[140px]">{model.name}</span>
                <span className="text-xs text-muted-foreground/80 shrink-0">
                  ({model.provider})
                </span>
                {model.tier === 'premium' && (
                  <Crown className="h-3.5 w-3.5 text-yellow-500/90 ml-auto shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 justify-between w-full">
                <span className="text-xs text-blue-400/90 truncate max-w-[160px]">
                  {model.description}
                </span>
                <span className={cn(
                  "text-xs shrink-0 flex items-center gap-1.5 ml-2",
                  "px-1.5 py-0.5 rounded-full",
                  "bg-muted/50 text-muted-foreground",
                  "border border-border/50"
                )}>
                  {model.messageLimit.daily === -1 ? (
                    <>
                      <Infinity className="h-2.5 w-2.5" />
                      <span>Illimité</span>
                    </>
                  ) : (
                    <span>{getLimitText(model)}</span>
                  )}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 