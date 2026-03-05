import React from "react";
import { useSelector } from "react-redux";
import { BaseToast } from "./BaseToast";

export const AuraToast = ({
  visible,
  message,
  onPress,
  onHide,
  duration,
}) => {
  // If Aura chat screen is already open → don't show toast
  const isAuraChatOpen = useSelector(
    (state) => state.auraChat?.isOpen
  );

  if (isAuraChatOpen) return null;

  return (
    <BaseToast
      visible={visible}
      avatar={require("../assets/aura_chat.png")}
      username="Aura Chat"
      message={message}
      duration={duration}
      onPress={onPress}
      onHide={onHide}
    />
  );
};
