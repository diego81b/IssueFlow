import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { TodoItem } from '../webview/types/TodoItem';

export type { TodoItem } from '../webview/types/TodoItem';

export class TodoManager {
  private todos: TodoItem[] = [];

  async scanWorkspaceForTodos(): Promise<TodoItem[]> {
    this.todos = [];
    
    if (!vscode.workspace.workspaceFolders) {
      return this.todos;
    }

    for (const folder of vscode.workspace.workspaceFolders) {
      await this.scanFolder(folder.uri.fsPath);
    }

    return this.todos;
  }

  private async scanFolder(folderPath: string): Promise<void> {
    const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(folderPath, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules, .git, dist, etc.
        if (!['node_modules', '.git', 'dist', 'out', '.vscode'].includes(item.name)) {
          await this.scanFolder(fullPath);
        }
      } else if (item.isFile()) {
        // Scan only text files
        if (this.isTextFile(item.name)) {
          await this.scanFile(fullPath);
        }
      }
    }
  }

  private isTextFile(filename: string): boolean {
    const textExtensions = ['.ts', '.js', '.vue', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.jsx', '.tsx', '.html', '.css', '.scss', '.less', '.json', '.xml', '.yaml', '.yml', '.md', '.txt'];
    return textExtensions.some(ext => filename.endsWith(ext));
  }

  private async scanFile(filePath: string): Promise<void> {
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
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error);
    }
  }

  private containsTodo(line: string): boolean {
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

  private extractTodoContent(line: string): string {
    // Extract the TODO content after the TODO keyword
    const todoMatch = line.match(/(?:TODO|FIXME)[:\s]*(.*)$/i);
    return todoMatch ? todoMatch[1].trim() : line;
  }

  getTodos(): TodoItem[] {
    return this.todos;
  }

  getSelectedTodos(): TodoItem[] {
    return this.todos.filter(todo => todo.selected);
  }

  toggleTodoSelection(todoId: string): void {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.selected = !todo.selected;
    }
  }

  selectAllTodos(): void {
    this.todos.forEach(todo => todo.selected = true);
  }

  deselectAllTodos(): void {
    this.todos.forEach(todo => todo.selected = false);
  }
}
