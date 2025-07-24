# IssueFlow - VS Code Extension

Una potente estensione per Visual Studio Code che trasforma automaticamente i commenti TODO nel tuo codice in issue su GitHub o GitLab.

## 🚀 Funzionalità

- **Scansione Automatica**: Trova tutti i TODO nel workspace
- **Supporto Multi-Piattaforma**: Crea issue su GitHub e GitLab
- **Interfaccia Moderna**: WebView Vue3 + Tailwind CSS
- **Autenticazione Sicura**: Salva i token in modo sicuro
- **Selezione Granulare**: Scegli quali TODO convertire
- **Gestione Repository**: Seleziona il repository di destinazione

## 📋 Prerequisiti

- Visual Studio Code 1.74.0 o superiore
- Node.js 18+ 
- Account GitHub e/o GitLab con Personal Access Token

## 🛠️ Installazione

### Sviluppo

1. Clona il repository:
```bash
git clone https://github.com/your-username/issue-flow.git
cd issue-flow
```

2. Installa le dipendenze:
```bash
npm install
```

3. Compila l'estensione:
```bash
npm run compile
```

4. Build della webview:
```bash
npm run build:webview
```

5. Premi F5 per avviare una nuova finestra di VS Code con l'estensione caricata

## 🎯 Come Usare

### 1. Setup Iniziale

1. Apri la Command Palette (`Ctrl+Shift+P`)
2. Esegui `IssueFlow: Open TODO Manager`
3. Effettua il login su GitHub e/o GitLab inserendo i tuoi Personal Access Token

### 2. Scansione TODO

1. Clicca su "Scansiona Workspace" per trovare tutti i TODO nel progetto
2. Seleziona i TODO che vuoi convertire in issue
3. Puoi usare "Seleziona tutti" o "Deseleziona tutti" per gestione rapida

### 3. Creazione Issue

1. Scegli la piattaforma (GitHub o GitLab)
2. Seleziona il repository di destinazione
3. Clicca su "Crea Issue" per generare le issue

## 🔧 Configurazione

L'estensione utilizza queste impostazioni in VS Code:

- `issueflow.githubToken`: Token per GitHub (salvato in modo sicuro)
- `issueflow.gitlabToken`: Token per GitLab (salvato in modo sicuro)  
- `issueflow.gitlabUrl`: URL dell'istanza GitLab (default: https://gitlab.com)

## 🏗️ Architettura del Progetto

```
├── src/
│   ├── extension.ts              # Entry point dell'estensione
│   ├── services/
│   │   ├── TodoManager.ts        # Scansione e gestione TODO
│   │   ├── github.ts            # Servizio GitHub API
│   │   └── gitlab.ts            # Servizio GitLab API
│   ├── webview/
│   │   ├── TodoWebviewProvider.ts # Provider per la webview
│   │   ├── App.vue              # App Vue3 principale
│   │   ├── main.ts              # Entry point Vue
│   │   └── style.css            # Stili base
├── dist/                        # Build output webview
├── out/                         # Build output estensione
├── package.json
├── vite.config.ts              # Config Vite per webview
├── tsconfig.extension.json      # Config TypeScript estensione
└── tsconfig.app.json           # Config TypeScript webview
```

## 🧑‍💻 Sviluppo

### Script Disponibili

- `npm run compile`: Compila l'estensione TypeScript
- `npm run watch`: Watch mode per compilazione estensione
- `npm run build:webview`: Build produzione webview Vue3
- `npm run dev:webview`: Dev server webview (per sviluppo UI)

### Formati TODO Supportati

L'estensione riconosce questi pattern di TODO:

```typescript
// TODO: Implementare feature X
/* TODO: Refactor questo codice */
# TODO: Aggiungere test
<!-- TODO: Migliorare UX -->
// FIXME: Bug da correggere
```

## 🔐 Sicurezza

- I token sono salvati in modo sicuro usando l'API di VS Code
- Comunicazione HTTPS con GitHub/GitLab API
- Nessun dato sensibile memorizzato in chiaro

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/amazing-feature`)
3. Commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Push del branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 🆘 Supporto

Se hai problemi o domande:

1. Controlla la [documentazione](https://github.com/your-username/issue-flow/wiki)
2. Cerca nelle [Issues esistenti](https://github.com/your-username/issue-flow/issues)
3. Apri una [nuova Issue](https://github.com/your-username/issue-flow/issues/new)

---

Creato con ❤️ per sviluppatori che vogliono trasformare i TODO in azioni concrete!
