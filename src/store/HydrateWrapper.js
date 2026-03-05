import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { hydrateQueuedMessages } from "./hydrateQueuedMessages";

const HydrateWrapper = ({ children, persistor }) => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      // Wait until persisted state is restored
      await persistor.flush();

      // Load queued messages
      await dispatch(hydrateQueuedMessages());

      // Mark app as ready
      setReady(true);
    };

    hydrate();
  }, [dispatch]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default HydrateWrapper;
