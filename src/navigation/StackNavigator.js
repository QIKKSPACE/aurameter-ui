// navigation/StackNavigator.js
import React from "react";
import { Easing } from "react-native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { useSelector } from "react-redux";

// Screens
import TabNavigator from "./TabNavigator";
import LoginScreen from "../screens/Login";
import ChooseUsername from "../screens/ChooseUsername";
import AddEmailAndPassword from "../screens/AddEmailAndPassword";
import VerifyEmail from "../screens/VerifyEmail";
import ForgotPasswordEmail from "../screens/ForgotPasswordEmail";
import ForgotPasswordCode from "../screens/ForgotPasswordCode";
import ResetPassword from "../screens/ResetPassword";
import PickCampus from "../screens/PickCampus";


// Authenticated screens
import ConnectionsScreen from "../screens/ConnectionsScreen";
import EarnAuraPointsScreen from "../screens/EarnAuraPointsScreen";
import FollowingScreen from "../screens/FollowingScreen";
import FollowersScreen from "../screens/FollowersScreen";
import EditProfileScreen from "../screens/EditProfile";
import IRLScreen from "../screens/IRLScreen";
import ThemeSelectionScreen from "../screens/ThemeSelectionScreen";
import SearchScreen from "../screens/SearchScreen";
import StoryEditorScreen from "../screens/StoryEditorScreen";
import AddStoryScreen from "../screens/AddStoryScreen";

import PostStoryScreen from "../screens/PostStory";
import ComplimentScreen from "../screens/WatchStory";
import StepTrackerScreen from "../screens/WalkingScreen";
import SudokuScreen from "../screens/SudokuScreen";
import WordCompletionScreen from "../screens/WordCompletionScreen";
import QuizScreen from "../screens/QuizScreen";
import MoodJournalScreen from "../screens/MoodJournal";
import BreathingScreen from "../screens/BreathingScreen";
import BallSortScreen from "../screens/BallSort";
import AuraWhisperScreen from "../screens/AuraWhisperScreen";
import StreakScreen from "../screens/StreakScreen";
import StoryUploadScreen from "../screens/StoryUploadScreen";
import ThemeOnbordingScreen from "../screens/ThemeOnbordingScreen";
import AuraChatScreen from "../screens/AuraChat";
import OtherProfile from "../screens/OtherProfile";
import ChatScreen from "../screens/ChatScreen";
import UpdateEmailScreen from "../screens/UpdateEmail";

import UpdateEmailCode from "../screens/UpdateEmailCode";
import OtherConnectionsScreen from "../screens/OtherConnectionsScreen";
import Maths from "../screens/Maths";
import CreateQuizScreen from "../screens/CreateQuizScreen";
import AllQuizScreen from "../screens/AllQuizScreen";



import TetrisTestScreen from "../screens/TetrisTestScreen";
import UserQuiz from "../screens/UserQuiz";










import AddPlayList from "../screens/AddPlaylist";
import CarGame from "../screens/CarGame";






const Stack = createStackNavigator();

const StackNavigator = () => {
  const user = useSelector((state) => state.user.userData);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        transitionSpec: {
          open: { animation: "timing", config: { duration: 320, easing: Easing.out(Easing.poly(5)) } },
          close: { animation: "timing", config: { duration: 300, easing: Easing.in(Easing.poly(4)) } },
        },
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
      }}
    >
      {user ? (
        // ✅ Authenticated Stack
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Connections" component={ConnectionsScreen} />
          <Stack.Screen name="Rewards" component={EarnAuraPointsScreen} />
          <Stack.Screen name="Following" component={FollowingScreen} />
          <Stack.Screen name="Followers" component={FollowersScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="IRLScreen" component={IRLScreen} />
          <Stack.Screen name="Theme" component={ThemeSelectionScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="AddStory" component={AddStoryScreen} />
          <Stack.Screen name="PostStory" component={StoryEditorScreen} />
          <Stack.Screen name="Storyview" component={ComplimentScreen} />
          <Stack.Screen name="Walking" component={StepTrackerScreen} />
          <Stack.Screen name="SudokuScreen" component={SudokuScreen} />
          <Stack.Screen name="WordComp" component={WordCompletionScreen} />
          <Stack.Screen name="QuizScreen" component={QuizScreen} />
          <Stack.Screen name="MoodJournalScreen" component={MoodJournalScreen} />
          <Stack.Screen name="BreathingScreen" component={BreathingScreen} />
          <Stack.Screen name="BallSortGame" component={BallSortScreen} />
          <Stack.Screen name="AddPlaylist" component={AddPlayList} />
          <Stack.Screen name="AuraChatScreen" component={AuraChatScreen} />
          <Stack.Screen name="OtherProfile" component={OtherProfile} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="UpdateEmail" component={UpdateEmailScreen} />
          <Stack.Screen name="VerifyEmailUpdate" component={UpdateEmailCode} />
          <Stack.Screen name="OtherConnection" component={OtherConnectionsScreen} />
          <Stack.Screen name="Maths" component={Maths} />
          <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} />
          <Stack.Screen name="AllQuiz" component={AllQuizScreen} />
          <Stack.Screen name="PlayQuiz" component={UserQuiz} />

          













          <Stack.Screen name="TetrisScreen" component={TetrisTestScreen} />
          <Stack.Screen
            name="StreakScreen"
            component={StreakScreen}
            options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }}
          />
          <Stack.Screen name="StoryUploadScreen" component={StoryEditorScreen} />

        </>
      ) : (
        // ✅ Unauthenticated Stack
        <>

          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ChooseUsername" component={ChooseUsername} />
          <Stack.Screen name="AddEmailAndPassword" component={AddEmailAndPassword} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
          <Stack.Screen name="PickCampus" component={PickCampus} />
          <Stack.Screen name="ThemeOnboarding" component={ThemeOnbordingScreen} />
          <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmail} />
          <Stack.Screen name="ForgotPasswordCode" component={ForgotPasswordCode} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
