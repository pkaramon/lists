import HttpResponse from "./HttpResponse";

export default class DataResponse implements HttpResponse {
  constructor(public statusCode: number, public data: any) {}
}
