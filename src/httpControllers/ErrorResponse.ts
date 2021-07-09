import HttpResponse from "./HttpResponse";

export default class ErrorResponse implements HttpResponse {
  public data = { error: this.error };
  constructor(public statusCode: number, private error: string) {}
}
