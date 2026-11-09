
import { useState } from 'react';
import {useEffect} from 'react';
import { Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import logoImg from '../../assets/logo-nlw-esports.png'
import { Heading } from '../../components/Heading';
import { styles } from './styles';
import { GameCard } from '../../components/GameCard';
import { Game } from '../../@types/api';
import { Background } from '../../components/Background';
import { useNavigation } from '@react-navigation/native';
import { apiGet } from '../../lib/api';

export function Home() {

    const [games,setGames] = useState<Game[]>([]);

    const navigation = useNavigation();

    function handleOpenGame({id, title, bannerUrl}: Game){
        navigation.navigate('game', {id, title, bannerUrl});
    }

    useEffect(() => {
        apiGet<Game[]>('/games')
            .then(data => setGames(data))
            .catch(error => console.error(error));
    },[])


  return (
    <Background>

        <SafeAreaView style={styles.container}>
            <Image
                source={logoImg} 
                style={styles.logo}
            />
            <Heading 
                title="Find your duo!" 
                subtitle="Select the game you want to play..."
            />
            <FlatList
                data={games}
                keyExtractor={item => item.id}
                renderItem={({item}) => ( 
                    <GameCard
                    data = {item}
                    onPress = {() => handleOpenGame(item)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                horizontal
                contentContainerStyle={styles.contentList}
            />
            
        </SafeAreaView>

    </Background>
  );
}