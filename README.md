# IssueFlow - VS Code Extension

A powerful Visual Studio Code extension that automatically transforms TODO comments in your code into issues on GitHub or GitLab.

## 🚀 Features

- **Automatic Scanning**: Finds all TODOs in your workspace
- **Smart Description Extraction**: Automatically extracts detailed descriptions from multi-line comments
- **Multi-Platform Support**: Create issues on GitHub and GitLab
- **Modern Interface**: WebView built with Vue3 + Tailwind CSS
- **Secure Authentication**: Safely stores your tokens
- **Granular Selection**: Choose which TODOs to convert
- **Repository Management**: Select the target repository
- **Rich Issue Content**: Creates detailed issues with context and descriptions

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
2. Review the found TODOs with their detailed descriptions (when available)
3. Select the TODOs you want to convert into issues
4. Use "Select All" or "Deselect All" for quick management

**Note**: The extension automatically extracts detailed descriptions from multi-line TODO comments, showing you both the basic content and the full context in the interface.

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

### Debug Mode

To run the extension in debug mode:

1. **Build the webview first**:
   ```bash
   npm run build:webview
   ```

2. **Compile the extension**:
   ```bash
   npm run compile
   ```

3. **Launch debug session**:
   - Open VS Code in the project root
   - Press **F5** or go to Run > Start Debugging
   - This opens a new "Extension Development Host" window with your extension loaded

4. **Test the extension**:
   - In the new window, open a project with TODO comments
   - Press `Ctrl+Shift+P` and run `IssueFlow: Open TODO Manager`
   - The webview should load with your built assets

### Development Workflow

For active development:

1. **Watch mode for extension code**:
   ```bash
   npm run watch
   ```

2. **For webview changes**:
   - Make changes to Vue files
   - Run `npm run build:webview` 
   - Reload the Extension Development Host window (`Ctrl+R`)

3. **For extension logic changes**:
   - Changes are auto-compiled if using `npm run watch`
   - Reload the Extension Development Host window (`Ctrl+R`)

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

### Smart Description Extraction

IssueFlow automatically extracts detailed descriptions from multi-line TODO comments, creating richer and more informative issues.

#### How it works:

1. **Basic TODO**: Extracts the immediate text after TODO/FIXME
2. **Multi-line TODOs**: Combines continuation comments into a detailed description
3. **Context Analysis**: Looks at surrounding comment lines for additional context

#### Examples:

**Single-line TODO:**
```javascript
// TODO: Implement user authentication
```
- **Content**: "Implement user authentication"
- **Description**: "Implement user authentication"

**Multi-line TODO with details:**
```javascript
// TODO: Implement user authentication
// This should include OAuth2 integration with Google and GitHub
// Also need to handle session management and token refresh
```
- **Content**: "Implement user authentication"  
- **Description**: "Implement user authentication This should include OAuth2 integration with Google and GitHub Also need to handle session management and token refresh"

**Block comment TODO:**
```javascript
/* FIXME: Performance issue in data processing
 * The current algorithm has O(n²) complexity
 * Consider implementing a hash-based approach for better performance
 */
```
- **Content**: "Performance issue in data processing"
- **Description**: "Performance issue in data processing The current algorithm has O(n²) complexity Consider implementing a hash-based approach for better performance"

#### In the Generated Issues:

When creating issues, IssueFlow includes both pieces of information:

- **Issue Title**: Uses the `content` (short version)
- **Issue Body**: Includes:
  - Code location and line number
  - Full code line in a code block
  - **Detailed Description** section (when available)
  - **TODO Content** section

This ensures that all context and details from your comments are preserved in the created issues, making them more actionable and informative for your team.

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

## 🛠️ Troubleshooting

If you see errors like  
`Unable to read file 'c:\varie\IssueFlow\dist\assets\style.css' (Error: Unable to resolve nonexistent file ...)`  
make sure you have built the webview assets:

```bash
npm run build:webview
```

This command generates the required files in the `dist/assets` folder.  
If the folder or files are missing, the extension cannot load the UI correctly.

For development, always run the build command after making changes to the webview code.

---

Created with ❤️ for developers who want to turn TODOs into real actions!
