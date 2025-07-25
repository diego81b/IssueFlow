# IssueFlow - VS Code Extension

A powerful Visual Studio Code extension that automatically transforms TODO comments in your code into issues on GitHub or GitLab.

## 🚀 Features

- **Automatic Scanning**: Finds all TODOs in your workspace
- **Multi-Platform Support**: Create issues on GitHub and GitLab
- **Modern Interface**: WebView built with Vue3 + Tailwind CSS
- **Secure Authentication**: Safely stores your tokens
- **Granular Selection**: Choose which TODOs to convert
- **Repository Management**: Select the target repository

## 📋 Prerequisites

- Visual Studio Code 1.74.0 or higher
- Node.js 18+ 
- GitHub and/or GitLab account with Personal Access Token

## 🛠️ Installation

### Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/issue-flow.git
cd issue-flow
```

2. Install dependencies:
```bash
npm install
```

3. Compile the extension:
```bash
npm run compile
```

4. Build the webview:
```bash
npm run build:webview
```

5. Press F5 to launch a new VS Code window with the extension loaded

## 🎯 How to Use

### 1. Initial Setup

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run `IssueFlow: Open TODO Manager`
3. Log in to GitHub and/or GitLab by entering your Personal Access Tokens

### 2. TODO Scanning

1. Click "Scan Workspace" to find all TODOs in your project
2. Select the TODOs you want to convert into issues
3. Use "Select All" or "Deselect All" for quick management

### 3. Issue Creation

1. Choose the platform (GitHub or GitLab)
2. Select the target repository
3. Click "Create Issue" to generate issues

## 🔧 Configuration

The extension uses these VS Code settings:

- `issueflow.githubToken`: GitHub token (stored securely)
- `issueflow.gitlabToken`: GitLab token (stored securely)  
- `issueflow.gitlabUrl`: GitLab instance URL (default: https://gitlab.com)

## 🏗️ Project Architecture

```
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── services/
│   │   ├── TodoManager.ts        # TODO scanning and management
│   │   ├── github.ts             # GitHub API service
│   │   └── gitlab.ts             # GitLab API service
│   ├── webview/
│   │   ├── TodoWebviewProvider.ts # Webview provider
│   │   ├── App.vue               # Main Vue3 app
│   │   ├── main.ts               # Vue entry point
│   │   └── style.css             # Base styles
├── dist/                         # Webview build output
├── out/                          # Extension build output
├── package.json
├── vite.config.ts                # Vite config for webview
├── tsconfig.extension.json       # TypeScript config for extension
└── tsconfig.app.json             # TypeScript config for webview
```

## 🧑‍💻 Development

### Available Scripts

- `npm run compile`: Compile the extension TypeScript
- `npm run watch`: Watch mode for extension compilation
- `npm run build:webview`: Production build for Vue3 webview
- `npm run dev:webview`: Dev server for webview (UI development)

### Supported TODO Formats

The extension recognizes these TODO patterns:

```typescript
// TODO: Implement feature X
/* TODO: Refactor this code */
# TODO: Add tests
<!-- TODO: Improve UX -->
// FIXME: Bug to fix
```

## 🔐 Security

- Tokens are securely stored using the VS Code API
- HTTPS communication with GitHub/GitLab APIs
- No sensitive data stored in plain text

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See `LICENSE` for details.

## 🆘 Support

If you have issues or questions:

1. Check the [documentation](https://github.com/your-username/issue-flow/wiki)
2. Search [existing Issues](https://github.com/your-username/issue-flow/issues)
3. Open a [new Issue](https://github.com/your-username/issue-flow/issues/new)

---

Created with ❤️ for developers who want to turn TODOs into real actions!
