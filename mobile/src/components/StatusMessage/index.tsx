import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../../theme';

import { styles } from './styles';

interface Props {
  loading?: boolean;
  message?: string;
  onRetry?: () => void;
}

export function StatusMessage({ loading, message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={THEME.COLORS.PRIMARY} accessibilityLabel="Loading" />
      ) : (
        <>
          {message && <Text style={styles.message}>{message}</Text>}
          {onRetry && (
            <TouchableOpacity style={styles.button} onPress={onRetry}>
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}
