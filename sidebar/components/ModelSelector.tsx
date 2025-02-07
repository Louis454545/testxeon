import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AI_MODELS, AIModel } from "../config/aiModels"

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

  return (
    <Select value={selectedModel} onValueChange={handleSelectModel}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sélectionner un modèle" />
      </SelectTrigger>
      <SelectContent>
        {AI_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span>{model.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({model.provider})
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {model.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 