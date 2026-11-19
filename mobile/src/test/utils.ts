export function mockFetchOnce(status: number, body: unknown = {}) {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

export function installFetchMock() {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });
}
