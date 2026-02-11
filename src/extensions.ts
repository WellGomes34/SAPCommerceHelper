import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ITEMS } from './config/items';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('sapCommerceHelper.open', () => {
      const webviewPath = path.join(context.extensionPath, 'src', 'webview');

      const panel = vscode.window.createWebviewPanel(
        'sapCommerceHelper',
        'SAP Commerce Helper',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(webviewPath)]
        }
      );

      const htmlPath = path.join(webviewPath, 'wizard.html');
      let html = fs.readFileSync(htmlPath, 'utf8');

      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(webviewPath, 'wizard.js'))
      );

      const styleUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(webviewPath, 'wizard.css'))
      );

      html = html
        .replace('{{scriptUri}}', scriptUri.toString())
        .replace('{{styleUri}}', styleUri.toString());

      panel.webview.html = html;

      panel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'getItems') {
          panel.webview.postMessage({
            command: 'items',
            items: ITEMS.map(({ template, ...rest }) => rest)
          });
          return;
        }

        if (message.command === 'generate') {
          const item = ITEMS.find(i => i.id === message.type);
          if (!item) {
            vscode.window.showErrorMessage('Invalid wizard item');
            return;
          }

          const code = item.template(message.data);

          const document = await vscode.workspace.openTextDocument({
            content: code,
            language: item.language
          });

          vscode.window.showTextDocument(document, { preview: true });
        }
      });
    })
  );
}

export function deactivate() {}
