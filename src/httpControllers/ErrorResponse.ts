
export default class ErrorResponse {
  public data = {
    error: this._error,
  };
  constructor(public statusCode: number, private _error: string) {}
}

