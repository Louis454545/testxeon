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
  apiId?: string; // ID utilisé pour les appels API
}

export const AI_MODELS: AIModel[] = [
  // Google Gemini Models
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Rapide - Idéal pour la plupart des tâches',
    provider: 'Google',
    tier: 'standard',
    tokenLimit: 100000,
    messageLimit: {
      daily: -1, // illimité
      monthly: -1
    },
    apiId: 'gemini-2.0-flash'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Équilibré - Bon rapport performance/coût',
    provider: 'Google',
    tier: 'standard',
    tokenLimit: 100000,
    messageLimit: {
      daily: -1,
      monthly: -1
    },
    apiId: 'gemini-1.5-flash'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Puissant - Pour tâches complexes',
    provider: 'Google',
    tier: 'premium',
    tokenLimit: 128000,
    messageLimit: {
      daily: -1,
      monthly: -1
    },
    apiId: 'gemini-1.5-pro'
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    description: 'Version basique de Gemini',
    provider: 'Google',
    tier: 'basic',
    tokenLimit: 32000,
    messageLimit: {
      daily: -1,
      monthly: -1
    },
    apiId: 'gemini-1.0-pro'
  },
  
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Dernier modèle OpenAI - Très performant',
    provider: 'OpenAI',
    tier: 'premium',
    tokenLimit: 128000,
    messageLimit: {
      daily: -1,
      monthly: -1
    },
    apiId: 'gpt-4o'
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
    },
    apiId: 'gpt-4'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Rapide et économique',
    provider: 'OpenAI',
    tier: 'basic',
    tokenLimit: 16000,
    messageLimit: {
      daily: -1,
      monthly: -1
    },
    apiId: 'gpt-3.5-turbo'
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

// Fonction pour obtenir le provider API à partir de l'ID du modèle
export const getProviderFromModelId = (modelId: string): 'google' | 'openai' => {
  const model = AI_MODELS.find(m => m.id === modelId);
  return model?.provider === 'Google' ? 'google' : 'openai';
};

// Fonction pour obtenir l'ID API du modèle
export const getApiModelId = (modelId: string): string => {
  const model = AI_MODELS.find(m => m.id === modelId);
  return model?.apiId || modelId; // Retourne l'apiId ou l'id si apiId n'est pas défini
}; 