"use strict";
import { ExtensionContext } from "vscode";
import ShepherdService from "./services/shepherd";
import LogViewService from "./services/log-view/log-view";
import StatusIconsService from "./services/status-icons";
import ZipperService from "./services/zipper";
import CommandsService from "./services/commands";

export function activate(context: ExtensionContext): void {
  // function checkImage() {
  //   if (currentPanel) {
  //     currentPanel.webview.postMessage({
  //       event: "image",
  //       data: `http://localhost:4000/static/output.jpg?nocache=${Date.now()}`
  //     });
  //   }
  // }

  const shepherdService: ShepherdService = new ShepherdService();
  const logViewService: LogViewService = new LogViewService(
    context,
    shepherdService
  );
  const statusIconsService: StatusIconsService = new StatusIconsService(
    context
  );
  const zipperService: ZipperService = new ZipperService(context);
  const commandsService: CommandsService = new CommandsService(
    logViewService,
    zipperService
  );

  context.subscriptions.push(
    logViewService,
    statusIconsService,
    commandsService
  );
}

export function deactivate(): void {}
