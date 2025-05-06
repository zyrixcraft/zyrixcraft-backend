const express = require('express');
const cors = require('cors');
const faq = require("./faq.json");
const stringSimilarity = require('string-similarity');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const findAnswer = (query) => {
  const questions = faq.map(item => item.question);
  const matches = stringSimilarity.findBestMatch(query, questions);

  const bestMatch = matches.bestMatch;
  console.log('Best match:', bestMatch);

  if (bestMatch.rating > 0.5) {
    const matchedQuestion = bestMatch.target;
    const matchedFaqItem = faq.find(item => item.question === matchedQuestion);
    return matchedFaqItem.answer;
  } else {
    return null;
  }
};

app.post('/ask', (req, res) => {
  const { question } = req.body;
  console.log('Received question:', question);

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  let answer = findAnswer(question);
  if (!answer) {
    answer = "Sorry, I couldn't find an answer for that. Please try rephrasing!";
  }

  return res.json({ answer });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
