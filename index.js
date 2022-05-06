const express = require('express');
const cors = require('cors');
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
        const serviceCollection = client.db('inventory_db').collection('products');

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/product/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await serviceCollection.findOne(query);
            res.send(product);
        })

    }

    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('running server')
})

app.listen(port, () => {
    console.log('listening to port', port);
})