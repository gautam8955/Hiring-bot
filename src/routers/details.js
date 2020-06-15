const express = require('express')
const Details = require('../models/details')

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


const app = express()

app.use(express.json())

const fd = ((name, email, phone, field, experience, employed, position, interview, feedback) => {
    console.log(name)
    console.log(email)
    console.log(phone)
    console.log(field)
    console.log(experience)
    console.log(employed)
    console.log(position)
    console.log(interview)
    console.log(feedback)

    var detail = {
        name: name,
        email: email,
        phone: phone,
        field: field,
        experience: experience,
        employed: employed, 
        position: position,
        interview: interview,
        feedback: feedback
    }

    // console.log(detail)

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("hiring-bot");
        // var myobj = { name: "Company Inc", address: "Highway 37" };
        dbo.collection("details").insertOne(detail, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
      });
  

    return detail
})



const db = ((detail) => {
    console.log(detail)
    console.log(detail.field)


})




module.exports =  {
    fd: fd, 
    db: db
}

