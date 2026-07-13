const topicInferencePrompt = (description) => `
You are a DSA topic classifier.

Given a problem description, classify it into exactly one of these topics:
arrays, strings, linked-lists, trees, graphs, dynamic-programming, 
backtracking, binary-search, stack-queue, heap, greedy, other

Rules:
- Respond with only the topic name in lowercase
- No explanation, no punctuation, just the topic
- If the problem fits multiple topics choose the most dominant one
- Use "other" only if the problem genuinely does not fit any category

Problem description: ${description}
`;

export default topicInferencePrompt;