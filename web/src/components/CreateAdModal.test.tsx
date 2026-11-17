import * as Dialog from '@radix-ui/react-dialog';
import { fireEvent, render, screen } from '@testing-library/react';
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
        issues: { discord: ['String must contain at most 37 character(s)'] },
      }),
    );
    const { onAdCreated, user } = renderModal();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /find your duo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid request body (discord: String must contain at most 37 character(s))',
    );
    expect(onAdCreated).not.toHaveBeenCalled();
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
