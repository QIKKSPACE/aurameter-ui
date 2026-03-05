import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import StoryViewerImageOnly from '../components/StoryViewerImageOnly';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const StoryViewer = ({ route }) => {
  const { startUserIndex, startStoryIndex } = route.params;
  const navigation = useNavigation();

  const storiesFromStore = useSelector(
    (state) => state.story.stories || []
  );

  // 🔒 Freeze stories ONCE
  const [sessionStories] = useState(storiesFromStore);

  return (
    <View style={{ flex: 1 }}>
      <StoryViewerImageOnly
        users={sessionStories}
        startUserIndex={startUserIndex}
        startStoryIndex={startStoryIndex}
        onComplete={() => navigation.goBack()}
      />
    </View>
  );
};
export default StoryViewer

const styles = StyleSheet.create({})