import './styles/main.css';
import logoImg from './assets/logo-nlw-esports.png';
import { GameBanner } from './components/GameBanner';
import { CreateAdBanner } from './components/CreateAdBanner';
import { CreateAdModal } from './components/CreateAdModal';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import { api } from './lib/api';
import { Game } from './types';

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(false);

  function loadGames() {
    api.get<Game[]>('/games').then((response) => {
      setGames(response.data);
    });
  }

  function handleAdCreated() {
    setIsCreateAdModalOpen(false);
    loadGames();
  }

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <div className="max-w-[1344px] mx-auto flex flex-col items-center my-20">
      <img src={logoImg} alt="" />

      <h1 className="my-4 text-5xl text-white font-black">
        Your <span className="text-transparent bg-nlw-gradient bg-clip-text">duo</span> is here.
      </h1>

      <div className="grid grid-cols-6 gap-6 mt-6">
        {games.map((game) => {
          return (
            <GameBanner
              key={game.id}
              title={game.title}
              bannerUrl={game.bannerUrl}
              adsCount={game._count.ads}
            />
          );
        })}
      </div>
      <Dialog.Root open={isCreateAdModalOpen} onOpenChange={setIsCreateAdModalOpen}>
        <CreateAdBanner />
        <CreateAdModal games={games} onAdCreated={handleAdCreated} />
      </Dialog.Root>
    </div>
  );
}

export default App;
