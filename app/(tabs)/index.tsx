import {
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle, withTiming,
} from 'react-native-reanimated';

const data = [
  { key: 'a' },
  { key: 'b' },
  { key: 'c' },
  { key: 'd' },
  { key: 'e' },
  { key: 'f' },
  // {key: 'g'}, {key: 'h'}, {key: 'i'}, {key: 'j'},
  // {key: 'k'}, {key: 'l'}, {key: 'm'}, {key: 'n'}, {key: 'o'},
];

export default function App() {
  const { width } = useWindowDimensions();

  const isPressed = useSharedValue(false);
  const translationX = useSharedValue(0);
  const startX = useSharedValue(0);

  const ITEMS_PER_VIEWPORT = 3;
  const ITEM_WIDTH = width * ((1 / ITEMS_PER_VIEWPORT) * 0.9);
  const ITEM_MARGIN = 10;
  const SNAP_WIDTH = ITEM_WIDTH + ITEM_MARGIN; // 139
  const PEAK_WIDTH = ITEM_WIDTH * 0.1;
  const ITEMS_AND_MARGINS_WIDTH = SNAP_WIDTH * data.length - ITEM_MARGIN;
  const LAST_ITEMS_VIEWPORT_WIDTH = SNAP_WIDTH * ITEMS_PER_VIEWPORT + PEAK_WIDTH;
  const MAX_TRANSLATION = LAST_ITEMS_VIEWPORT_WIDTH - ITEMS_AND_MARGINS_WIDTH;

  const gesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((e) => {
      translationX.value = e.translationX + startX.value;
    })
    .onEnd(() => {
      startX.value = translationX.value;

      // limit scroll to content width
      if (startX.value > 0) {
        startX.value = 0;
        translationX.value = withTiming(0);
      } else if (Math.abs(startX.value) > Math.abs(MAX_TRANSLATION)) {
        startX.value = MAX_TRANSLATION;
        translationX.value = withTiming(MAX_TRANSLATION);
      }

      // snap to nearest interval
      const fullSnapsAmount = Math.floor(Math.abs(startX.value / SNAP_WIDTH));
      const fullSnapsAmountScrollLocation = fullSnapsAmount * SNAP_WIDTH;
      const leftover = Math.abs(startX.value) - Math.abs(fullSnapsAmountScrollLocation);

      if (Math.abs(leftover) >= ITEM_WIDTH / 2) {
        startX.value = (fullSnapsAmountScrollLocation + SNAP_WIDTH) * -1;
        translationX.value = withTiming(startX.value);
      } else {
        startX.value = fullSnapsAmountScrollLocation * -1;
        translationX.value = withTiming(startX.value);
      }
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translationX.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.itemContainer, animatedStyle]}>
            {data.map((d) => (
              <View
                key={d.key}
                style={[
                  styles.item,
                  { width: ITEM_WIDTH, marginRight: ITEM_MARGIN },
                ]}
              />
            ))}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  itemContainer: {
    flexDirection: 'row',
  },
  item: {
    width: '100%',
    height: 100,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
