import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  topic: {
    type: String,
    enum: [
      'arrays', 'strings', 'linked-lists', 'trees', 'graphs',
      'dynamic-programming', 'backtracking', 'binary-search',
      'stack-queue', 'heap', 'greedy', 'other'
    ],
    default: null
  },
  url: { type: String, default: null },
  source: { type: String, enum: ['leetcode', 'gfg', 'manual'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;