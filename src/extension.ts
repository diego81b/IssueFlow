import * as vscode from 'vscode';
import { TodoWebviewProvider } from './webview/TodoWebviewProvider';
import { TodoManager } from './services/TodoManager';
import { GitHubService } from './services/github';
import { GitLabService } from './services/gitlab';

export function activate(context: vscode.ExtensionContext) {
  console.log('IssueFlow extension is now active!');
  
  const todoManager = new TodoManager();
  const githubService = new GitHubService(context);
  const gitlabService = new GitLabService(context);
  
  // Register command to open TODO manager
  const openTodoManager = vscode.commands.registerCommand('issueflow.openTodoManager', () => {
    console.log('IssueFlow command executed!');
    TodoWebviewProvider.createOrShow(context.extensionUri, todoManager, githubService, gitlabService);
  });

  // Register command to reconfigure GitLab
  const reconfigureGitLab = vscode.commands.registerCommand('issueflow.reconfigureGitLab', async () => {
    try {
      await gitlabService.reconfigureGitLab();
      vscode.window.showInformationMessage('GitLab riconfigurato con successo!');
    } catch (error) {
      vscode.window.showErrorMessage(`Errore nella riconfigurazione GitLab: ${error}`);
    }
  });

  // Legacy command for backward compatibility
  const legacyCommand = vscode.commands.registerCommand('todoIssue.createIssuesFromTODOs', () => {
    TodoWebviewProvider.createOrShow(context.extensionUri, todoManager, githubService, gitlabService);
  });

  context.subscriptions.push(openTodoManager, reconfigureGitLab, legacyCommand);
}

export function deactivate() {}
