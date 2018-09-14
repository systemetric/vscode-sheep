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
import * as request from "request";

let robotRunIcon: StatusBarItem;

export function activate(context: ExtensionContext) {
  const registerCommand = (
    command: string,
    callback: (...args: any[]) => any
  ) => commands.registerCommand(command, callback);

  let currentPanel: WebviewPanel | undefined = undefined;
  let currentLog = "";

  function checkLog() {
    request.get("http://localhost:4000/run/output", (err, res) => {
      if (err) {
        window.showErrorMessage("Unable to connect to robot!");
      } else {
        const newLog = res.body;

        if (
          newLog.length < currentLog.length ||
          newLog.substring(0, currentLog.length) !== currentLog
        ) {
          currentLog = newLog;
          if (currentPanel) {
            currentPanel.webview.postMessage({
              event: "log-set",
              data: currentLog
            });
          }
        } else {
          const newLogPart = newLog.substring(currentLog.length, newLog.length);
          if (currentPanel && newLogPart) {
            currentPanel.webview.postMessage({
              event: "log-append",
              data: newLogPart
            });
          }
          currentLog = newLog;
        }
      }
    });
  }

  const runRegistration = registerCommand("robot.run", () => {
    // window.showInformationMessage("Running on robot...");

    if (currentPanel) {
      currentPanel.reveal(ViewColumn.Two);
    } else {
      currentLog = "";
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

      currentPanel.webview.onDidReceiveMessage(
        msg => {
          checkLog();
          if (msg.event === "loaded" || msg.event === "image-loaded") {
            setTimeout(() => {
              if (currentPanel) {
                currentPanel.webview.postMessage({
                  event: "image",
                  data: `http://localhost:4000/static/output.jpg?nocache=${Date.now()}`
                });
              }
            }, msg.event === "image-loaded" ? 500 : 0);
          }
        },
        undefined,
        context.subscriptions
      );

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
    // window.showInformationMessage("Stopping robot...");
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
