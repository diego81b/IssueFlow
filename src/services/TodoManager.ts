import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { TodoItem } from '../webview/types/TodoItem';
import { TodoType } from '../webview/types/TodoType';

export class TodoManager {
  private todos: TodoItem[] = [];

  async scanWorkspaceForTodos(): Promise<TodoItem[]> {
    // Reset completo della cache
    this.todos = [];
    
    if (!vscode.workspace.workspaceFolders) {
      return this.todos;
    }

    for (const folder of vscode.workspace.workspaceFolders) {
      await this.scanFolder(folder.uri.fsPath);
    }

    console.log('TodoManager - scansione completata, todos trovati:', this.todos.length);
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
          const todoType = this.determineTodoType(trimmedLine);
          const description = this.extractTodoDescription(lines, index);
          this.todos.push({
            id: `${filePath}-${index + 1}`,
            file: filePath,
            line: index + 1,
            content: todoContent,
            type: todoType,
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

  private determineTodoType(line: string): TodoType {
    if (/FIXME/i.test(line)) {
      return TodoType.FIXME;
    }
    // In futuro possiamo aggiungere altri tipi come BUG
    return TodoType.TODO;
  }

  private extractTodoDescription(lines: string[], todoLineIndex: number): string {
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
    
    // Look for context in the previous lines as well (but less priority)
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
    
    // Combine only the additional context lines (exclude the base description)
    const allParts = [...previousContextLines, ...contextLines]
      .filter(part => part.length > 0)
      .filter((part, index, array) => array.indexOf(part) === index); // Remove duplicates
    
    // Return the combined additional context, or empty string if no additional context
    return allParts.join(' ').trim();
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
    // Migrazione per vecchi TODO senza il campo type
    return this.todos.map(todo => {
      if (!todo.type) {
        // Determina il tipo basandosi sul contenuto se manca
        const hasFixme = todo.content?.toLowerCase().includes('fixme') || 
                        todo.description?.toLowerCase().includes('fixme');
        return {
          ...todo,
          type: hasFixme ? TodoType.FIXME : TodoType.TODO
        };
      }
      return todo;
    });
  }
}
