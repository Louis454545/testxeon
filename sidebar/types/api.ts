/**
 * Represents a tab in the browser window
 */
export interface Tab {
  id: number;
  url: string;
  title: string;
  active: boolean;
}

/**
 * Available roles in the conversation system
 */
export const enum Role {
  Human = 'human',
  Assistant = 'assistant'
}

/**
 * Structure of a single message in the conversation
 */
export interface ConversationMessage {
  role: Role;
  content: string;
}

/**
 * Complete payload structure for API communication
 */
export interface ApiPayload {
  /** Serialized accessibility tree */
  html_code: string;
  
  /** Current page URL */
  current_url: string;
  
  /** Initial user task (only for first message) */
  task?: string;
  
  /** Base64 encoded screenshot */
  image: string;
  
  /** Status of the last performed action */
  last_action_success: boolean;
  
  /** Complete conversation history */
  conversation_history: ConversationMessage[];
  
  /** List of open browser tabs */
  tabs: Tab[];
}

/**
 * Response from the API server
 */
export interface ApiResponse {
  /** Server's response message */
  message: string;
  
  /** Any additional data from the server */
  data?: unknown;
  
  /** Error information if the request failed */
  error?: string;
}