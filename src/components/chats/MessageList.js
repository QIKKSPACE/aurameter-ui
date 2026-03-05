import React, { forwardRef, useCallback } from "react";
import { FlatList, ActivityIndicator, View } from "react-native";
import MessageBubble from "./MessageBubble";

const MessageList = forwardRef(({
  messages,
  user,
  theme,
  avatar,
  onRetry,
  onLongPress,
  onLoadMore,
  isLoading,
  onScroll,
  onLayout,
  onContentSizeChange
}, ref) => {

  const renderItem = useCallback(
    ({ item }) => (
      <MessageBubble
        item={item}
        user={user}
        theme={theme}
        avatar={avatar}
        handleRetry={onRetry}
        onMessageLongPress={onLongPress}
       
      />
    ),
      [
    user.id,
    onRetry,          // ✅ ADD THIS
    onLongPress,      // ✅ ADD THIS
    theme,
    avatar,
      onLayout,
  onContentSizeChange
  ]
  );
  const PaginationLoader = () => {
  if (!isLoading) return null;

  return (
  <View style={{ paddingVertical: 16 }}>
  <ActivityIndicator size="small" color={theme.text.primary} />
  </View>
  );
  };
  return (
    <FlatList
      inverted
      data={messages}
      keyExtractor={(item) => item.local_id}
      renderItem={renderItem}
      onEndReached={onLoadMore}
      onScroll={onScroll}
        onEndReachedThreshold={0.5}
      scrollEventThrottle={16}
      contentContainerStyle={{ padding: 16, paddingTop: 50 }}
      ListFooterComponent={<PaginationLoader />}
       ref={ref}              // 👈 expose FlatList ref
      showsVerticalScrollIndicator={false}
         onLayout={onLayout}
  onContentSizeChange={onContentSizeChange}
    />
  );
});

export default React.memo(MessageList);
