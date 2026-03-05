// models/Quiz.js
import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [OptionSchema], validate: v => v.length >= 2 && v.length <= 4 },
  correctIndex: { type: Number, required: true }, // index of the correct option
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, maxlength: 200 },
  questions: { type: [QuestionSchema], validate: v => v.length >= 1 && v.length <= 10 },
  userId: { type: String, required: true }, // the creator's ID
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", QuizSchema);
