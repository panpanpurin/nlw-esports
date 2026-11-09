import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, TouchableOpacity, View, Image, FlatList, Text } from 'react-native';
import { RootStackParamList } from '../../@types/navigation';
import { Background } from '../../components/Background';
import { styles } from './styles';
import {Entypo} from '@expo/vector-icons'
import { THEME } from '../../theme';
import logoImg from '../../assets/logo-nlw-esports.png'
import { Heading } from '../../components/Heading';
import { DuoCard } from '../../components/DuoCard';
import { Ad } from '../../@types/api';
import { DuoMatch } from '../../components/DuoMatch';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

export function Game() {

  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'game'>>();
  const game = route.params;
  const [duos, setDuos] = useState<Ad[]>([])
  const [discordDuoSelected, setDiscordDuoSelected] = useState('');

  function handleGoBack(){
    navigation.goBack();
  }

  async function getDiscordUser(adsId: string) {
    try {
      const data = await apiGet<{ discord: string }>(`/ads/${adsId}/discord`);
      setDiscordDuoSelected(data.discord);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    apiGet<Ad[]>(`/games/${game.id}/ads`)
      .then(data => setDuos(data))
      .catch(error => console.error(error));
  }, [game.id])

  return (

    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Entypo
              name='chevron-thin-left'
              color={THEME.COLORS.CAPTION_300}
              size={20}
            />
          </TouchableOpacity>
          <Image
            source={logoImg}
            style={styles.logo}
          />
          <View style={styles.right}/>
        </View>

        <Image
          source={{uri: game.bannerUrl}}
          style={styles.cover}
          resizeMode="cover"
        />

        <Heading 
          title={game.title}
          subtitle="Connect and start to play!"
        />

        <FlatList
          data={duos}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <DuoCard 
              data={item} 
              onConnect={() => getDiscordUser(item.id)}
            />
          )}
          horizontal
          style={styles.containerList}
          contentContainerStyle={[duos.length > 0 ? styles.contentList : styles.emptyListContent]}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={()=>(
            <Text style={styles.emptyListText}>
              There are no ads for this game!
            </Text>
          )}
        />

        <DuoMatch 
          visible={discordDuoSelected.length > 0}
          discord={discordDuoSelected}
          onClose={() => setDiscordDuoSelected('')}
        />
      </SafeAreaView>
    </Background>
  );
}