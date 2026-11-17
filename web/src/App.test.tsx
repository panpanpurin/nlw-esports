import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game } from '../../shared/api-types';
import App from './App';
import { api } from './lib/api';

vi.mock('./lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(api.get);

const games: Game[] = [
  { id: 'game-1', title: 'Game One', bannerUrl: 'https://example.com/1.jpg', _count: { ads: 2 } },
];

describe('App', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('shows a loading message and then the games', async () => {
    get.mockResolvedValue({ data: games });

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading games...');
    expect(await screen.findByText('Game One')).toBeInTheDocument();
    expect(screen.getByText('2 ad(s)')).toBeInTheDocument();
    expect(screen.queryByText('Loading games...')).not.toBeInTheDocument();
  });

  it('shows an empty message when there are no games', async () => {
    get.mockResolvedValue({ data: [] });

    render(<App />);

    expect(await screen.findByText('No games available yet.')).toBeInTheDocument();
  });

  it('shows an error and loads again on retry', async () => {
    get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: games });
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the games.');

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Game One')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(2);
  });
});
