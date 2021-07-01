export default interface UseCaseClass<Input, Result> {
  new (data: Input): {
    execute(): Promise<Result>;
  };
}
