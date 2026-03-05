import { createSelector } from "@reduxjs/toolkit";

const EMPTY_QUIZ = {
  localId: null,
  quizName: "",
  description: "",
  questions: []
};

const selectQuizState = state => state.quiz;

export const makeSelectQuizByLocalId = () =>
  createSelector(
    [
      selectQuizState,
      (_, localId) => localId
    ],
    (quizState, localId) => {
      return (
        quizState.drafts.find(q => q.localId === localId) ||
        quizState.quizzes.find(q => q.localId === localId) ||
        EMPTY_QUIZ
      );
    }
  );
