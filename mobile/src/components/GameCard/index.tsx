import { LinearGradient } from 'expo-linear-gradient';
import { Image, TouchableOpacityProps, TouchableOpacity, Text, View } from 'react-native';
import { THEME } from '../../theme';
import type { Game } from '../../../../shared/api-types';

import { styles } from './styles';

interface Props extends TouchableOpacityProps {
  data: Game;
}

export function GameCard({ data, ...rest }: Props) {
  return (
    <TouchableOpacity style={styles.container} {...rest}>
      <View style={styles.cover}>
        <Image style={styles.image} source={{ uri: data.bannerUrl }} />
        <LinearGradient colors={THEME.COLORS.FOOTER} style={styles.footer}>
          <Text style={styles.name}>{data.title}</Text>
          <Text style={styles.ads}>{data._count.ads} Ads</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}
