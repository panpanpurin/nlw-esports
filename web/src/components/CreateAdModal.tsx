import { Check, GameController } from 'phosphor-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

import { Input } from './Form/Input';
import { FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../lib/api';
import type { CreateAdRequest, Game } from '../../../shared/api-types';

const WEEK_DAYS = [
  { value: '0', title: 'Sunday', label: 'S' },
  { value: '1', title: 'Monday', label: 'M' },
  { value: '2', title: 'Tuesday', label: 'T' },
  { value: '3', title: 'Wednesday', label: 'W' },
  { value: '4', title: 'Thursday', label: 'T' },
  { value: '5', title: 'Friday', label: 'F' },
  { value: '6', title: 'Saturday', label: 'S' },
];

interface CreateAdModalProps {
  games: Game[];
  onAdCreated: () => void;
}

export function CreateAdModal({ games, onAdCreated }: CreateAdModalProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/60 inset-0 fixed" />

      <Dialog.Content className="fixed bg-[#2A2634] py-8 px-6 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg w-[calc(100%-2rem)] max-w-[480px] max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-lg shadow-black/25 sm:px-10">
        <Dialog.Title className="text-2xl font-black sm:text-3xl">Publish an ad</Dialog.Title>

        <CreateAdForm games={games} onAdCreated={onAdCreated} />
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function CreateAdForm({ games, onAdCreated }: CreateAdModalProps) {
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [useVoiceChannel, setUseVoiceChannel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCreateAd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const field = (name: string) => String(formData.get(name) ?? '');

    const ad: CreateAdRequest = {
      name: field('name').trim(),
      yearsPlaying: Number(field('yearsPlaying')),
      discord: field('discord').trim(),
      weekDays: weekDays.map(Number),
      hourStart: field('hourStart'),
      hourEnd: field('hourEnd'),
      useVoiceChannel,
    };

    if (ad.weekDays.length === 0) {
      setErrorMessage('Select at least one day of the week.');
      return;
    }

    if (ad.hourStart === ad.hourEnd) {
      setErrorMessage('The end time must differ from the start time.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await api.post(`/games/${field('game')}/ads`, ad);
      onAdCreated();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCreateAd} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="game" className="font-semibold">
          Which game?
        </label>
        <select
          name="game"
          id="game"
          defaultValue=""
          required
          className="bg-zinc-900 py-3 px-4 rounded text-sm placeholder:text-zinc-500"
        >
          <option disabled value="">
            Select game you wish to play
          </option>
          {games.map((game) => {
            return (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name">Your name (or nickname)</label>
        <Input
          name="name"
          id="name"
          placeholder="How you wish to be called?"
          required
          maxLength={50}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="yearsPlaying">Since when?</label>
          <Input
            name="yearsPlaying"
            id="yearsPlaying"
            type="number"
            placeholder="# of years played"
            required
            min={0}
            max={60}
            step={1}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="discord">What is your Discord?</label>
          <Input
            name="discord"
            id="discord"
            type="text"
            placeholder="User#0000"
            required
            maxLength={37}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label id="weekDays-label">When are you used to play?</label>
          <ToggleGroup.Root
            aria-labelledby="weekDays-label"
            type="multiple"
            className="flex flex-wrap gap-2"
            value={weekDays}
            onValueChange={setWeekDays}
          >
            {WEEK_DAYS.map((day) => (
              <ToggleGroup.Item
                key={day.value}
                value={day.value}
                title={day.title}
                className={`w-8 h-8 rounded ${weekDays.includes(day.value) ? 'bg-violet-500' : 'bg-zinc-900'}`}
              >
                {day.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="hourStart">Which time of day?</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="hourStart"
              id="hourStart"
              type="time"
              placeholder="From"
              aria-label="From"
              required
            />
            <Input
              name="hourEnd"
              id="hourEnd"
              type="time"
              placeholder="To"
              aria-label="To"
              required
            />
          </div>
        </div>
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <Checkbox.Root
          checked={useVoiceChannel}
          onCheckedChange={(checked) => setUseVoiceChannel(checked === true)}
          className="w-6 h-6 p-1 rounded bg-zinc-900"
        >
          <Checkbox.Indicator>
            <Check className="w-4 h-4 text-emerald-400" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        I use voice chat
      </label>
      {errorMessage && (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}
      <footer className="mt-4 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
        <Dialog.Close className="bg-zinc-500 px-5 h-12 rounded-md font-semibold hover:bg-zinc-600">
          Cancel
        </Dialog.Close>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-violet-500 px-5 h-12 rounded-md font-semibold flex items-center justify-center gap-3 hover:bg-violet-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <GameController className="w-6 h-6" />
          {isSubmitting ? 'Publishing...' : 'Find your duo'}
        </button>
      </footer>
    </form>
  );
}

function getErrorMessage(error: unknown) {
  if (!isAxiosError(error) || !error.response) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  const data = error.response.data as {
    message?: string;
    issues?: Record<string, string[] | undefined>;
  };

  if (data.issues) {
    const details = Object.entries(data.issues)
      .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
      .join('; ');
    return `${data.message ?? 'Invalid data'} (${details})`;
  }

  return data.message ?? 'Could not publish the ad. Try again.';
}
