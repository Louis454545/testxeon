export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'Anthropic' | 'OpenAI' | 'Google';
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Le plus puissant - Idéal pour les tâches complexes',
    provider: 'Anthropic'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Équilibré - Bon rapport performance/coût',
    provider: 'Anthropic'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Très capable - Excellent en programmation',
    provider: 'OpenAI'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Performant - Alternative Google',
    provider: 'Google'
  }
]; 