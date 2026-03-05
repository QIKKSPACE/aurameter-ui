// src/hooks/useStories.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import { syncQueueWithFeed } from "../utils/syncQueueWithFeed";
import { fetchStoriesSuccess, fetchStoriesFailure } from "../store/storySlice";

export const useStories = () => {
  const dispatch = useDispatch();
  const user = useSelector(s => s.user.userData);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const { data } = await api.get("/story/getStoriesFeed");
        const feed = await syncQueueWithFeed(data?.feed || [], user);
        data.success
          ? dispatch(fetchStoriesSuccess(feed))
          : dispatch(fetchStoriesFailure({ message: "Failed", feed }));
      } catch (e) {
        dispatch(fetchStoriesFailure({ message: e.message, feed: [] }));
      }
    })();
  }, [user?.id]);
};
