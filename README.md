# Xeon Agent

> **A Chrome extension to control your browser with AI**


## 🤖 Introduction

Xeon Agent is a Chrome extension that allows you to control your browser using artificial intelligence. It's a secure and open-source alternative to OpenAI Operator, with a focus on privacy and local control.

Unlike other solutions, Xeon Agent:
- **Works locally**: no external server needed
- **Respects your privacy**: your data never leaves your browser (except for the AI API)
- **Supports multiple AI models**: compatible with Google Gemini and OpenAI
- **Is fully customizable**: adjust settings to your needs

## 🎬 Demo

See Xeon Agent in action:

![Xeon Agent Demo](https://github.com/Louis454545/xeon-agent/assets/demo.gif)

*Watch how Xeon Agent can help you automate browser tasks with simple natural language commands.*

## 📝 Message from the Author

> Hi! I'm a developer passionate about automation. This project was born from my curiosity for AI and web automation.
> 
> To be honest, I was mostly familiar with backend development before starting this project, and Chrome extensions were new to me. That's why the code isn't always elegant (let's face it, it's sometimes garbage 😅).
> 
> Despite this, I managed to create something that works! I continue to learn and improve Xeon Agent every day. If you have suggestions or want to contribute, don't hesitate!

## ✨ Features

- 🌐 **Browser automation**: performs complex actions on websites
- 🧠 **Advanced AI**: uses cutting-edge models like Gemini and GPT
- 🔍 **Contextual analysis**: understands page structure for precise interactions
- 🔄 **Complex actions**: navigation, form filling, clicks, and more
- 🔐 **Security**: your sensitive data stays on your device

## 🚀 Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the project folder
6. Configure your API key in settings

## ⚙️ Configuration

1. Click on the extension icon in the toolbar
2. Open settings
3. Enter your API key (Gemini or OpenAI)
4. Select your preferred AI model
5. Adjust the temperature to control AI creativity

## 📋 Roadmap

- [ ] **Improve tab switching**: Solve switch_tab issues by disconnecting/reconnecting the debugger
- [ ] **Support more providers**: Add support for Anthropic Claude, Mistral, and other models
- [ ] **Enhanced bounding boxes**: Make element visualization more precise and less intrusive
- [ ] **Accessibility tree optimization**: Improve conversion and representation of DOM structure
- [ ] **Intelligent tab management**: Automatically reconnect when a new tab is opened by the extension
- [ ] **Improve complex tasks**: Draw inspiration from Manus for better handling of long tasks
- [ ] **Conversation history**: Implement a system for storing and searching past interactions
- [ ] **More intuitive user interface**: Redesign the UI for a better user experience
## 🧩 How It Works

Xeon Agent uses the Chrome Debugging Protocol to interact with web pages. It captures a snapshot of the page, sends it to an AI model with context, then interprets the instructions to perform actions on the page.

The agent can:
- Click on elements
- Fill out forms
- Use the keyboard
- And much more!

## 🤝 Contribution

Contributions are welcome! Here's how you can help:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under a custom proprietary license that requires attribution and prohibits creating competing projects without permission.

Key requirements:
- You must credit the original author (Louis, age 14)
- You cannot create competing browser automation tools
- Commercial use requires permission
- Personal and educational use is allowed

For the complete license terms, please see the [LICENSE](./LICENSE) file.
