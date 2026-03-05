const ChatListItem = ({ item, user, messagesByChatId }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const { hasUnread } =
    useInboxUnread(item, messagesByChatId);

  const lastMessage = getLastMessagePreview({
    item,
    localLastMessage: null,
    currentUserId: user?.id,
  });

  return (
    <TouchableOpacity
      style={[
        styles.messageCard,
        {
          backgroundColor: hasUnread
            ? theme.components.box
            : theme.components.card,
        },
      ]}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          chat_id: item.chat_id,
          other_user_id: item.other_user_id,
        })
      }
    >
      {/* avatar + text */}
    </TouchableOpacity>
  );
};
