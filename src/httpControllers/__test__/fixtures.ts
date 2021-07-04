export function expectStatusCodeToBe(
  response: { statusCode: number },
  statusCode: number
) {
  expect(response.statusCode).toBe(statusCode);
}

export function expectErrorMessageToBe(
  response: { data: { error?: string } },
  errorMessage: string
) {
  expect(response.data.error).toBe(errorMessage);
}

export function expectDataToMatch(response: { data: any }, data: any) {
  expect(response.data).toMatchObject(data);
}

export class MockUseCase {
  static passedData: any = null;

  constructor(public data: any) {
    MockUseCase.passedData = data;
  }

  async execute(): Promise<any> {}

  static mockResult(value: any) {
    this.prototype.execute = async () => value;
  }

  static expectPassedDataToMatch(obj: any) {
    expect(this.passedData).toMatchObject(obj);
  }

  static mockError(value: any) {
    this.prototype.execute = async () => {
      throw value;
    };
  }

  static mockImpl(func: () => Promise<any>) {
    this.prototype.execute = func;
  }

  static clear() {
    this.passedData = null;
    this.prototype.execute = async function () {};
  }
}
