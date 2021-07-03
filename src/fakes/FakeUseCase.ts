export default class FakeUseCase {
  static expectedData: any = null;

  constructor(public data: any) {
    if (FakeUseCase.expectedData !== null)
      expect(data).toMatchObject(FakeUseCase.expectedData);
  }

  async execute(): Promise<any> {}

  static mockResult(value: any) {
    this.prototype.execute = async () => value;
  }

  static expectPassedDataToMatch(obj: any) {
    this.expectedData = obj;
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

  static clear() {
    this.expectedData = null;
    this.prototype.execute = async function () {};
  }
}
