import api from "../../services/api";
import { updateViewsAndStreak } from "../../store/storySlice";

export const sendStoryView = async ({
  currentStory,
  currentUserGroup,
  userdata,
  dispatch,
}) => {
  if (!currentStory?.story_id || currentStory?.user_id === userdata.id) return;

  try {
    if (!currentUserGroup.is_streak_active) {
      dispatch(updateViewsAndStreak({ user_id: currentUserGroup.user_id }));
    }

    await api.post("/story/storyView", {
      storyId: currentStory.story_id,
      storyCreator: currentUserGroup.user_id,
    });

    console.log("Story view sent for", currentStory.story_id);
  } catch (err) {
    console.error("Failed to send story view", err);
  }
};
