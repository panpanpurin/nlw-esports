import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { TouchableOpacity, View, Image, FlatList, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../@types/navigation';
import { Background } from '../../components/Background';
import { styles } from './styles';
import { Entypo } from '@expo/vector-icons';
import { THEME } from '../../theme';
import logoImg from '../../assets/logo-nlw-esports.png';
import { Heading } from '../../components/Heading';
import { DuoCard } from '../../components/DuoCard';
import type { Ad, AdDiscord } from '../../../../shared/api-types';
import { DuoMatch } from '../../components/DuoMatch';
import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet } from '../../lib/api';
import { StatusMessage } from '../../components/StatusMessage';

export function Game() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'game'>>();
  const game = route.params;
  const [duos, setDuos] = useState<Ad[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [discordDuoSelected, setDiscordDuoSelected] = useState('');

  function handleGoBack() {
    navigation.goBack();
  }

  async function getDiscordUser(adsId: string) {
    try {
      const data = await apiGet<AdDiscord>(`/ads/${adsId}/discord`);
      setDiscordDuoSelected(data.discord);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof ApiError && error.status === 429
          ? 'Too many requests. Wait a few minutes and try again.'
          : 'Could not get the Discord of this player. Try again.';
      Alert.alert('Something went wrong', message);
    }
  }

  const loadDuos = useCallback(() => {
    apiGet<Ad[]>(`/games/${game.id}/ads`)
      .then((data) => {
        setDuos(data);
        setStatus('ready');
      })
      .catch((error) => {
        console.error(error);
        setStatus('error');
      });
  }, [game.id]);

  useEffect(() => {
    loadDuos();
  }, [loadDuos]);

  function handleRetry() {
    setStatus('loading');
    loadDuos();
  }

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Entypo name="chevron-thin-left" color={THEME.COLORS.CAPTION_300} size={20} />
          </TouchableOpacity>
          <Image source={logoImg} style={styles.logo} />
          <View style={styles.right} />
        </View>

        <Image source={{ uri: game.bannerUrl }} style={styles.cover} resizeMode="cover" />

        <Heading title={game.title} subtitle="Connect and start to play!" />

        {status === 'loading' && <StatusMessage loading />}
        {status === 'error' && (
          <StatusMessage message="Could not load the ads." onRetry={handleRetry} />
        )}
        {status === 'ready' && (
          <FlatList
            data={duos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DuoCard data={item} onConnect={() => getDiscordUser(item.id)} />
            )}
            horizontal
            style={styles.containerList}
            contentContainerStyle={[duos.length > 0 ? styles.contentList : styles.emptyListContent]}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>There are no ads for this game!</Text>
            )}
          />
        )}

        <DuoMatch
          visible={discordDuoSelected.length > 0}
          discord={discordDuoSelected}
          onClose={() => setDiscordDuoSelected('')}
        />
      </SafeAreaView>
    </Background>
  );
}
