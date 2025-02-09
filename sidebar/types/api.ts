/**
 * Represents a tab in the browser window
 */
export interface Tab {
  id: string;
  url: string;
  title: string;
  active: boolean;
}

/**
 * Action types supported by the API
 */
export enum ActionName {
  CLICK = 'click',
  INPUT = 'input',
  NAVIGATE = 'navigate',
  SWITCH_TAB = 'switch_tab',
  BACK = 'back',
  FORWARD = 'forward'
}

/**
 * Base interface for all actions
 */
interface ActionBase {
  name: ActionName;
  args: {
    description?: string;
  };
}

/**
 * Click action
 */
export interface ClickAction extends ActionBase {
  name: ActionName.CLICK;
  args: {
    id: string;
    description?: string;
  };
}

/**
 * Input text action
 */
export interface InputAction extends ActionBase {
  name: ActionName.INPUT;
  args: {
    id: string;
    text: string;
    description?: string;
  };
}

/**
 * Navigate to URL action
 */
export interface NavigateAction extends ActionBase {
  name: ActionName.NAVIGATE;
  args: {
    url: string;
    description?: string;
  };
}

/**
 * Switch browser tab action
 */
export interface SwitchTabAction extends ActionBase {
  name: ActionName.SWITCH_TAB;
  args: {
    tab_id: string;
    description?: string;
  };
}

/**
 * Navigate back action
 */
export interface BackAction extends ActionBase {
  name: ActionName.BACK;
  args: {
    description?: string;
  };
}

/**
 * Navigate forward action
 */
export interface ForwardAction extends ActionBase {
  name: ActionName.FORWARD;
  args: {
    description?: string;
  };
}

/**
 * Union type of all possible actions
 */
export type Action = ClickAction | InputAction | NavigateAction | SwitchTabAction | BackAction | ForwardAction;

/**
 * Type guards for actions
 */
export const isClickAction = (action: Action): action is ClickAction => 
  action.name === ActionName.CLICK;

export const isInputAction = (action: Action): action is InputAction =>
  action.name === ActionName.INPUT;

export const isNavigateAction = (action: Action): action is NavigateAction =>
  action.name === ActionName.NAVIGATE;

export const isSwitchTabAction = (action: Action): action is SwitchTabAction =>
  action.name === ActionName.SWITCH_TAB;

export const isBackAction = (action: Action): action is BackAction =>
  action.name === ActionName.BACK;

export const isForwardAction = (action: Action): action is ForwardAction =>
  action.name === ActionName.FORWARD;

/**
 * Complete payload structure for API communication
 */
export interface ApiPayload {
  /** Serialized accessibility tree */
  context: string;
  
  /** User message */
  message?: string;
  
  /** Base64 encoded screenshot */
  image: string;
  
  /** Status of the last performed action */
  last_action_success: boolean;
  
  /** List of open browser tabs */
  tabs: Tab[];

  /** Current conversation ID (null for new conversations) */
  conversation_id: string | null;

  /** Results from previous tool execution */
  tool_results: any | null;
}

/**
 * Response from the API server
 */
export interface ApiResponse {
  /** Conversation identifier */
  conversation_id: string;
  
  /** Server's response message */
  content: string;
  
  /** Actions to be executed on the page */
  action: Action[];
}