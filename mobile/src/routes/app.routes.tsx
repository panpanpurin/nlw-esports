import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Home } from '../screens/Home';

import { Game } from '../screens/Game';
import { RootStackParamList } from '../@types/navigation';

const { Navigator, Screen } = createNativeStackNavigator<RootStackParamList>();

export function AppRoutes() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name="home" component={Home} />
      <Screen name="game" component={Game} />
    </Navigator>
  );
}
