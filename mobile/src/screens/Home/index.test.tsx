import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Game } from '../../../../shared/api-types';
import { installFetchMock, mockFetchOnce } from '../../test/utils';
import { Home } from '.';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

installFetchMock();

const game: Game = {
  id: 'g1',
  title: 'League of Legends',
  bannerUrl: 'https://example.com/lol.png',
  _count: { ads: 3 },
};

describe('Home', () => {
  it('shows a spinner while the games load', async () => {
    (globalThis.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    await render(<Home />);

    expect(screen.getByLabelText('Loading')).toBeOnTheScreen();
  });

  it('lists the games and opens the selected one', async () => {
    mockFetchOnce(200, [game]);
    await render(<Home />);

    await fireEvent.press(await screen.findByText('League of Legends'));

    expect(screen.getByText('3 Ads')).toBeOnTheScreen();
    expect(mockNavigate).toHaveBeenCalledWith('game', {
      id: 'g1',
      title: 'League of Legends',
      bannerUrl: 'https://example.com/lol.png',
    });
  });

  it('shows an empty state when there are no games', async () => {
    mockFetchOnce(200, []);
    await render(<Home />);

    expect(await screen.findByText('No games available yet.')).toBeOnTheScreen();
  });

  it('shows an error and loads again on retry', async () => {
    mockFetchOnce(500);
    mockFetchOnce(200, [game]);
    await render(<Home />);

    await fireEvent.press(await screen.findByText('Try again'));

    expect(await screen.findByText('League of Legends')).toBeOnTheScreen();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
