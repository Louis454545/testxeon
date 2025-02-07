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
  GO_TO_URL = 'go_to_url',
  SWITCH_TAB = 'switch_tab'
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
    target: string;
    description?: string;
  };
}

/**
 * Input text action
 */
export interface InputAction extends ActionBase {
  name: ActionName.INPUT;
  args: {
    target: string;
    text: string;
    description?: string;
  };
}

/**
 * Navigate to URL action
 */
export interface GoToUrlAction extends ActionBase {
  name: ActionName.GO_TO_URL;
  args: {
    target: string;
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
 * Union type of all possible actions
 */
export type Action = ClickAction | InputAction | GoToUrlAction | SwitchTabAction;

/**
 * Type guards for actions
 */
export const isClickAction = (action: Action): action is ClickAction => 
  action.name === ActionName.CLICK;

export const isInputAction = (action: Action): action is InputAction =>
  action.name === ActionName.INPUT;

export const isGoToUrlAction = (action: Action): action is GoToUrlAction =>
  action.name === ActionName.GO_TO_URL;

export const isSwitchTabAction = (action: Action): action is SwitchTabAction =>
  action.name === ActionName.SWITCH_TAB;

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