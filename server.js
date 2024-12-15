require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const balldontlieApiKey = process.env.BALLDONTLIE_API_KEY;
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${username}:${password}@cluster0.yyzeh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let collection;

async function initializeDB() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection(collectionName);
  console.log("Connected to MongoDB");
  
  // Start the server only after DB connection is established
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

initializeDB().catch(console.error);


app.get('/', (req, res) => {
  res.render('index');
});

app.post('/player', async (req, res) => {
  const { playerName, jerseyNumber } = req.body;

  const userEntry = { playerName, jerseyNumber, date: new Date() };
  await collection.insertOne(userEntry);

  const url = `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(playerName)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': balldontlieApiKey
      }
    });
    const apiData = response.data; 

    res.render('result', { playerName, jerseyNumber, apiData });
  } catch (error) {
    console.error(error);
    res.send("API error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
