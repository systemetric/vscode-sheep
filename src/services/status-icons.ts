import { StatusBarItem, window, StatusBarAlignment, Disposable } from "vscode";

export default class StatusIconsService implements Disposable {
  private _running: boolean;
  private _runStatusIcon: StatusBarItem;
  private _stopStatusIcon: StatusBarItem;

  constructor() {
    this._running = false;

    this._runStatusIcon = window.createStatusBarItem(StatusBarAlignment.Left);
    this._runStatusIcon.text = "$(triangle-right) Run on Robot";
    this._runStatusIcon.command = "robot.run";
    this._runStatusIcon.show();

    this._stopStatusIcon = window.createStatusBarItem(StatusBarAlignment.Left);
    this._stopStatusIcon.text = "$(primitive-square) Stop Robot";
    this._stopStatusIcon.command = "robot.stop";
  }

  set running(newRunning: boolean) {
    this._running = newRunning;
    this._updateStopIcon();
  }

  private _updateStatusIcon(icon: StatusBarItem, shown: boolean): void {
    icon[shown ? "show" : "hide"]();
  }

  private _updateStopIcon(): void {
    this._updateStatusIcon(this._runStatusIcon, this._running);
  }

  dispose(): void {
    this._runStatusIcon.dispose();
    this._stopStatusIcon.dispose();
  }
}
