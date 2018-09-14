import { Disposable, commands } from "vscode";
import LogViewService from "./log-view/log-view";

export default class CommandsService implements Disposable {
  private _disposable: Disposable;

  constructor(private logView: LogViewService) {
    this._disposable = Disposable.from(
      commands.registerCommand("robot.run", this._run, this),
      commands.registerCommand("robot.stop", this._stop, this)
    );
  }

  private _run(): void {
    this.logView.show();
  }

  private _stop(): void {
    //this.logView.dispose();
  }

  public dispose(): void {
    this._disposable.dispose();
  }
}
