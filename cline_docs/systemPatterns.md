# System Patterns

## Architecture Overview
The system follows a React-based single-page application pattern, integrated as a browser extension sidebar. 

## Key Technical Decisions

### 1. Component Architecture
- **SidebarApp**: Root component managing global state and view routing
- **Component Separation**: Logical separation between UI, message handling, and browser integration
- **State Management**: React useState for local state management
- **Views**: Split between chat interface and conversations list

### 2. Message Flow
```
User Input → Message Handler → API Response → Action Execution → UI Update
```
- Immediate user feedback with message display
- Async processing with thinking states
- Chainable action execution
- Error handling at each step

### 3. Browser Integration
- Debugger connection service for browser manipulation
- Page capture service for context gathering
- Action operator for executing browser commands
- Clean disconnection handling

### 4. Data Patterns

#### Conversation Management
- Unique IDs based on timestamps
- Preview generation from last message
- Real-time updates during message processing
- Search functionality on title and preview

#### Message Structure
```typescript
{
  content: string
  isUser: boolean
  timestamp: Date
  action?: Action
  error?: Error
}
```

### 5. Styling Architecture
- Tailwind CSS for utility-first styling
- CSS variables for theme configuration
- Dark mode support
- Responsive design patterns

## Core Design Patterns

1. **Observer Pattern**
   - Message handling subscription
   - State updates propagation

2. **Command Pattern**
   - Action execution system
   - Browser manipulation

3. **Chain of Responsibility**
   - Message processing pipeline
   - Action execution sequence

4. **Factory Pattern**
   - Message creation
   - Conversation generation

5. **Service Pattern**
   - Browser connection
   - Page capture
   - API communication