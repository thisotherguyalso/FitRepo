import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppColors } from '@/constants/styles';

const HEADER_HEIGHT = 100;

type Props = PropsWithChildren<{}>;

export default function ParallaxScrollView({
  children
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = useAppColors();
  const backgroundColor = colors.background;
  const textColor = colorScheme === 'light' ? '#2c2c2c' : '#f2f2f7';

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={[styles.scrollView, {backgroundColor}]}
      scrollEventThrottle={16}
    >
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: colors.primary },
          headerAnimatedStyle,
        ]}
      >
        <Text style={[styles.headerText]}>FitRepo</Text>
      </Animated.View>
      <View style={styles.content}>{children}</View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  header: {
    height: HEADER_HEIGHT,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'left',
    paddingTop: 50,
    paddingLeft: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 14,
    backgroundColor: 'transparent',
  },
});