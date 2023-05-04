const express = require('express')
const mongoose = require('mongoose')
const stripe = require('stripe')('DAN_RIT_SECRET_KEY')
const cors = require('cors')

const app = express()
const port = 4000;

//configure middelwares
app.use(express.urlencoded({extended:true }))
app.use(express.json())
app.use(cors())

//connect to mongodb database
mongoose.connect('mongodb://0.0.0.0:27017/stipe-db')
mongoose.connection
.once('open', () => console.log('successfuly connected to database'))
.on('error', (error) => console.log('there was a problem while connecting ' + error))

//defining the schema for storing payments
const paymentSchema = new mongoose.Schema({
    amount: Number,
    currency: String,
    description: String,
    source: Object,
    created_at:{type:Date, default:Date.now}
  });

  //payments model
  const Payment = mongoose.model('Payment', paymentSchema);

  //routes

  app.post('/api/payments', async(req,res) => {
   const {amount, currency, description, token} = req.body;
   try{
    //create a charge using the stripe API

    const charge = await stripe.charges.create({
        amount: amount * 100,
        currency,
        description,
        source: token.id
    });

    //store the payment in the database

    const payment = new Payment({
        amount,
        currency,
        description,
        source: charge.source
    });
    await payment.save()
    //return a successful response
    res.json({success: true})
   }
   catch(error){
    //returning an error response
    res.status(500).json({error: error.message})
   }
  });

  app.listen(port, () => console.log(`server listening on localhost port: ${port}`))