jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiUrl: 'http://api.test' } } },
}));

jest.spyOn(console, 'error').mockImplementation(() => {});
