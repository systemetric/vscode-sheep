import ShepherdService from "../shepherd";
import {
  WebviewPanel,
  ViewColumn,
  window,
  ExtensionContext,
  Disposable
} from "vscode";
import * as fs from "fs";
import * as path from "path";

export default class LogViewService implements Disposable {
  private _panel: WebviewPanel | undefined;
  private _logViewHTML: string = "";

  constructor(
    private context: ExtensionContext,
    private shepherd: ShepherdService
  ) {
    this._panel = undefined;
    this._updateLogViewHTML();
  }

  private _updateLogViewHTML() {
    this._logViewHTML = fs.readFileSync(
      this.context.asAbsolutePath(
        path.join("src", "services", "log-view", "log-view.html")
      ),
      {
        encoding: "utf8"
      }
    );
  }

  private _postMessage(event: string, data?: any): void {
    if (this._panel && this._panel.visible) {
      this._panel.webview.postMessage({ event, data });
    }
  }

  public showNoConnection(): void {
    this._postMessage("no-connection");
  }

  public show(): void {
    if (this._panel) {
      this._panel.reveal(ViewColumn.Two);
    } else {
      this.shepherd.resetLog();
      this._panel = window.createWebviewPanel(
        "robot-logs",
        "Robot Logs",
        ViewColumn.Two,
        {
          /*This is pretty dangerous, but it's a private extension, and it's not
          like people are going to put script tags in their logs... right?*/
          enableScripts: true
        }
      );

      //TODO: remove when finished
      this._updateLogViewHTML();

      this._panel.webview.html = this._logViewHTML;

      this._panel.webview.onDidReceiveMessage(async msg => {
        switch (msg.event) {
          case "request-log":
            const log = await this.shepherd.getLog();
            if (log.err) {
              this.showNoConnection();
            } else {
              this._postMessage("log", log);
            }
            break;
          case "request-image":
            this._postMessage("image", this.shepherd.getPhotoURL());
            break;
        }
      });

      this._panel.onDidDispose(
        () => {
          this._panel = undefined;
        },
        null,
        this.context.subscriptions
      );
    }
  }

  public dispose(): void {
    if (this._panel) {
      this._panel.dispose();
    }
  }
}
