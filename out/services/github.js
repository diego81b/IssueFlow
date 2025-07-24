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
exports.GitHubService = void 0;
const vscode = __importStar(require("vscode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const API_BASE = 'https://api.github.com';
class GitHubService {
    constructor(_context) { }
    async ensureLogin() {
        const existingToken = this.getToken();
        if (existingToken)
            return;
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
    getToken() {
        return vscode.workspace.getConfiguration().get('issueflow.githubToken');
    }
    async setToken(token) {
        await vscode.workspace.getConfiguration().update('issueflow.githubToken', token, vscode.ConfigurationTarget.Global);
    }
    async getRepos() {
        const token = this.getToken();
        if (!token)
            throw new Error('Token GitHub non configurato');
        const response = await (0, node_fetch_1.default)(`${API_BASE}/user/repos?sort=updated&per_page=100`, {
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'IssueFlow-VSCode-Extension',
            },
        });
        if (!response.ok) {
            throw new Error(`Errore GitHub API: ${response.status}`);
        }
        return await response.json();
    }
    async createIssue(repo, title, body) {
        const token = this.getToken();
        if (!token)
            throw new Error('Token GitHub non configurato');
        const response = await (0, node_fetch_1.default)(`${API_BASE}/repos/${repo.full_name}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'IssueFlow-VSCode-Extension',
            },
            body: JSON.stringify({
                title,
                body,
            }),
        });
        if (!response.ok) {
            throw new Error(`Errore nella creazione dell'issue GitHub: ${response.status}`);
        }
    }
    async logout() {
        await vscode.workspace.getConfiguration().update('issueflow.githubToken', undefined, vscode.ConfigurationTarget.Global);
    }
    isLoggedIn() {
        return !!this.getToken();
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=github.js.map