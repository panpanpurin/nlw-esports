import * as Dialog from '@radix-ui/react-dialog';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game } from '../../../shared/api-types';
import { api } from '../lib/api';
import { CreateAdModal } from './CreateAdModal';

vi.mock('../lib/api', () => ({
  api: { post: vi.fn() },
}));

const post = vi.mocked(api.post);

const games: Game[] = [
  { id: 'game-1', title: 'Game One', bannerUrl: 'https://example.com/1.jpg', _count: { ads: 0 } },
];

function renderModal() {
  const onAdCreated = vi.fn();
  render(
    <Dialog.Root open>
      <CreateAdModal games={games} onAdCreated={onAdCreated} />
    </Dialog.Root>,
  );
  return { onAdCreated, user: userEvent.setup() };
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { hourStart = '18:00', hourEnd = '22:30', weekDays = ['Monday', 'Friday'] } = {},
) {
  await user.selectOptions(screen.getByLabelText('Which game?'), 'game-1');
  await user.type(screen.getByLabelText('Your name (or nickname)'), '  Player One  ');
  await user.type(screen.getByLabelText('Since when?'), '3');
  await user.type(screen.getByLabelText('What is your Discord?'), 'player#1234');
  for (const day of weekDays) {
    await user.click(screen.getByTitle(day));
  }
  fireEvent.change(screen.getByLabelText('From'), { target: { value: hourStart } });
  fireEvent.change(screen.getByLabelText('To'), { target: { value: hourEnd } });
}

function axiosErrorWith(status: number, data: unknown) {
  const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST');
  error.response = { status, data } as AxiosError['response'];
  return error;
}

describe('CreateAdModal', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts the ad and notifies the parent', async () => {
    post.mockResolvedValue({ data: {} });
    const { onAdCreated, user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByLabelText('I use voice chat'));
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(post).toHaveBeenCalledWith('/games/game-1/ads', {
      name: 'Player One',
      yearsPlaying: 3,
      discord: 'player#1234',
      weekDays: [1, 5],
      hourStart: '18:00',
      hourEnd: '22:30',
      useVoiceChannel: true,
    });
    expect(onAdCreated).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('asks for a week day before posting', async () => {
    const { onAdCreated, user } = renderModal();

    await fillForm(user, { weekDays: [] });
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one day of the week.');
    expect(post).not.toHaveBeenCalled();
    expect(onAdCreated).not.toHaveBeenCalled();
  });

  it('rejects equal start and end hours before posting', async () => {
    const { user } = renderModal();

    await fillForm(user, { hourStart: '20:00', hourEnd: '20:00' });
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The end time must differ from the start time.',
    );
    expect(post).not.toHaveBeenCalled();
  });

  it('shows the field issues returned by the server', async () => {
    post.mockRejectedValue(
      axiosErrorWith(400, {
        message: 'Invalid request body',
        issues: { discord: ['Too big: expected string to have <=37 characters'] },
      }),
    );
    const { onAdCreated, user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid request body (discord: Too big: expected string to have <=37 characters)',
    );
    expect(onAdCreated).not.toHaveBeenCalled();
  });

  it('joins several field issues', async () => {
    post.mockRejectedValue(
      axiosErrorWith(400, {
        issues: { name: ['Too small'], hourStart: ['Expected HH:mm'] },
      }),
    );
    const { user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid data (name: Too small; hourStart: Expected HH:mm)',
    );
  });

  it('shows the server message when there are no field issues', async () => {
    post.mockRejectedValue(axiosErrorWith(404, { message: 'Game not found' }));
    const { user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Game not found');
  });

  it('falls back to a generic message for an unexpected server response', async () => {
    post.mockRejectedValue(axiosErrorWith(500, 'Internal Server Error'));
    const { user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not publish the ad. Try again.',
    );
  });

  it('disables the button while publishing and sends the ad only once', async () => {
    let resolvePost!: () => void;
    post.mockReturnValue(new Promise((resolve) => (resolvePost = () => resolve({ data: {} }))));
    const { onAdCreated, user } = renderModal();

    await fillForm(user);
    const submit = screen.getByRole('button', { name: /find your duo/i });
    await user.click(submit);

    expect(submit).toBeDisabled();
    expect(submit).toHaveTextContent('Publishing...');

    fireEvent.submit(submit.closest('form')!);
    expect(post).toHaveBeenCalledOnce();

    await act(async () => resolvePost());

    expect(submit).toBeEnabled();
    expect(submit).toHaveTextContent('Find your duo');
    expect(onAdCreated).toHaveBeenCalledOnce();
  });

  it('clears the error when a retry succeeds', async () => {
    post
      .mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
      .mockResolvedValueOnce({ data: {} });
    const { onAdCreated, user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /find your duo/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onAdCreated).toHaveBeenCalledOnce();
  });

  it('sends voice chat off by default and drops a day clicked twice', async () => {
    post.mockResolvedValue({ data: {} });
    const { user } = renderModal();

    await fillForm(user, { weekDays: ['Sunday', 'Saturday', 'Sunday'] });
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(post).toHaveBeenCalledWith(
      '/games/game-1/ads',
      expect.objectContaining({ weekDays: [6], useVoiceChannel: false }),
    );
  });

  it('accepts a time range that crosses midnight', async () => {
    post.mockResolvedValue({ data: {} });
    const { user } = renderModal();

    await fillForm(user, { hourStart: '22:00', hourEnd: '02:00' });
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(post).toHaveBeenCalledWith(
      '/games/game-1/ads',
      expect.objectContaining({ hourStart: '22:00', hourEnd: '02:00' }),
    );
  });

  it('lists the games with a placeholder that cannot be chosen', () => {
    renderModal();

    const placeholder = screen.getByRole('option', { name: 'Select game you wish to play' });
    expect(placeholder).toBeDisabled();
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: 'Which game?' }).value).toBe('');
    expect(screen.getByRole('option', { name: 'Game One' })).toHaveValue('game-1');
  });

  it('uses the same field limits as the server', () => {
    renderModal();

    expect(screen.getByLabelText('Which game?')).toBeRequired();
    expect(screen.getByLabelText('Your name (or nickname)')).toHaveAttribute('maxLength', '50');
    expect(screen.getByLabelText('What is your Discord?')).toHaveAttribute('maxLength', '37');
    const years = screen.getByLabelText('Since when?');
    expect(years).toHaveAttribute('min', '0');
    expect(years).toHaveAttribute('max', '60');
    expect(years).toHaveAttribute('step', '1');
    for (const label of [
      'Your name (or nickname)',
      'Since when?',
      'What is your Discord?',
      'From',
      'To',
    ]) {
      expect(screen.getByLabelText(label)).toBeRequired();
    }
  });

  it('shows a connection message when the server cannot be reached', async () => {
    post.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));
    const { user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not reach the server. Check your connection and try again.',
    );
  });
});
