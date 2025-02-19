export interface Tab {
  id: string;
  url: string;
  title: string;
  active: boolean;
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
}

export interface ApiPayload {
  context: string;
  message?: string;
  image: string;
  tabs: Tab[];
  conversation_id: string | null;
}

export interface ApiResponse {
  conversation_id: string;
  message: string;
  content: string;
  action: Action[];
}