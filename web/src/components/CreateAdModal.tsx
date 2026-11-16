import { Check, GameController } from 'phosphor-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

import { Input } from './Form/Input';
import { FormEvent, useState } from 'react';
import { api } from '../lib/api';
import { Game } from '../types';

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

      <Dialog.Content className="fixed bg-[#2A2634] py-8 px-10 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg w-[480px] shadow-lg shadow-black/25">
        <Dialog.Title className="text-3xl font-black">Publish an ad</Dialog.Title>

        <CreateAdForm games={games} onAdCreated={onAdCreated} />
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function CreateAdForm({ games, onAdCreated }: CreateAdModalProps) {
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [useVoiceChannel, setUseVoiceChannel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateAd(event: FormEvent) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    setIsSubmitting(true);

    try {
      await api.post(`/games/${data.game}/ads`, {
        name: data.name,
        yearsPlaying: Number(data.yearsPlaying),
        discord: data.discord,
        weekDays: weekDays.map(Number),
        hourStart: data.hourStart,
        hourEnd: data.hourEnd,
        useVoiceChannel,
      });

      alert('The ad has been published!');
      onAdCreated();
    } catch (err) {
      console.log(err);
      alert('error');
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
        <Input name="name" id="name" placeholder="How you wish to be called?" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="yearsPlaying">Since when?</label>
          <Input
            name="yearsPlaying"
            id="yearsPlaying"
            type="number"
            placeholder="# of years played"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="discord">What is your Discord?</label>
          <Input name="discord" id="discord" type="text" placeholder="User#0000" />
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col gap-2">
          <label id="weekDays-label">When are you used to play?</label>
          <ToggleGroup.Root
            aria-labelledby="weekDays-label"
            type="multiple"
            className="grid grid-cols-4 gap-2"
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
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="hourStart">Which time of day?</label>
          <div className="grid grid-cols-2 gap-2">
            <Input name="hourStart" id="hourStart" type="time" placeholder="From" />
            <Input name="hourEnd" id="hourEnd" type="time" placeholder="To" />
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
      <footer className="mt-4 flex justify-end gap-4">
        <Dialog.Close className="bg-zinc-500 px-5 h-12 rounded-md font-semibold hover:bg-zinc-600">
          Cancel
        </Dialog.Close>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-violet-500 px-5 h-12 rounded-md font-semibold flex items-center gap-3 hover:bg-violet-600"
        >
          <GameController className="w-6 h-6" />
          Find your duo
        </button>
      </footer>
    </form>
  );
}
