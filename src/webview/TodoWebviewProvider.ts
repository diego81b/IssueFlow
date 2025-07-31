import * as vscode from 'vscode';
import { TodoManager } from '../services/TodoManager';
import type { TodoItem } from '../webview/types/TodoItem';
import { GitHubService } from '../services/github';
import { GitLabService } from '../services/gitlab';

export class TodoWebviewProvider {
	// <- Rimuovi "implements vscode.WebviewViewProvider"
	public static readonly viewType = 'issueflow.todoView';
	private static _currentPanel?: vscode.WebviewPanel;

	constructor(
		private _extensionUri: vscode.Uri,
		private _todoManager: TodoManager,
		private _githubService: GitHubService,
		private _gitlabService: GitLabService,
	) {}

	public static createOrShow(
		extensionUri: vscode.Uri,
		todoManager: TodoManager,
		githubService: GitHubService,
		gitlabService: GitLabService,
	) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (TodoWebviewProvider._currentPanel) {
			TodoWebviewProvider._currentPanel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			TodoWebviewProvider.viewType,
			'IssueFlow - TODO Manager',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.joinPath(extensionUri, 'dist'),
					vscode.Uri.joinPath(extensionUri, 'src', 'webview'),
					vscode.Uri.joinPath(extensionUri, 'src', 'webview', 'assets'),
				],
			},
		);

		TodoWebviewProvider._currentPanel = panel;
		const provider = new TodoWebviewProvider(
			extensionUri,
			todoManager,
			githubService,
			gitlabService,
		);
		provider._update(panel.webview);

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			(message) => provider._handleMessage(message),
			undefined,
			[],
		);

		panel.onDidDispose(
			() => {
				TodoWebviewProvider._currentPanel = undefined;
			},
			null,
			[],
		);
	}

	private _update(webview: vscode.Webview) {
		webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const fs = require('fs');
		const path = require('path');

		const distPath = path.join(this._extensionUri.fsPath, 'dist');
		const htmlPath = path.join(distPath, 'index.html');

		let html;
		try {
			html = fs.readFileSync(htmlPath, 'utf8');
		} catch (error) {
			return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Building...</title>
        </head>
        <body>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h2>Building webview...</h2>
            <p>Please run: <code>npm run build:webview</code></p>
            <p>Or use: <code>npm run dev</code> for live development</p>
          </div>
        </body>
        </html>
      `;
		}

    // Replace paths with webview URIs
    const distUri = webview.asWebviewUri(vscode.Uri.file(distPath));

    // Solo assets e file specifici - rimuoviamo le regex generiche
    html = html.replace(/href="\/assets\//g, `href="${distUri}/assets/`);
    html = html.replace(/src="\/assets\//g, `src="${distUri}/assets/`);
    html = html.replace(/href="\/vite\.svg"/g, `href="${distUri}/vite.svg"`);
    html = html.replace(/src="\/vite\.svg"/g, `src="${distUri}/vite.svg"`);

    // Add CSP meta tag con più permessi per le immagini
    const nonce = getNonce();
    html = html.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        `<meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; img-src ${webview.cspSource} https: data: blob: 'unsafe-inline';">`,
    );

    // Add nonce to script tags
    html = html.replace(/(<script[^>]*)(>)/g, `$1 nonce="${nonce}"$2`);

    return html;
	}

	private async _handleMessage(message: any) {
		switch (message.type) {
			case 'scanTodos':
				try {
					// Reset appState prima della scansione
					this._postMessage({ type: 'resetAppState' });

					const todos = await this._todoManager.scanWorkspaceForTodos();
					this._postMessage({ type: 'todosScanned', todos });
				} catch (error) {
					this._postMessage({
						type: 'error',
						message: 'Errore durante la scansione dei TODO',
					});
				} finally {
					this._postMessage({ type: 'scanTodosDone' }); // PATCH: notifica fine scansione
				}
				break;

			case 'githubLogin':
				console.log('GitHub login attempt...');
				try {
					await this._githubService.ensureLogin();
					console.log('GitHub login successful');
					this._postMessage({
						type: 'loginSuccess',
						platform: 'github',
						authStatus: {
							github: this._githubService.isLoggedIn(),
							gitlab: this._gitlabService.isLoggedIn(),
						},
					});
				} catch (error) {
					console.error('GitHub login failed:', error);
					this._postMessage({
						type: 'error',
						message: (error as Error).message,
					});
				}
				break;

			case 'gitlabLogin':
				console.log('GitLab login attempt...');
				try {
					await this._gitlabService.ensureLogin();
					console.log('GitLab login successful');
					this._postMessage({
						type: 'loginSuccess',
						platform: 'gitlab',
						authStatus: {
							github: this._githubService.isLoggedIn(),
							gitlab: this._gitlabService.isLoggedIn(),
						},
					});
				} catch (error) {
					console.error('GitLab login failed:', error);
					this._postMessage({
						type: 'error',
						message: (error as Error).message,
					});
				}
				break;

			case 'getGithubRepos':
				console.log('Fetching GitHub repos...');
				try {
					const repos = await this._githubService.getRepos();
					console.log('GitHub repos fetched:', repos.length);
					this._postMessage({ type: 'githubRepos', repos });
				} catch (error) {
					console.error('Failed to fetch GitHub repos:', error);
					this._postMessage({
						type: 'error',
						message: (error as Error).message,
					});
				}
				break;

			case 'getGitlabRepos':
				console.log('Fetching GitLab repos...');
				try {
					const repos = await this._gitlabService.getRepos();
					console.log('GitLab repos fetched:', repos.length);
					this._postMessage({ type: 'gitlabRepos', repos });
				} catch (error) {
					console.error('Failed to fetch GitLab repos:', error);
					this._postMessage({
						type: 'error',
						message: (error as Error).message,
					});
				}
				break;

			case 'createIssues':
				console.log('Creating issues...', {
					platform: message.platform,
					repo: message.repo?.full_name || message.repo?.path_with_namespace,
					todoCount: message.todos?.length,
				});
				await this._createIssues(message.platform, message.repo, message.todos);
				break;

			case 'getInitialAuthStatus':
				this._postMessage({
					type: 'authStatus',
					github: this._githubService.isLoggedIn(),
					gitlab: this._gitlabService.isLoggedIn(),
				});
				break;

			case 'getGitLabUrl':
				this._postMessage({
					type: 'gitlabUrl',
					url: this._gitlabService.getConfiguredUrl(),
				});
				break;

			case 'reconfigureGitLab':
				try {
					await this._gitlabService.reconfigureGitLab();
					this._postMessage({ type: 'loginSuccess', platform: 'gitlab' });
				} catch (error) {
					this._postMessage({
						type: 'error',
						message: (error as Error).message,
					});
				}
				break;

			case 'logout':
				try {
					if (message.platform === 'github') {
						await this._githubService.logout();
					} else if (message.platform === 'gitlab') {
						await this._gitlabService.logout();
					}
					this._postMessage({
						type: 'logoutSuccess',
						platform: message.platform,
					});
				} catch (error) {
					this._postMessage({
						type: 'error',
						message: (error as Error).message,
					});
				}
				break;
		}
	}

	private async _createIssues(
		platform: 'github' | 'gitlab',
		repo: any,
		todos: TodoItem[],
	) {
		console.log('_createIssues called with:', { platform, repo, todos });

		try {
			console.log(`Creating ${todos.length} issues on ${platform}...`);

			for (const todo of todos) {
				console.log('Creating issue for todo:', todo);

				// Use only the first line content in the title
				const title = `TODO: ${todo.content || `Linea ${todo.line}`}`;

				// Create a detailed body starting with file location
				let body = `**File:** ${todo.file} (linea ${todo.line})\n\n`;

				// Add the full description if it's different from content
				if (todo.description && todo.description !== todo.content) {
					body += `**Descrizione completa:**\n${todo.description}\n\n`;
				}

				body += `**Contenuto TODO:** ${todo.content}`;

				console.log('Issue details:', { title, body });

				if (platform === 'github') {
					console.log('Calling GitHub createIssue...');
					await this._githubService.createIssue(repo, title, body);
					console.log('GitHub issue created successfully');
				} else if (platform === 'gitlab') {
					console.log('Calling GitLab createIssue...');
					await this._gitlabService.createIssue(repo, title, body);
					console.log('GitLab issue created successfully');
				}
			}

			console.log(`All ${todos.length} issues created successfully`);
			this._postMessage({
				type: 'issuesCreated',
				platform,
				count: todos.length,
			});
		} catch (error) {
			console.error('Error creating issues:', error);
			this._postMessage({ type: 'error', message: (error as Error).message });
		}
	}

	private _postMessage(message: any) {
		if (TodoWebviewProvider._currentPanel) {
			TodoWebviewProvider._currentPanel.webview.postMessage(message);
		}
	}
}

function getNonce() {
	let text = '';
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
