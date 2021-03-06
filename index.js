const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aejyu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('inventory_db').collection('products');

        //AUTH
        app.get('/login', async(req, res) =>{
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({accessToken});
        })


        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            //some
            res.send(product);
        })

        //item collection api
        app.get('/myProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = productCollection.find(query);
            const product = await cursor.toArray();
            res.send(product);
        })

        //took 2hours to work but still not 100% functional
        //low stock LEAVE UNTOUCHED
        app.get('/running_out', async (req, res) => {
            // const query = { quantity: { $lt: 10 } };
            const query = { $or: [{ quantity: { $lt: "15" } }, { quantity: { $lt: 13} }] };
            const cursor = productCollection.find(query);
            const runningOut = await cursor.toArray();
            res.send(runningOut);
        })







        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });



        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/product/:id', async (req, res) => {
            const itemId = req.params.id;
            const updateData = req.body.newItemValue.quantity;
            const filter = { _id: ObjectId(`${itemId}`) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateData
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
        })

    }

    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('running server')
})
app.get('/test', (req, res) => {
    res.send('testing heroku')
})

app.listen(port, () => {
    console.log('listening to port', port);
})