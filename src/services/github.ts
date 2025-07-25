import * as vscode from 'vscode';
import fetch from 'node-fetch';
import type { Repository } from '../webview/types/Repository';

const API_BASE = 'https://api.github.com';

export class GitHubService {
  constructor(_context: vscode.ExtensionContext) {}

  async ensureLogin(): Promise<void> {
    const existingToken = this.getToken();
    if (existingToken) return;

    const token = await vscode.window.showInputBox({
      prompt: 'Inserisci il tuo GitHub Personal Access Token (scope: repo)',
      ignoreFocusOut: true,
      password: true,
    });

    if (!token) {
      throw new Error('Token GitHub non fornito');
    }

    await this.setToken(token);
  }

  private getToken(): string | undefined {
    return vscode.workspace.getConfiguration().get<string>('issueflow.githubToken');
  }

  private async setToken(token: string): Promise<void> {
    await vscode.workspace.getConfiguration().update('issueflow.githubToken', token, vscode.ConfigurationTarget.Global);
  }

  async getRepos(): Promise<Repository[]> {
    const token = this.getToken();
    if (!token) throw new Error('Token GitHub non configurato');

    const response = await fetch(`${API_BASE}/user/repos?sort=updated&per_page=100`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'IssueFlow-VSCode-Extension',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore GitHub API: ${response.status}`);
    }

    return await response.json() as Repository[];
  }

  async createIssue(repo: Repository, title: string, body: string): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Token GitHub non configurato');

    const response = await fetch(`${API_BASE}/repos/${repo.full_name}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'IssueFlow-VSCode-Extension',
      },
      body: JSON.stringify({
        title,
        body, // Use note as body
      }),
    });

    if (!response.ok) {
      throw new Error(`Errore nella creazione dell'issue GitHub: ${response.status}`);
    }
  }

  async logout(): Promise<void> {
    await vscode.workspace.getConfiguration().update('issueflow.githubToken', undefined, vscode.ConfigurationTarget.Global);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
