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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabService = void 0;
const vscode = __importStar(require("vscode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class GitLabService {
    constructor(_context) { }
    getApiBase() {
        const url = vscode.workspace.getConfiguration().get('issueflow.gitlabUrl') || 'https://gitlab.com';
        return `${url}/api/v4`;
    }
    async ensureLogin() {
        // First, ensure GitLab URL is configured
        await this.ensureGitLabUrl();
        const existingToken = this.getToken();
        if (existingToken) {
            // Test the existing token
            try {
                await this.testToken(existingToken);
                return; // Token is valid
            }
            catch (error) {
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
    async ensureGitLabUrl() {
        const existingUrl = this.getGitLabUrl();
        if (existingUrl && existingUrl !== 'https://gitlab.com') {
            // URL already configured and it's not the default, keep it
            return;
        }
        const urlChoice = await vscode.window.showQuickPick([
            {
                label: 'GitLab.com (https://gitlab.com)',
                description: 'Usa GitLab.com ufficiale',
                url: 'https://gitlab.com'
            },
            {
                label: 'GitLab personalizzato',
                description: 'Inserisci URL di una installazione GitLab personalizzata',
                url: 'custom'
            }
        ], {
            placeHolder: 'Seleziona il tipo di GitLab da utilizzare',
            ignoreFocusOut: true
        });
        if (!urlChoice) {
            throw new Error('URL GitLab non selezionato');
        }
        let finalUrl = urlChoice.url;
        if (urlChoice.url === 'custom') {
            const customUrl = await vscode.window.showInputBox({
                prompt: 'Inserisci l\'URL della tua installazione GitLab (es. https://gitlab.azienda.com)',
                placeHolder: 'https://gitlab.azienda.com',
                ignoreFocusOut: true,
                validateInput: (value) => {
                    if (!value)
                        return 'URL obbligatorio';
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
    getGitLabUrl() {
        return vscode.workspace.getConfiguration().get('issueflow.gitlabUrl') || 'https://gitlab.com';
    }
    async setGitLabUrl(url) {
        await vscode.workspace.getConfiguration().update('issueflow.gitlabUrl', url, vscode.ConfigurationTarget.Global);
    }
    async testToken(token) {
        const response = await (0, node_fetch_1.default)(`${this.getApiBase()}/user`, {
            headers: {
                'PRIVATE-TOKEN': token,
                'User-Agent': 'IssueFlow-VSCode-Extension',
            },
        });
        if (!response.ok) {
            throw new Error(`Token GitLab non valido: ${response.status}`);
        }
    }
    getToken() {
        return vscode.workspace.getConfiguration().get('issueflow.gitlabToken');
    }
    async setToken(token) {
        await vscode.workspace.getConfiguration().update('issueflow.gitlabToken', token, vscode.ConfigurationTarget.Global);
    }
    async getRepos() {
        const token = this.getToken();
        if (!token)
            throw new Error('Token GitLab non configurato');
        const response = await (0, node_fetch_1.default)(`${this.getApiBase()}/projects?membership=true&simple=true&per_page=100&order_by=last_activity_at`, {
            headers: {
                'PRIVATE-TOKEN': token,
                'User-Agent': 'IssueFlow-VSCode-Extension',
            },
        });
        if (!response.ok) {
            throw new Error(`Errore GitLab API: ${response.status}`);
        }
        return await response.json();
    }
    async createIssue(repo, title, description) {
        const token = this.getToken();
        if (!token)
            throw new Error('Token GitLab non configurato');
        const encodedPath = encodeURIComponent(repo.path_with_namespace ?? "");
        const response = await (0, node_fetch_1.default)(`${this.getApiBase()}/projects/${encodedPath}/issues`, {
            method: 'POST',
            headers: {
                'PRIVATE-TOKEN': token,
                'Content-Type': 'application/json',
                'User-Agent': 'IssueFlow-VSCode-Extension',
            },
            body: JSON.stringify({
                title,
                description,
            }),
        });
        if (!response.ok) {
            throw new Error(`Errore nella creazione dell'issue GitLab: ${response.status}`);
        }
    }
    async logout() {
        await vscode.workspace.getConfiguration().update('issueflow.gitlabToken', undefined, vscode.ConfigurationTarget.Global);
    }
    async reconfigureGitLab() {
        // Clear existing configuration
        await vscode.workspace.getConfiguration().update('issueflow.gitlabUrl', undefined, vscode.ConfigurationTarget.Global);
        await vscode.workspace.getConfiguration().update('issueflow.gitlabToken', undefined, vscode.ConfigurationTarget.Global);
        // Trigger new configuration
        await this.ensureLogin();
    }
    getConfiguredUrl() {
        return this.getGitLabUrl();
    }
    isLoggedIn() {
        return !!this.getToken();
    }
}
exports.GitLabService = GitLabService;
//# sourceMappingURL=gitlab.js.map