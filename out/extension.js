"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const TodoWebviewProvider_1 = require("./webview/TodoWebviewProvider");
const TodoManager_1 = require("./services/TodoManager");
const github_1 = require("./services/github");
const gitlab_1 = require("./services/gitlab");
function activate(context) {
    console.log('IssueFlow extension is now active!');
    const todoManager = new TodoManager_1.TodoManager();
    const githubService = new github_1.GitHubService(context);
    const gitlabService = new gitlab_1.GitLabService(context);
    // Register command to open TODO manager
    const openTodoManager = vscode.commands.registerCommand('issueflow.openTodoManager', () => {
        console.log('IssueFlow command executed!');
        TodoWebviewProvider_1.TodoWebviewProvider.createOrShow(context.extensionUri, todoManager, githubService, gitlabService);
    });
    // Register command to reconfigure GitLab
    const reconfigureGitLab = vscode.commands.registerCommand('issueflow.reconfigureGitLab', async () => {
        try {
            await gitlabService.reconfigureGitLab();
            // Update auth status in current webview if open
            TodoWebviewProvider_1.TodoWebviewProvider.updateAuthStatus(githubService, gitlabService);
            vscode.window.showInformationMessage('GitLab riconfigurato con successo!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Errore nella riconfigurazione GitLab: ${error}`);
        }
    });
    // Legacy command for backward compatibility
    const legacyCommand = vscode.commands.registerCommand('todoIssue.createIssuesFromTODOs', () => {
        TodoWebviewProvider_1.TodoWebviewProvider.createOrShow(context.extensionUri, todoManager, githubService, gitlabService);
    });
    context.subscriptions.push(openTodoManager, reconfigureGitLab, legacyCommand);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map