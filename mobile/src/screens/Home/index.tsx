import { useCallback, useEffect, useState } from 'react';
import { Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logoImg from '../../assets/logo-nlw-esports.png';
import { Heading } from '../../components/Heading';
import { styles } from './styles';
import { GameCard } from '../../components/GameCard';
import type { Game } from '../../../../shared/api-types';
import { Background } from '../../components/Background';
import { useNavigation } from '@react-navigation/native';
import { apiGet } from '../../lib/api';
import { StatusMessage } from '../../components/StatusMessage';

export function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');

  const navigation = useNavigation();

  function handleOpenGame({ id, title, bannerUrl }: Game) {
    navigation.navigate('game', { id, title, bannerUrl });
  }

  const loadGames = useCallback(() => {
    setStatus('loading');
    apiGet<Game[]>('/games')
      .then((data) => {
        setGames(data);
        setStatus('ready');
      })
      .catch((error) => {
        console.error(error);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Image source={logoImg} style={styles.logo} />
        <Heading title="Find your duo!" subtitle="Select the game you want to play..." />
        {status === 'loading' && <StatusMessage loading />}
        {status === 'error' && (
          <StatusMessage message="Could not load the games." onRetry={loadGames} />
        )}
        {status === 'ready' && games.length === 0 && (
          <StatusMessage message="No games available yet." />
        )}
        {status === 'ready' && games.length > 0 && (
          <FlatList
            data={games}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GameCard data={item} onPress={() => handleOpenGame(item)} />}
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={styles.contentList}
          />
        )}
      </SafeAreaView>
    </Background>
  );
}
