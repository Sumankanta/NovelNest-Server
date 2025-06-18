const express = require("express");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
  });

// MongoDB configuration
const uri =
  "mongodb+srv://mern-book-store:EEiuiYPVOsTHDSdn@cluster0.44b9phe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const bookCollections = client.db("BookInventory").collection("books");

    // Insert a book to the database using POST method
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      const result = await bookCollections.insertOne(data);
      res.send(result);
    });

    // Get all books from the database
    // app.get("/all-books", async (req, res) => {
    //   const books = await bookCollections.find().toArray();
    //   res.send(books);
    // });

    // Update a book's data using PATCH method
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const updateBookData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
          $set: {
              ...updateBookData
          }
      }
      const options = { upsert: true };

      // update now
      const result = await bookCollections.updateOne(filter, updatedDoc, options);
      res.send(result);
  })

    // Delete a book's data
    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollections.deleteOne(filter);
      res.send(result);
    });

    //find a book by it's category
    app.get("/all-books", async (req, res) => {
      let query = {};
      if(req.query?.category){
        query = {category:req.query.category}
      }
      const result = await bookCollections.find(query).toArray();
      res.send(result)
    });

    //to get single book data
    app.get("/book/:id", async(req, res) =>{
      const id= req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await bookCollections.findOne(filter);
      res.send(result);
    })

    // Ping to confirm successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensure client closes when finished/error
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});