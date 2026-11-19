import { Image, View } from 'react-native';

import backgroundImg from '../../assets/background-galaxy.png';

import { styles } from './styles';

interface Props {
  children: React.ReactNode;
}
export function Background({ children }: Props) {
  return (
    <View style={styles.container}>
      <Image source={backgroundImg} defaultSource={backgroundImg} style={styles.image} />
      {children}
    </View>
  );
}
