export default interface HttpRequest<Body> {
  body: Body;
  [key: string]: any;
}
