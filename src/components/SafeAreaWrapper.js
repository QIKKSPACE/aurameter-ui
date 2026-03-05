import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaWrapper = ({ children, style, includeBottom = true }) => {
  const insets = useSafeAreaInsets();
  
  const safeAreaStyle = {
    paddingTop: insets.top,
    ...(includeBottom && { paddingBottom: insets.bottom }),
  };

  return (
    <View style={[safeAreaStyle, style]}>
      {children}
    </View>
  );
};

export default SafeAreaWrapper;
