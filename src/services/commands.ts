import { Disposable, commands, window, workspace, Uri } from "vscode";
import LogViewService from "./log-view/log-view";
import ZipperService from "./zipper";
//import StatusIconsService from "./status-icons";

export default class CommandsService implements Disposable {
  private _disposable: Disposable;

  constructor(
    private logView: LogViewService,
    private zipper: ZipperService //, private statusIcons: StatusIconsService
  ) {
    this._disposable = Disposable.from(
      commands.registerCommand("robot.run", this._run, this),
      commands.registerCommand("robot.stop", this._stop, this)
    );
  }

  private async _run(): Promise<void> {
    this.logView.show();
    const editor = window.activeTextEditor;

    if (editor) {
      const fileName = editor.document.fileName;
      const workspaceFolder = workspace.getWorkspaceFolder(
        Uri.file(editor.document.fileName)
      );

      if (!workspaceFolder) {
        window.showErrorMessage("The file must be part of a workspace!");
        return;
      }

      if (workspaceFolder.uri.scheme !== "file") {
        window.showErrorMessage("The file must be stored on the local disk!");
        return;
      }

      const workspacePath = workspaceFolder.uri.fsPath;

      await this.zipper.zip(workspacePath, fileName);
    }
  }

  private _stop(): void {
    //this.logView.dispose();
  }

  public dispose(): void {
    this._disposable.dispose();
  }
}
