import { MagnifyingGlassPlus } from 'phosphor-react';
import * as Dialog from '@radix-ui/react-dialog';

export function CreateAdBanner() {
  return (
    <div className="pt-1 bg-nlw-gradient self-stretch rounded-lg overflow-hidden mt-8">
      <div className="bg-[#2A2634] px-6 py-6 flex flex-col gap-4 sm:px-8 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <strong className="text-2xl text-white font-black block">
            Didn&apos;t find your duo?
          </strong>
          <span className="text-zinc-400 block">Publish an ad to find new players.</span>
        </div>
        <Dialog.Trigger className="py-3 px-4 bg-violet-500 text-white rounded hover:bg-violet-700 flex items-center justify-center gap-3">
          <MagnifyingGlassPlus size="24" />
          Publish ad
        </Dialog.Trigger>
      </div>
    </div>
  );
}
