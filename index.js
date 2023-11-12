const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 5038;

const uri = process.env.CONNECTIONSTRING || "mongodb://localhost:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

app.get("/getData", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("alertdb");
    const collection = database.collection("alertcollection");

    const documents = await collection.find({}).toArray();

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

app.post("/addData", async (req, res) => {
  try {
    const newData = req.body;

    console.log("Received data:", newData);

    if (!newData) {
      return res
        .status(400)
        .json({ error: "Request body is missing or empty." });
    }

    await client.connect();

    const database = client.db("alertdb");
    const collection = database.collection("alertcollection");

    const result = await collection.insertOne(newData);

    if (result.insertedCount === 1) {
      return res.json({
        message: "Data added successfully",
        insertedId: result.insertedId,
      });
    } else {
      return res.status(500).json({ error: "Failed to insert data." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
