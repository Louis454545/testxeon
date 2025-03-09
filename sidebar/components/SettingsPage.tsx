import { useState, useEffect } from 'react';
import { saveAIConfig } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle } from "lucide-react";

type Provider = 'google' | 'openai';

interface AISettings {
  apiKey: string;
  model: string;
  temperature: number;
  provider: Provider;
}

interface ProviderConfig {
  name: string;
  models: string[];
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  google: {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo']
  }
};

export function SettingsPage() {
  const [settings, setSettings] = useState<AISettings>({
    apiKey: '',
    model: 'gemini-2.0-flash',
    temperature: 1.0,
    provider: 'google'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      const data = await chrome.storage.local.get(['aiConfig']);
      if (data.aiConfig) {
        setSettings(data.aiConfig);
      }
    };

    loadSettings();
  }, []);

  const handleProviderChange = (provider: Provider) => {
    setSettings({
      ...settings,
      provider,
      model: PROVIDERS[provider].models[0]
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('');
    try {
      await saveAIConfig(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Provider</CardTitle>
          <CardDescription>
            Choose which AI provider to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.provider}
            onValueChange={(value: string) => handleProviderChange(value as Provider)}
            className="flex flex-col space-y-2"
          >
            {Object.entries(PROVIDERS).map(([provider, config]) => (
              <div key={provider} className="flex items-center space-x-2">
                <RadioGroupItem value={provider} id={provider} />
                <Label htmlFor={provider}>{config.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>
            Configure your API connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, apiKey: e.target.value})}
              placeholder={`Your ${PROVIDERS[settings.provider].name} API Key`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select 
              value={settings.model} 
              onValueChange={(value: string) => setSettings({...settings, model: value})}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS[settings.provider].models.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {settings.temperature.toFixed(1)}</Label>
            </div>
            <input
              id="temperature"
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={settings.temperature}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setSettings({...settings, temperature: parseFloat(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 gap-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Settings saved!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 gap-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Error saving settings</span>
            </div>
          )}
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}