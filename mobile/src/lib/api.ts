import Constants from 'expo-constants';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function resolveBaseUrl(): string {
  const configuredUrl: string | undefined = Constants.expoConfig?.extra?.apiUrl;

  if (configuredUrl) {
    return configuredUrl;
  }

  const devServerHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (devServerHost) {
    return `http://${devServerHost}:3333`;
  }

  throw new Error('API_URL is not set. Define it before starting the app.');
}

const baseUrl = resolveBaseUrl();

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }

  return response.json();
}
