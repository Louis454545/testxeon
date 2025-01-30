# Product Context

## Purpose
Xeon Agent is a browser extension that enables users to control their browser through a conversational interface in a side panel.

## Problems Solved
- Provides a natural language interface for browser control
- Enables complex browser automation through conversation
- Makes browser interactions more accessible through AI-powered assistance
- Maintains conversation history for reference and continuity
- Allows users to manage and search multiple conversations

## How It Works

1. Conversation Flow
   - User enters message in chat interface
   - System displays immediate feedback with thinking state
   - Message is processed through API with current page context
   - System executes any required browser actions
   - Followup actions are processed automatically if needed
   - Results are displayed to user

2. Conversation Management
   - Users can create new conversations
   - Existing conversations can be viewed and searched
   - Conversations are automatically saved
   - Conversations show preview of last message
   - Empty conversations are automatically cleaned up

3. Action Processing
   - System captures current page data including accessibility info
   - Actions are executed through browser debugging API
   - Multiple actions can be chained together
   - Page context is updated after each action
   - System maintains connection until actions complete

4. Error Handling
   - Failed messages are marked with error state
   - System provides feedback on action failures
   - Connection issues are handled gracefully
   - Users can retry failed actions

5. User Interface
   - Dark mode interface for comfortable viewing
   - Clear separation between user and system messages
   - Loading states for better feedback
   - Easy navigation between conversations