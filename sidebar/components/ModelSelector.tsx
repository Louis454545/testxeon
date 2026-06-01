import * as React from "react";
import { Bot, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDefaultModel, getModelsForProvider, MODEL_OPTIONS } from "../../src/agent/modelRegistry";
import { getSettings, saveSettings } from "../../src/storage/settings";

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = React.useState("gemini-3.5-flash");
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      const settings = await getSettings();
      setSelectedModel(settings.model || getDefaultModel(settings.provider));
    };
    load();
  }, []);

  const handleSelectModel = async (modelId: string) => {
    const model = MODEL_OPTIONS.find((candidate) => candidate.id === modelId);
    if (!model) return;

    setSelectedModel(modelId);
    setIsUpdating(true);
    try {
      await saveSettings({ provider: model.provider, model: model.id });
    } finally {
      setIsUpdating(false);
    }
  };

  const selected = MODEL_OPTIONS.find((model) => model.id === selectedModel);
  const groups = {
    google: getModelsForProvider("google"),
    openai: getModelsForProvider("openai"),
  };

  return (
    <Select value={selectedModel} onValueChange={handleSelectModel} disabled={isUpdating}>
      <SelectTrigger className="h-9 w-full border bg-card px-2.5 focus:ring-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-medium leading-4">{selected?.name ?? selectedModel}</div>
            <div className="truncate text-[11px] leading-3 text-muted-foreground">
              {selected?.provider ?? "google"} runtime
            </div>
          </div>
          <SelectValue className="sr-only" />
        </div>
      </SelectTrigger>
      <SelectContent className="w-[300px]">
        {Object.entries(groups).map(([provider, models]) => (
          <div key={provider}>
            <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {provider}
            </div>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex w-full items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{model.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{model.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
