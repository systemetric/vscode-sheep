import {
  Disposable,
  commands,
  window,
  workspace,
  Uri,
  WorkspaceFolder
} from "vscode";
// import { Response } from "request";
import LogViewService from "./log-view/log-view";
import ZipperService from "./zipper";
import ShepherdService from "./shepherd";
//import StatusIconsService from "./status-icons";

export default class CommandsService implements Disposable {
  private _disposable: Disposable;
  private _fileName: string | undefined = undefined;
  private _workspaceFolder: WorkspaceFolder | undefined = undefined;

  constructor(
    private shepherd: ShepherdService,
    private logView: LogViewService,
    //private statusIcons: StatusIconsService
    private zipper: ZipperService
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
      this._fileName = editor.document.fileName;
      this._workspaceFolder = workspace.getWorkspaceFolder(
        Uri.file(this._fileName)
      );

      if (!this._workspaceFolder) {
        window.showErrorMessage("The file must be part of a workspace.");
        return;
      }

      if (this._workspaceFolder.uri.scheme !== "file") {
        window.showErrorMessage("The file must be stored on the local disk.");
        return;
      }
    }

    if (this._fileName && this._workspaceFolder) {
      const workspacePath = this._workspaceFolder.uri.fsPath;

      await this.zipper.zip(workspacePath, this._fileName);

      try {
        await this.shepherd.upload(this.zipper.zipPath);
        await this.shepherd.start();
        window.showInformationMessage("Started robot!");
      } catch (e) {
        this.logView.showNoConnection();
        window.showErrorMessage("Unable to connect to robot!");
      }
    } else {
      window.showErrorMessage(
        "You must open a python file to run on the robot."
      );
    }
  }

  private async _stop(): Promise<void> {
    //this.logView.dispose();
    try {
      await this.shepherd.stop();
      window.showInformationMessage("Stopped robot!");
    } catch (e) {
      window.showErrorMessage("Unable to connect to robot!");
    }
  }

  public dispose(): void {
    this._disposable.dispose();
  }
}
