// utils/saveFcmToken.js
import messaging from '@react-native-firebase/messaging';
import api from "../services/api";

export async function saveFcmToken(userId) {
  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
 try {
       const res = await api.post("/user/token-update/",{fcmToken:token });
      if(res.data.success)
      { 
        console.log("Token Added")
      }
      else
      {
        console.log("Failed To add Token ")
   

      }

    } catch (error) {
      console.log(error)
   
      
    }

  messaging().onTokenRefresh(async newToken => {
  try {
       const res = await api.post("/user/token-update/",{fcmToken:newToken });
      if(res.data.success)
      { 
        console.log("Token Added")
      }
      else
      {
        console.log("Failed To add Token ")
   

      }

    } catch (error) {
      console.log(error)
   
      
    }
  });
}
