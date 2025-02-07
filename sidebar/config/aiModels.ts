export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'Anthropic' | 'OpenAI' | 'Google';
  tier: 'premium' | 'standard' | 'basic';
  tokenLimit: number;
  messageLimit: {
    daily: number;
    monthly: number;
  };
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Le plus puissant - Idéal pour les tâches complexes',
    provider: 'Anthropic',
    tier: 'premium',
    tokenLimit: 200000,
    messageLimit: {
      daily: -1, // illimité
      monthly: -1
    }
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Équilibré - Bon rapport performance/coût',
    provider: 'Anthropic',
    tier: 'standard',
    tokenLimit: 100000,
    messageLimit: {
      daily: 50,
      monthly: 1000
    }
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Très capable - Excellent en programmation',
    provider: 'OpenAI',
    tier: 'premium',
    tokenLimit: 128000,
    messageLimit: {
      daily: -1,
      monthly: -1
    }
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Performant - Alternative Google',
    provider: 'Google',
    tier: 'standard',
    tokenLimit: 32000,
    messageLimit: {
      daily: 50,
      monthly: 1000
    }
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Rapide et économique',
    provider: 'OpenAI',
    tier: 'basic',
    tokenLimit: 16000,
    messageLimit: {
      daily: 25,
      monthly: 500
    }
  },
  {
    id: 'claude-2.1',
    name: 'Claude 2.1',
    description: 'Version basique de Claude',
    provider: 'Anthropic',
    tier: 'basic',
    tokenLimit: 100000,
    messageLimit: {
      daily: 25,
      monthly: 500
    }
  }
];

// Fonction utilitaire pour vérifier si un modèle est illimité
export const isUnlimited = (model: AIModel) => 
  model.messageLimit.daily === -1 && model.messageLimit.monthly === -1;

// Fonction pour obtenir le texte de la limite
export const getLimitText = (model: AIModel) => {
  if (isUnlimited(model)) return "Illimité";
  return `${model.messageLimit.daily}/jour - ${model.messageLimit.monthly}/mois`;
}; 