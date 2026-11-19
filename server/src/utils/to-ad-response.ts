import type { Ad } from '../../../shared/api-types';
import { convertMinutesToHourString } from './convert-minutes-to-hour-string';

interface StoredAd {
  id: string;
  name: string;
  yearsPlaying: number;
  weekDays: string;
  hourStart: number;
  hourEnd: number;
  useVoiceChannel: boolean;
}

export function toAdResponse(ad: StoredAd): Ad {
  return {
    id: ad.id,
    name: ad.name,
    yearsPlaying: ad.yearsPlaying,
    weekDays: ad.weekDays.split(','),
    hourStart: convertMinutesToHourString(ad.hourStart),
    hourEnd: convertMinutesToHourString(ad.hourEnd),
    useVoiceChannel: ad.useVoiceChannel,
  };
}
