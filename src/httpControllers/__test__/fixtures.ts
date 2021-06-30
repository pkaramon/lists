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
