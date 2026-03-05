import React, { useEffect, useState, useMemo } from "react";
import { FlatList, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";

import ScreenBackground from "../components/ScreenBackground";
import StoriesBar from "../components/home/StoriesBar";
import HomeHeader from "../components/home/HomeHeader";
import HomeTabs from "../components/home/HomeTabs";
import GlobalLeaderboard from "../components/GlobalLeaderboard"; // ✅ import your leaderboard
import CampusLeaderboard from "../components/CampusLeaderboard"; // ✅ import your leaderboard
import FollowingLeaderboard from "../components/FollowingLeaderboard"; // ✅ import your leaderboard
import { isExpired } from "../utils/isExpired";

import { useNotificationSetup } from "../notifications/useNotificationSetup";
import { useStoryPolling } from "../polling/useStoryPolling";
import { fetchLeaderboard } from "../store/leaderboardSlice";

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
    
  useStoryPolling(); // ✅ starts/stops polling automatically

  const [activeTab, setActiveTab] = useState("Global");

  const userData = useSelector(state => state.user.userData);
  const storiesData = useSelector(state => state.story.stories);



  useNotificationSetup(userData?.id);
const leaderboardState = useSelector(state => state.leaderboard);

useEffect(() => {
  if (!userData?.id) return;

  // ---------------- Global ----------------
  if (isExpired(leaderboardState.global.lastFetchedAt)) {
    dispatch(fetchLeaderboard({ type: "global" }));
  }

  // ---------------- Campus ----------------
  if (
    userData.campus_id &&
    (
      leaderboardState.campus.campusId !== userData.campus_id ||
      isExpired(leaderboardState.campus.lastFetchedAt)
    )
  ) {
    dispatch(
      fetchLeaderboard({
        type: "campus",
        campusId: userData.campus_id,
      })
    );
  }

  // ---------------- Following ----------------
  //if (isExpired(leaderboardState.following.lastFetchedAt)) {
    //dispatch(fetchLeaderboard({ type: "following" }));
 // }

}, [userData?.id]);
  const storiesForRender = useMemo(() => {
    if (!storiesData || storiesData.length === 0) {
      return [{
        user_id: userData?.id || "me",
        stories: [],
        isSelf: true,
      }];
    }
    return storiesData;
  }, [storiesData, userData?.id]);

  // ---------------- Fetch leaderboard on tab change ----------------


  const renderHeader = () => (
    <>
      <StoriesBar stories={storiesForRender} />
      <HomeHeader />
      <HomeTabs activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
const renderLeaderboard = () => {
  if (!userData) return null;

  switch (activeTab) {
    case "Campus":
      return (
        <View style={{ paddingHorizontal: 15 }}>
          <CampusLeaderboard
            navigation={navigation}
            isProfileCompletion={userData?.isProfileComplete === false}
          />
        </View>
      );

    case "Follow":
      return (
        <View style={{ paddingHorizontal: 15 }}>
          <FollowingLeaderboard
            navigation={navigation}
            isProfileCompletion={userData?.isProfileComplete === false}
          />
        </View>
      );

    case "Global":
    default:
      return (
        <View style={{ paddingHorizontal: 15}}>
          <GlobalLeaderboard
            navigation={navigation}
            isProfileCompletion={userData?.isProfileComplete === false}
            userId={userData?.id}
          />
        </View>
      );
  }
};

  return (
    <ScreenBackground>
      <FlatList
        data={[]} // empty because content is in header and leaderboard
        renderItem={null}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderLeaderboard()}
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenBackground>
  );
};

export default HomeScreen;
