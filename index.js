const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();

//meddleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Boss is Setting")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wuymlps.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const userCollection = client.db("BistroDB").collection("users");
    const menuCollection = client.db("BistroDB").collection("menu");
    const reviewCollection = client.db("BistroDB").collection("review");
    const cartCollection = client.db("BistroDB").collection("carts");

    // Get All Users
    app.get("/users", async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    // Delete Signle User By Admin Requist
    app.delete("/users/:id", async(req, res) => {
      const userId = req.params.id; 
      const query = {_id: new ObjectId(userId)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    // Make Admin
    app.patch("/users/admin/:id", async(req, res) => {
      const userId = req.params.id;
      const query = {_id: new ObjectId(userId)};
      const updateDoc  = {
        $set: {
          isAdmin: true
        }
      }
    })

    // Register A New User
    app.post("/users", async (req, res) => {
      const userData = req.body;
      const query = {userEmail: userData.userEmail};
      const existingEmail = await userCollection.findOne(query);
      if(existingEmail){
        return res.send({message: "This Email is Alredy Exist", insertedId: null})
      }
      const result = await userCollection.insertOne(userData);
      res.send(result);
    })

    

    // get all food menu from menu collection
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    // GET MENU ITEM WITH Quantity
    app.get('/menuWithQuentity/:quantity', async (req, res) => {
      const menuQuantity = req.params.quantity;
      const quantity = parseInt(menuQuantity);
      const result = await menuCollection.find().limit(quantity).toArray();
      res.send(result);
    });

    // get all food reviews from review collection
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    // get all food order from carts collection
    app.get("/carts", async(req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })

    // insert new food order into the cart collection
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result)
    })

    // delete food order 
    app.delete("/carts/:id", async (req, res) => {
      const cartId = req.params.id;
      const query = {_id: new ObjectId(cartId)};
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log("Bistro Boss is Setting os", port)
})

/*
* ----------------------------
*     NAMING CONVENTION
* ----------------------------
* app.get("/users") 
* app.get("/users/:id") 
* app.post("/users") 
* app.put("/users/:id") 
* app.patch("/users/:id") 
* app.delete("/users/:id") 
*/