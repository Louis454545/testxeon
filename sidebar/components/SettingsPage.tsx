import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getDefaultModel, getModelsForProvider } from "../../src/agent/modelRegistry";
import { getSettings, getSystemPrompt, resetSystemPrompt, saveSettings, saveSystemPrompt } from "../../src/storage/settings";
import type { AISettings, ProviderId } from "../../src/shared/types";

export function SettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const load = async () => {
      setSettings(await getSettings());
      setPrompt(await getSystemPrompt());
    };
    load();
  }, []);

  if (!settings) {
    return <div className="flex-1 p-4 text-sm text-muted-foreground">Loading settings...</div>;
  }

  const providerModels = getModelsForProvider(settings.provider);

  const handleProviderChange = (provider: ProviderId) => {
    setSettings({
      ...settings,
      provider,
      model: getDefaultModel(provider),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("");
    try {
      await saveSettings(settings);
      await saveSystemPrompt(prompt);
      setSaveStatus("success");
    } catch (error) {
      console.error("Error saving settings", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleResetPrompt = async () => {
    setPrompt(await resetSystemPrompt());
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Model</CardTitle>
            <CardDescription>AI SDK provider and model used by the local extension agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={settings.provider}
              onValueChange={(value) => handleProviderChange(value as ProviderId)}
              className="grid grid-cols-2 gap-2"
            >
              <ProviderOption id="google" label="Google" />
              <ProviderOption id="openai" label="OpenAI" />
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={settings.model}
                onValueChange={(model) => setSettings({ ...settings, model })}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {providerModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API key</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(event) => setSettings({ ...settings, apiKey: event.target.value })}
                placeholder={settings.provider === "google" ? "Google API key" : "OpenAI API key"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capture</CardTitle>
            <CardDescription>Visual context sent to the model for page understanding.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="screenshots">Screenshots</Label>
                <p className="text-xs text-muted-foreground">Send annotated page screenshots to vision models.</p>
              </div>
              <Switch
                id="screenshots"
                checked={settings.screenshotsEnabled}
                onCheckedChange={(screenshotsEnabled) => setSettings({ ...settings, screenshotsEnabled })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>System prompt</CardTitle>
              <CardDescription>Shared instruction used for every automation step.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetPrompt}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-[220px] w-full resize-y rounded-md border bg-background p-3 text-xs leading-relaxed outline-none focus:border-primary/60"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pb-3">
          <div>
            {saveStatus === "success" && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Saved
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Save failed
              </div>
            )}
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProviderOption({ id, label }: { id: ProviderId; label: string }) {
  return (
    <Label htmlFor={id} className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
      <RadioGroupItem id={id} value={id} />
      <span>{label}</span>
    </Label>
  );
}
