import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { TodoItem } from '../webview/types/TodoItem';

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
          const description = this.extractTodoDescription(lines, index);
          this.todos.push({
            id: `${filePath}-${index + 1}`,
            file: filePath,
            line: index + 1,
            content: todoContent,
            fullLine: trimmedLine,
            description: description,
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

  private extractTodoDescription(lines: string[], todoLineIndex: number): string {
    const todoLine = lines[todoLineIndex].trim();
    let description = this.extractTodoContent(todoLine);
    
    // Look for additional context in the following lines
    const contextLines: string[] = [];
    
    // Check the next few lines for continuation of the TODO comment
    for (let i = todoLineIndex + 1; i < Math.min(todoLineIndex + 4, lines.length); i++) {
      const nextLine = lines[i].trim();
      
      // If it's an empty line, stop looking
      if (!nextLine) break;
      
      // Check if it's a continuation of the comment
      if (this.isCommentContinuation(nextLine)) {
        const commentContent = this.extractCommentContent(nextLine);
        if (commentContent && !this.containsTodo(commentContent)) {
          contextLines.push(commentContent);
        }
      } else {
        // If it's not a comment continuation, stop looking
        break;
      }
    }
    
    // Look for context in the previous lines as well
    const previousContextLines: string[] = [];
    for (let i = todoLineIndex - 1; i >= Math.max(todoLineIndex - 2, 0); i--) {
      const prevLine = lines[i].trim();
      
      // If it's an empty line, stop looking
      if (!prevLine) break;
      
      // Check if it's a comment that might provide context
      if (this.isCommentContinuation(prevLine)) {
        const commentContent = this.extractCommentContent(prevLine);
        if (commentContent && !this.containsTodo(commentContent)) {
          previousContextLines.unshift(commentContent);
        }
      } else {
        // If it's not a comment, stop looking
        break;
      }
    }
    
    // Combine all parts
    const allParts = [...previousContextLines, description, ...contextLines]
      .filter(part => part.length > 0);
    
    return allParts.join(' ').trim() || description;
  }

  private isCommentContinuation(line: string): boolean {
    // Check for various comment patterns
    return /^\s*(?:\/\/|\/\*|\*|#|<!--|-->)/.test(line);
  }

  private extractCommentContent(line: string): string {
    // Remove comment markers and extract content
    return line
      .replace(/^\s*(?:\/\/|\/\*|\*|#|<!--|-->)\s*/, '')
      .replace(/\*\/\s*$/, '')
      .trim();
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
