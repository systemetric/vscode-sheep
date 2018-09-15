import {
  defaults as requestDefaults,
  RequestAPI,
  Request,
  CoreOptions,
  RequiredUriUrl,
  Response
} from "request";
import * as fs from "fs";

export interface ILog {
  append: boolean;
  log: string;
  err?: any;
}

export default class ShepherdService {
  private _baseURL: string;
  private _http: RequestAPI<Request, CoreOptions, RequiredUriUrl>;
  private _currentLog: string = "";

  constructor() {
    this._baseURL = "http://localhost:4000";
    this._http = requestDefaults({
      baseUrl: this._baseURL
    });
  }

  private _request(
    method: string,
    uri: string,
    options?: CoreOptions
  ): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      this._http(
        uri,
        {
          method,
          ...options
        },
        (err: any, res: Response) => {
          err ? reject(err) : resolve(res);
        }
      );
    });
  }

  public upload(path: string): Promise<Response> {
    return this._request("POST", "/upload/upload", {
      formData: {
        uploaded_file: fs.createReadStream(path)
      }
    });
  }

  public start(): Promise<Response> {
    return this._request("POST", "/run/start", {
      formData: {
        zone: "0",
        mode: "development"
      }
    });
  }

  public stop(): Promise<Response> {
    return this._request("POST", "/run/stop");
  }

  public resetLog(): void {
    this._currentLog = "";
  }

  private _getCompleteLog(): Promise<string> {
    return this._request("GET", "/run/output").then(res => res.body);
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
