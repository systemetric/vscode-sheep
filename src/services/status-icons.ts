import {
  StatusBarItem,
  window,
  StatusBarAlignment,
  Disposable,
  ExtensionContext
} from "vscode";

export default class StatusIconsService implements Disposable {
  private _runStatusIcon: StatusBarItem;
  private _stopStatusIcon: StatusBarItem;
  private _disposable: Disposable;

  constructor(context: ExtensionContext) {
    this._runStatusIcon = window.createStatusBarItem(StatusBarAlignment.Left);
    this._runStatusIcon.text = "$(triangle-right) Run on Robot";
    this._runStatusIcon.command = "robot.run";
    this._runStatusIcon.show();

    this._stopStatusIcon = window.createStatusBarItem(StatusBarAlignment.Left);
    this._stopStatusIcon.text = "$(primitive-square) Stop Robot";
    this._stopStatusIcon.command = "robot.stop";
    this._stopStatusIcon.show();

    this._disposable = Disposable.from(
      this._runStatusIcon,
      this._stopStatusIcon
    );
  }

  dispose(): void {
    this._disposable.dispose();
  }
}
