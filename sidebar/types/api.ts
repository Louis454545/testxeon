/**
 * API Response from the AI
 */
export interface ApiResponse {
  conversation_id: string;
  message?: string;
  content?: string;
  action?: any[];
}

/**
 * Tab information
 */
export interface Tab {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

/**
 * API Payload for sending to backend
 */
export interface ApiPayload {
  context: string;
  image?: string;
  tabs: Tab[];
  conversation_id?: string | null;
  message?: string;
}

export interface Action {
  input?: {
    id: string;
    text: string;
    description?: string;
  };
  click?: {
    id: string;
    description?: string;
  };
  navigate?: {
    url: string;
    description?: string;
  };
  switch_tab?: {
    tab_id: string;
    description?: string;
  };
  back?: {
    description?: string;
  };
  forward?: {
    description?: string;
  };
  keyboard?: {
    key?: string;
    keys?: string;
    description?: string;
  };
  wait?: {
    duration: number;
    description?: string;
  };
  ask?: {
    query: string;
    description?: string;
  };
  done?: {
    message: string;
    description?: string;
  };
}