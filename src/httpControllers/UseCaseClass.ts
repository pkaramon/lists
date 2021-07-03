export default interface UseCaseClass<Input, Result = void> {
  new (data: Input): {
    execute(): Promise<Result>;
  };
}
