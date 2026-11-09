import Constants from 'expo-constants';

const baseUrl: string = Constants.expoConfig?.extra?.apiUrl ?? 'http://192.168.0.32:3333';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json();
}
