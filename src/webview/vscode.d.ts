// Declarations for VS Code webview API
declare function acquireVsCodeApi(): {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

declare global {
  interface Window {
    acquireVsCodeApi: typeof acquireVsCodeApi;
  }
}

export {};
