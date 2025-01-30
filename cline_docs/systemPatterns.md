# System Patterns

## Architecture
- React-based frontend in the sidebar
- TypeScript for type safety
- Service worker background script for browser events
- Modular component architecture with separation of concerns

## Key Components
1. Sidebar Interface
   - Header: Navigation between chat and conversations
   - MessageList: Displays conversation messages
   - MessageInput: Handles user message submission
   - ConversationsPage: Manages conversation history
   - ThinkingMessage: Shows loading state during processing

2. Core Services
   - DebuggerConnectionService: Handles browser debugging connections
   - PageCaptureService: Captures page data including accessibility info and screenshots
   - MessageHandler: Processes messages and executes actions
   - BrowserService: Manages browser interactions

3. State Management
   - Local state using React useState hooks
   - Message state tracking (content, sender, actions)
   - View state management (chat vs conversations)
   - Conversation persistence and search
   - Loading state management

## Technical Patterns
- Component-based UI architecture
- Service-based business logic separation
- Asynchronous action handling with error boundaries
- Type-safe message and conversation handling
- Iterative action processing with followup responses
- Progressive message updates with thinking states
- Conversation search and filtering

## UI Framework
- Tailwind CSS for styling with custom design tokens
- Dark mode implementation with CSS variables
- shadcn/ui components integration
- Responsive flex-based layout
- Custom color scheme variables for theming
- Consistent border radius and spacing