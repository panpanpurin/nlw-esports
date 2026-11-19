import { ApiError, apiGet } from './api';
import { installFetchMock, mockFetchOnce } from '../test/utils';

installFetchMock();

describe('apiGet', () => {
  it('requests the configured base URL and returns the JSON body', async () => {
    mockFetchOnce(200, [{ id: '1' }]);

    await expect(apiGet('/games')).resolves.toEqual([{ id: '1' }]);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://api.test/games');
  });

  it('throws an ApiError with the status when the response is not ok', async () => {
    mockFetchOnce(429);

    const error = await apiGet('/ads/1/discord').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429 });
  });
});
