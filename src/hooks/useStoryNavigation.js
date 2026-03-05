import { useRef } from "react";
import { PanResponder, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function useStoryNavigation({
  userIndex,
  storyIndex,
  storiesData,
  setUserIndex,
  setStoryIndex,
  navigation,
}) {
  const handleNextUser = () => {
    let newIndex = userIndex + 1;
    while (
      newIndex < storiesData.length &&
      (!storiesData[newIndex]?.stories || storiesData[newIndex].stories.length === 0)
    ) {
      newIndex++;
    }
    if (newIndex < storiesData.length) {
      setUserIndex(newIndex);
      setStoryIndex(0);
    } else {
      navigation.goBack();
    }
  };

  const handlePrevUser = () => {
    let newIndex = userIndex - 1;
    while (
      newIndex >= 0 &&
      (!storiesData[newIndex]?.stories || storiesData[newIndex].stories.length === 0)
    ) {
      newIndex--;
    }
    if (newIndex >= 0) {
      setUserIndex(newIndex);
      setStoryIndex(0);
    } else {
      navigation.goBack();
    }
  };

  const handleNextStory = () => {
    if (storyIndex < storiesData[userIndex].stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      handleNextUser();
    }
  };

  const handlePrevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else {
      handlePrevUser();
    }
  };

  const handleTap = (evt) => {
    const x = evt.nativeEvent.locationX;
    if (x < width * 0.25) handlePrevStory();
    else if (x > width * 0.75) handleNextStory();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, { dx }) => {
        if (dx > 50) handlePrevUser();
        if (dx < -50) handleNextUser();
      },
    })
  ).current;

  return { handleNextStory, handlePrevStory, handleTap, panResponder };
}
