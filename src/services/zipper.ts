import { ExtensionContext, window } from "vscode";
import * as fs from "fs-extra";
import * as path from "path";
import * as archiver from "archiver";

export default class ZipperService {
  private _tmpPath: string;
  private _zipPath: string;
  private _zipInputPath: string;
  private _zipInputMainPath: string;

  constructor(context: ExtensionContext) {
    this._tmpPath = context.asAbsolutePath("tmp");
    this._zipPath = context.asAbsolutePath(path.join("tmp", "code.zip"));
    this._zipInputPath = context.asAbsolutePath(path.join("tmp", "zip"));
    this._zipInputMainPath = context.asAbsolutePath(
      path.join("tmp", "zip", "main.py")
    );
    fs.mkdirp(this._tmpPath);
  }

  get zipPath(): string {
    return this._zipPath;
  }

  public zip(workspacePath: string, mainPath: string): Promise<boolean> {
    const mainPathRelativeToWorkspace = mainPath.substring(
      workspacePath.length + 1
    );
    if (
      mainPathRelativeToWorkspace.includes("\\") ||
      mainPathRelativeToWorkspace.includes("/")
    ) {
      window.showErrorMessage("The file must be in the workspace root.");
      return Promise.resolve(false);
    }

    return new Promise<boolean>(async (resolve, reject) => {
      await fs.emptyDir(this._zipInputPath);
      await fs.copy(workspacePath, this._zipInputPath);

      if (
        fs.existsSync(this._zipInputMainPath) &&
        mainPathRelativeToWorkspace !== "main.py"
      ) {
        window.showWarningMessage(
          "You have a file called main.py in your workspace root. This will be overwritten in the upload."
        );
        await fs.unlink(this._zipInputMainPath);
      }

      if (mainPathRelativeToWorkspace !== "main.py") {
        await fs.copy(mainPath, this._zipInputMainPath);
      }

      const zipOutput = fs.createWriteStream(this._zipPath);
      zipOutput.on("close", () => {
        resolve(true);
      });

      const archive = archiver("zip");
      archive.pipe(zipOutput);
      archive.directory(this._zipInputPath, false);
      archive.on("error", err => reject(err));
      archive.finalize();
    });
  }
}
