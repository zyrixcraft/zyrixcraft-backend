const express = require('express');
const cors = require('cors');
const faq = require("./faq.json");
const stringSimilarity = require('string-similarity');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://zyrixcraft:Zyrixcraft%40%4077@forms.xqf8gij.mongodb.net/?retryWrites=true&w=majority&appName=Forms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

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

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String
});

const Contact = mongoose.model('Contact', ContactSchema);

app.post('/form', async (req, res) => {
  const form = req.body;
  console.log('Received data:', form);
  const { name, email, phone, message } = req.body;

  try {
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    res.status(201).json({ success: true, message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }

});

app.get('/form', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data' });
  }
});

app.delete('/form/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting contact' });
  }
});

const GenericSchema = new mongoose.Schema({}, { strict: false });
const GenericData = mongoose.model('GenericData', GenericSchema);

app.post('/storeData', async (req, res) => {
  const data = req.body;
  console.log('Received generic data:', data);

  try {
    const newData = new GenericData(data);
    await newData.save();
    res.status(201).json({ success: true, message: 'Data stored successfully' });
  } catch (error) {
    console.error('Error saving generic data:', error);
    res.status(500).json({ success: false, message: 'Failed to store data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
