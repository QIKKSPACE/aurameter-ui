// src/hooks/useDeviceId.ts

import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";

import { setDeviceId } from "../store/deviceSlice";
import { uuidv4 } from "../utils/uuid";

export const useDeviceId = () => {
  const dispatch = useDispatch();

  const deviceId = useSelector(
    state => state.device.deviceId
  );

  useEffect(() => {
    if (deviceId) return;

    (async () => { 
      let id = await AsyncStorage.getItem("deviceId");

      if (!id) {
        id = uuidv4();

        await AsyncStorage.setItem("deviceId", id);
      }

      dispatch(setDeviceId(id));
    })();
  }, [deviceId, dispatch]);

  return deviceId;
};