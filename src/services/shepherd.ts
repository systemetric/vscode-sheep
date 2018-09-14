import * as axios from "axios";

export interface ILog {
  append: boolean;
  log: string;
  err?: any;
}

export default class ShepherdService {
  private _baseURL: string;
  private _http: axios.AxiosInstance;
  private _currentLog: string = "";

  constructor() {
    this._baseURL = "http://localhost:4000";
    this._http = axios.default.create({
      baseURL: this._baseURL
    });
  }

  public resetLog(): void {
    this._currentLog = "";
  }

  private _getCompleteLog(): Promise<string> {
    return this._http.get("/run/output").then((res: axios.AxiosResponse) => {
      return res.data;
    });
  }

  public async getLog(): Promise<ILog> {
    try {
      const newLog: string = await this._getCompleteLog();

      //Mini-diffing algorithm
      if (
        newLog.length < this._currentLog.length ||
        newLog.substring(0, this._currentLog.length) !== this._currentLog
      ) {
        this._currentLog = newLog;
        return {
          append: false,
          log: this._currentLog
        };
      } else {
        const newLogPart = newLog.substring(
          this._currentLog.length,
          newLog.length
        );
        this._currentLog = newLog;
        if (newLogPart) {
          return {
            append: true,
            log: newLogPart
          };
        }
      }
    } catch (e) {
      return {
        append: true,
        log: "",
        err: e
      };
    }

    return {
      append: true,
      log: ""
    };
  }

  public getPhotoURL(): string {
    return `${this._baseURL}/static/output.jpg?no-cache=${Date.now()}`;
  }
}
