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
exports.TodoManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TodoManager {
    constructor() {
        this.todos = [];
    }
    async scanWorkspaceForTodos() {
        this.todos = [];
        if (!vscode.workspace.workspaceFolders) {
            return this.todos;
        }
        for (const folder of vscode.workspace.workspaceFolders) {
            await this.scanFolder(folder.uri.fsPath);
        }
        return this.todos;
    }
    async scanFolder(folderPath) {
        const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(folderPath, item.name);
            if (item.isDirectory()) {
                // Skip node_modules, .git, dist, etc.
                if (!['node_modules', '.git', 'dist', 'out', '.vscode'].includes(item.name)) {
                    await this.scanFolder(fullPath);
                }
            }
            else if (item.isFile()) {
                // Scan only text files
                if (this.isTextFile(item.name)) {
                    await this.scanFile(fullPath);
                }
            }
        }
    }
    isTextFile(filename) {
        const textExtensions = ['.ts', '.js', '.vue', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.jsx', '.tsx', '.html', '.css', '.scss', '.less', '.json', '.xml', '.yaml', '.yml', '.md', '.txt'];
        return textExtensions.some(ext => filename.endsWith(ext));
    }
    async scanFile(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const lines = content.split(/\r?\n/);
            lines.forEach((line, index) => {
                const trimmedLine = line.trim();
                if (this.containsTodo(trimmedLine)) {
                    const todoContent = this.extractTodoContent(trimmedLine);
                    this.todos.push({
                        id: `${filePath}-${index + 1}`,
                        file: filePath,
                        line: index + 1,
                        content: todoContent,
                        fullLine: trimmedLine,
                        selected: false
                    });
                }
            });
        }
        catch (error) {
            console.error(`Error scanning file ${filePath}:`, error);
        }
    }
    containsTodo(line) {
        const todoPatterns = [
            /\/\/\s*TODO/i,
            /\/\*\s*TODO/i,
            /#\s*TODO/i,
            /<!--\s*TODO/i,
            /\/\/\s*FIXME/i,
            /\/\*\s*FIXME/i,
            /#\s*FIXME/i,
            /<!--\s*FIXME/i
        ];
        return todoPatterns.some(pattern => pattern.test(line));
    }
    extractTodoContent(line) {
        // Extract the TODO content after the TODO keyword
        const todoMatch = line.match(/(?:TODO|FIXME)[:\s]*(.*)$/i);
        return todoMatch ? todoMatch[1].trim() : line;
    }
    getTodos() {
        return this.todos;
    }
    getSelectedTodos() {
        return this.todos.filter(todo => todo.selected);
    }
    toggleTodoSelection(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.selected = !todo.selected;
        }
    }
    selectAllTodos() {
        this.todos.forEach(todo => todo.selected = true);
    }
    deselectAllTodos() {
        this.todos.forEach(todo => todo.selected = false);
    }
}
exports.TodoManager = TodoManager;
//# sourceMappingURL=TodoManager.js.map