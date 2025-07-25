# IssueFlow - VS Code Extension

A powerful Visual Studio Code extension that automatically transforms TODO comments in your code into issues on GitHub or GitLab.

## 🚀 Features

- **Automatic Scanning**: Finds all TODOs in your workspace
- **Smart Description Extraction**: Automatically extracts detailed descriptions from multi-line comments
- **Editable Descriptions**: Modify and enhance descriptions directly in the interface
- **Multi-Platform Support**: Create issues on GitHub and GitLab
- **Modern Interface**: WebView built with Vue3 + Tailwind CSS
- **Secure Authentication**: Safely stores your tokens
- **Granular Selection**: Choose which TODOs to convert
- **Repository Management**: Select the target repository
- **Structured Issue Format**: Creates well-organized issues with clean titles and detailed bodies

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

### 2. TODO Scanning and Editing

1. Click "Scan Workspace" to find all TODOs in your project
2. Review the found TODOs with their automatically extracted descriptions
3. **Edit descriptions**: Click on any selected TODO to edit its description in the textarea
4. Select the TODOs you want to convert into issues
5. Use "Select All" or "Deselect All" for quick management

**Features:**
- **Smart extraction**: Automatically combines multi-line TODO comments into detailed descriptions
- **Editable descriptions**: Modify or enhance descriptions directly in the interface
- **Real-time preview**: See how your TODOs will appear as issues before creating them

### 3. Issue Creation

1. Choose the platform (GitHub or GitLab)
2. Select the target repository
3. Review the issue preview to see titles and descriptions
4. Click "Create Issue" to generate well-structured issues

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

#### Quick Start Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start live reload development:**
   ```bash
   npm run dev
   ```

3. **Launch extension:**
   - Press **F5** in VS Code
   - Select "Run Extension (Live Reload)" from debug menu

#### Development Modes

| Command | Purpose | Features |
|---------|---------|----------|
| `npm run dev` | Full development | TypeScript watch + Vite dev server |
| `npm run dev:extension` | Extension only | TypeScript compilation watch |
| `npm run dev:webview` | Webview only | Vite dev server for Vue components |

#### Live Reload Features

- **Automatic Detection**: Extension detects development mode via environment variables
- **Hot Reload**: Vue component changes reflect immediately without reload
- **TypeScript Watch**: Extension code recompiles automatically (requires window reload)
- **No Build Required**: Webview loads directly from `http://localhost:5173` in dev mode

#### Development vs Production

- **Development**: Webview loads from Vite dev server, CSP disabled for HMR
- **Production**: Webview loads from built `dist/index.html`, full CSP enabled

#### Debugging

- **Extension**: Use VS Code debugger with breakpoints in TypeScript files
- **Webview**: Right-click webview → "Inspect Element" for browser dev tools

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

#### How it works

1. **Content Extraction**: Extracts the immediate text after TODO/FIXME for the title
2. **Additional Context**: Captures continuation comments as separate description
3. **Smart Separation**: Keeps the main TODO separate from supporting details to avoid duplication

#### Examples

**Single-line TODO:**
```javascript
// TODO: Implement user authentication
```
- **Content**: "Implement user authentication"
- **Description**: "" (empty - no additional context)

**Multi-line TODO with details:**
```javascript
// TODO: Implement user authentication
// This should include OAuth2 integration with Google and GitHub
// Also need to handle session management and token refresh
```
- **Content**: "Implement user authentication"  
- **Description**: "This should include OAuth2 integration with Google and GitHub Also need to handle session management and token refresh"

**Block comment TODO:**
```javascript
/* FIXME: Performance issue in data processing
 * The current algorithm has O(n²) complexity
 * Consider implementing a hash-based approach for better performance
 */
```
- **Content**: "Performance issue in data processing"
- **Description**: "The current algorithm has O(n²) complexity Consider implementing a hash-based approach for better performance"

#### In the Generated Issues

When creating issues, IssueFlow creates well-structured and informative issues:

**Issue Title Format:**
- Uses only the first line of the TODO comment (the `content`)
- Clean and concise for easy identification
- Example: `TODO: Implement user authentication`

**Issue Body Structure:**
1. **File Location**: Shows the exact file path and line number
2. **Code Context**: The actual code line containing the TODO in a code block
3. **Complete Description**: All related comment lines combined (when available)
4. **Original TODO Content**: The first line for reference

**Example Generated Issue:**

**Title:** `TODO: Implement user authentication`

**Body:**
```markdown
**File:** src/auth/AuthService.ts (line 45)

**Code:**
```
// TODO: Implement user authentication
```

**Complete Description:**
This should include OAuth2 integration with Google and GitHub Also need to handle session management and token refresh

**Original TODO Content:** Implement user authentication
```

This format ensures that:
- **Titles are clean** and easy to scan in issue lists
- **No duplication** between title and description content
- **Additional context** is captured in the description when available
- **Location information** helps developers find the code quickly
- **Clear separation** between the main TODO and supporting details

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
