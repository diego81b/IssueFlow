import * as vscode from 'vscode';
import fetch from 'node-fetch';
import type { Repository } from '../webview/types/Repository';

export class GitLabService {
  constructor(_context: vscode.ExtensionContext) {}

  private getApiBase(): string {
    const url = vscode.workspace.getConfiguration().get<string>('issueflow.gitlabUrl') || 'https://gitlab.com';
    return `${url}/api/v4`;
  }

  async ensureLogin(): Promise<void> {
    // First, ensure GitLab URL is configured
    await this.ensureGitLabUrl();
    
    const existingToken = this.getToken();
    if (existingToken) {
      // Test the existing token
      try {
        await this.testToken(existingToken);
        return; // Token is valid
      } catch (error) {
        console.log('Existing GitLab token is invalid, requesting new one');
        // Token is invalid, continue to request new one
      }
    }

    const token = await vscode.window.showInputBox({
      prompt: 'Inserisci il tuo GitLab Personal Access Token (scope: api)',
      ignoreFocusOut: true,
      password: true,
    });

    if (!token) {
      throw new Error('Token GitLab non fornito');
    }

    // Test the new token before saving
    await this.testToken(token);
    await this.setToken(token);
  }

  private async ensureGitLabUrl(): Promise<void> {
    const existingUrl = this.getGitLabUrl();
    let urlOptions = [
      {
        label: 'GitLab.com (https://gitlab.com)',
        description: 'Usa GitLab.com ufficiale',
        url: 'https://gitlab.com'
      }
    ];
    if (existingUrl && existingUrl !== 'https://gitlab.com') {
      urlOptions.push({
        label: `Usa URL attuale (${existingUrl})`,
        description: 'Conferma o modifica l\'URL attualmente configurato',
        url: existingUrl
      });
    }
    urlOptions.push({
      label: existingUrl && existingUrl !== 'https://gitlab.com'
        ? `GitLab personalizzato (attuale: ${existingUrl})`
        : 'GitLab personalizzato',
      description: 'Inserisci URL di una installazione GitLab personalizzata',
      url: 'custom'
    });

    const urlChoice = await vscode.window.showQuickPick(urlOptions, {
      placeHolder: 'Seleziona o conferma l\'URL di GitLab da utilizzare',
      ignoreFocusOut: true
    });

    if (!urlChoice) {
      throw new Error('URL GitLab non selezionato');
    }

    let finalUrl = urlChoice.url;

    if (urlChoice.url === 'custom' || (existingUrl && urlChoice.url === existingUrl)) {
      const customUrl = await vscode.window.showInputBox({
        prompt: `Inserisci l'URL della tua installazione GitLab (attuale: ${existingUrl || 'https://gitlab.com'})`,
        placeHolder: existingUrl || 'https://gitlab.azienda.com',
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value) return 'URL obbligatorio';
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            return 'URL deve iniziare con http:// o https://';
          }
          return undefined;
        }
      });

      if (!customUrl) {
        throw new Error('URL GitLab personalizzato non fornito');
      }

      finalUrl = customUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    await this.setGitLabUrl(finalUrl);
  }

  private getGitLabUrl(): string {
    return vscode.workspace.getConfiguration().get<string>('issueflow.gitlabUrl') || 'https://gitlab.com';
  }

  private async setGitLabUrl(url: string): Promise<void> {
    await vscode.workspace.getConfiguration().update('issueflow.gitlabUrl', url, vscode.ConfigurationTarget.Global);
  }

  private async testToken(token: string): Promise<void> {
    const response = await fetch(`${this.getApiBase()}/user`, {
      headers: { 
        'PRIVATE-TOKEN': token,
        'User-Agent': 'IssueFlow-VSCode-Extension',
      },
    });

    if (!response.ok) {
      throw new Error(`Token GitLab non valido: ${response.status}`);
    }
  }

  private getToken(): string | undefined {
    return vscode.workspace.getConfiguration().get<string>('issueflow.gitlabToken');
  }

  private async setToken(token: string): Promise<void> {
    await vscode.workspace.getConfiguration().update('issueflow.gitlabToken', token, vscode.ConfigurationTarget.Global);
  }

  async getRepos(): Promise<Repository[]> {
    const token = this.getToken();
    if (!token) throw new Error('Token GitLab non configurato');

    const response = await fetch(`${this.getApiBase()}/projects?membership=true&simple=true&per_page=100&order_by=last_activity_at`, {
      headers: { 
        'PRIVATE-TOKEN': token,
        'User-Agent': 'IssueFlow-VSCode-Extension',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore GitLab API: ${response.status}`);
    }

    return await response.json() as Repository[];
  }

  async createIssue(repo: Repository, title: string, description: string): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Token GitLab non configurato');

    const encodedPath = encodeURIComponent(repo.path_with_namespace ?? "");
    const response = await fetch(`${this.getApiBase()}/projects/${encodedPath}/issues`, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': token,
        'Content-Type': 'application/json',
        'User-Agent': 'IssueFlow-VSCode-Extension',
      },
      body: JSON.stringify({
        title,
        description: description, // Use note as description
      }),
    });

    if (!response.ok) {
      throw new Error(`Errore nella creazione dell'issue GitLab: ${response.status}`);
    }
  }

  async logout(): Promise<void> {
    await vscode.workspace.getConfiguration().update('issueflow.gitlabToken', undefined, vscode.ConfigurationTarget.Global);
  }

  async reconfigureGitLab(): Promise<void> {
    // Clear existing configuration
    await vscode.workspace.getConfiguration().update('issueflow.gitlabUrl', undefined, vscode.ConfigurationTarget.Global);
    await vscode.workspace.getConfiguration().update('issueflow.gitlabToken', undefined, vscode.ConfigurationTarget.Global);
    
    // Trigger new configuration
    await this.ensureLogin();
  }

  getConfiguredUrl(): string {
    return this.getGitLabUrl();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
