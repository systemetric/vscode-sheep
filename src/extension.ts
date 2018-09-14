"use strict";
import {
  window,
  commands,
  ExtensionContext,
  StatusBarItem,
  StatusBarAlignment,
  ViewColumn,
  WebviewPanel
} from "vscode";
import * as fs from "fs";
import * as path from "path";

let robotRunIcon: StatusBarItem;

export function activate(context: ExtensionContext) {
  const registerCommand = (
    command: string,
    callback: (...args: any[]) => any
  ) => commands.registerCommand(command, callback);

  let currentPanel: WebviewPanel | undefined = undefined;
  let i = 0;
  setInterval(() => {
    i++;
    if (currentPanel) {
      currentPanel.webview.postMessage({
        event: "log-set",
        data: `${i}\n`
      });
    }
  }, 1000);

  const runRegistration = registerCommand("robot.run", () => {
    window.showInformationMessage("Running on robot...");

    if (currentPanel) {
      currentPanel.reveal(ViewColumn.Two);
    } else {
      currentPanel = window.createWebviewPanel(
        "robot-logs",
        "Robot Logs",
        ViewColumn.Two,
        {
          /*This is pretty dangerous, but it's a private extension, and it's not
          like people are going to put script tags in their logs... right?*/
          enableScripts: true
        }
      );

      const logHTML: string = fs.readFileSync(
        context.asAbsolutePath(path.join("src", "log.html")),
        { encoding: "utf8" }
      );

      currentPanel.webview.html = logHTML;
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions
      );
    }
  });

  const stopRegistration = registerCommand("robot.stop", () => {
    window.showInformationMessage("Stopping robot...");
  });

  robotRunIcon = window.createStatusBarItem(StatusBarAlignment.Left);
  robotRunIcon.text = "$(triangle-right) Run on Robot";
  robotRunIcon.command = "robot.run";
  robotRunIcon.show();
  // const textEditorChanges = window.onDidChangeActiveTextEditor(
  //   updateRobotRunIcon
  // );
  // updateRobotRunIcon();

  context.subscriptions.push(
    runRegistration,
    stopRegistration,
    robotRunIcon
    //textEditorChanges
  );
}

// function updateRobotRunIcon() {
//   const editor = window.activeTextEditor;
//   robotRunIcon[
//     editor && editor.document.languageId === "python" ? "show" : "hide"
//   ]();
// }

export function deactivate() {}
