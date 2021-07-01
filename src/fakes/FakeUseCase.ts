export default class FakeUseCase {
  constructor(public data: any) {}
  async execute(): Promise<any> {}
  static mockResult(value: any) {
    this.prototype.execute = async () => value;
  }
  static mockError(value: any) {
    this.prototype.execute = async () => {
      throw value;
    };
  }
  static mockImpl(func: (data: any) => any) {
    this.prototype.execute = async function () {
      return func(this.data);
    };
  }
}
