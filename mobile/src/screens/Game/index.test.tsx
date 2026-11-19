import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { Ad } from '../../../../shared/api-types';
import { installFetchMock, mockFetchOnce } from '../../test/utils';
import { Game } from '.';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({
    params: { id: 'g1', title: 'League of Legends', bannerUrl: 'https://example.com/lol.png' },
  }),
}));

installFetchMock();

const ad: Ad = {
  id: 'a1',
  name: 'Andressa',
  weekDays: ['1', '2'],
  useVoiceChannel: true,
  yearsPlaying: 4,
  hourStart: '18:00',
  hourEnd: '22:00',
};

describe('Game', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('lists the ads of the game', async () => {
    mockFetchOnce(200, [ad]);
    await render(<Game />);

    expect(await screen.findByText('Andressa')).toBeOnTheScreen();
    expect(screen.getByText('2 days • 18:00 - 22:00')).toBeOnTheScreen();
    expect(globalThis.fetch).toHaveBeenCalledWith('http://api.test/games/g1/ads');
  });

  it('shows an empty message when the game has no ads', async () => {
    mockFetchOnce(200, []);
    await render(<Game />);

    expect(await screen.findByText('There are no ads for this game!')).toBeOnTheScreen();
  });

  it('shows an error and loads again on retry', async () => {
    mockFetchOnce(500);
    mockFetchOnce(200, [ad]);
    await render(<Game />);

    await fireEvent.press(await screen.findByText('Try again'));

    expect(await screen.findByText('Andressa')).toBeOnTheScreen();
  });

  it('shows the Discord handle after connecting', async () => {
    mockFetchOnce(200, [ad]);
    mockFetchOnce(200, { discord: 'andressa#1234' });
    await render(<Game />);

    await fireEvent.press(await screen.findByText('Connect'));

    expect(await screen.findByText('andressa#1234')).toBeOnTheScreen();
    expect(globalThis.fetch).toHaveBeenLastCalledWith('http://api.test/ads/a1/discord');
  });

  it('warns about the rate limit when the Discord lookup returns 429', async () => {
    mockFetchOnce(200, [ad]);
    mockFetchOnce(429);
    await render(<Game />);

    await fireEvent.press(await screen.findByText('Connect'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Something went wrong',
      'Too many requests. Wait a few minutes and try again.',
    );
  });

  it('shows a generic alert when the Discord lookup fails otherwise', async () => {
    mockFetchOnce(200, [ad]);
    mockFetchOnce(500);
    await render(<Game />);

    await fireEvent.press(await screen.findByText('Connect'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Something went wrong',
      'Could not get the Discord of this player. Try again.',
    );
  });
});
