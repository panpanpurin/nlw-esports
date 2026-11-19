import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game } from '../../shared/api-types';
import App from './App';
import { api } from './lib/api';

vi.mock('./lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

const games: Game[] = [
  { id: 'game-1', title: 'Game One', bannerUrl: 'https://example.com/1.jpg', _count: { ads: 2 } },
];

describe('App', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
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

  it('publishes an ad, closes the form, confirms it and refreshes the games', async () => {
    get
      .mockResolvedValueOnce({ data: games })
      .mockResolvedValueOnce({ data: [{ ...games[0], _count: { ads: 3 } }] });
    post.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    render(<App />);
    await screen.findByText('2 ad(s)');

    await user.click(screen.getByRole('button', { name: 'Publish ad' }));
    const dialog = screen.getByRole('dialog', { name: 'Publish an ad' });

    await user.selectOptions(within(dialog).getByLabelText('Which game?'), 'game-1');
    await user.type(within(dialog).getByLabelText('Your name (or nickname)'), 'Player One');
    await user.type(within(dialog).getByLabelText('Since when?'), '3');
    await user.type(within(dialog).getByLabelText('What is your Discord?'), 'player#1234');
    await user.click(within(dialog).getByTitle('Monday'));
    fireEvent.change(within(dialog).getByLabelText('From'), { target: { value: '18:00' } });
    fireEvent.change(within(dialog).getByLabelText('To'), { target: { value: '22:00' } });
    await user.click(within(dialog).getByRole('button', { name: /find your duo/i }));

    expect(post).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('3 ad(s)')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/published/i);
    expect(get).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Publish ad' }));
    expect(screen.queryByText(/published/i)).not.toBeInTheDocument();
  });

  it('closes the form on Cancel without publishing', async () => {
    get.mockResolvedValue({ data: games });
    const user = userEvent.setup();

    render(<App />);
    await screen.findByText('Game One');

    await user.click(screen.getByRole('button', { name: 'Publish ad' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
