import HttpRequest from "./HttpRequest";
import HttpResponse from "./HttpResponse";

export default interface HttpController {
  handle(req: HttpRequest<{}>): Promise<HttpResponse>;
}
