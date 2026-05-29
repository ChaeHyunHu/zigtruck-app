import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(Image, {
  className: 'style',
});

cssInterop(LinearGradient, {
  className: 'style',
});

cssInterop(SafeAreaView, {
  className: 'style',
});
