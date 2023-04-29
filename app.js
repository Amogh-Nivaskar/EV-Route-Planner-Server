require("dotenv").config();

const express = require("express");
const app = express()
const admin = require('firebase-admin');

const serviceAccount = {
    "type": process.env.SERVICE_ACC,
    "project_id":  process.env.PROJECT_ID,
    "private_key_id":  process.env.PRIVATE_KEY_ID ,
    "private_key":  process.env.PRIVATE_KEY.replace(/\\n/g, '\n') ,
    "client_email":  process.env.CLIENT_EMAIL ,
    "client_id":  process.env.CLIENT_ID ,
    "auth_uri":  process.env.AUTH_URI ,
    "token_uri":  process.env.TOKEN_URI ,
    "auth_provider_x509_cert_url":  process.env.AUTH_PROVIDER ,
    "client_x509_cert_url":  process.env.CLIENT_CERT_URL ,
};

const cors = require("cors");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// console.log("initialized app")

const db = admin.firestore();
// console.log("connected to db")

app.use(express.json())

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.SRC_URL,
}))


app.use(express.urlencoded({extended: true}));

app.post('/create', async (req, res) => {
    try{
        console.log(req.body);
        const id = req.body.id;
        const data = {
            id: req.body.id,
            name: req.body.name,
            lat: req.body.lat,
            lng: req.body.lng,
            waitingTime: req.body.waitingTime
        }

        const response = await db.collection("Stations").doc(id).set(data);

        res.send( response );
    }catch(error){
        res.send(error);
    }
    
})

app.get('/read/:id', async (req, res) => {
    try{
        const userRef = db.collection("Stations").doc(req.params.id);
        const response = await userRef.get();
        const wt = response.data().waitingTime;
        
        res.send({"waitingTime": wt});
    }catch(error){
        res.send(error);    
    }
})

app.get('/exists/:id', async (req, res) => {
    try{
        const userRef = db.collection("Stations").doc(req.params.id);
        const response = await userRef.get();
        const data = response.data();
        // console.log(data);
        if(data){
            res.send({"exists" : true});
        }else{
            res.send({"exists" : false});
        }
    }catch(error){
        res.send(error);    
    }
})

app.post('/update/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const new_waiting_time = req.body.waitingTime;
        const response = await db.collection("Stations").doc(id).update({
            waitingTime: new_waiting_time
        });

        res.send(response);
    }catch(error){
        res.send(error);
    }
})

app.delete('/delete/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const response = await db.collection("Stations").doc(id).delete();
        console.log("deleted station")
        res.send(response);
    }catch(error){
        res.send(error);
    }
})


app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}.`);
})