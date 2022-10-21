const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const admin = require('./routes/admin')

const path = require('path')
const app = express()

const PORT = 8989
const mongoose = require('mongoose')

//Configurações
    //Body Parser
    app.use(express.urlencoded({extended:true}))
    app.use(express.json())
    //Handlebars
    app.engine("handlebars", handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/blogapp').then(()=>{
        console.log('Conectado ao mongodb')
    }).catch((err)=>{
        console.log("Ops! Erro ao se conecta: " + err)
    })
    //Public
    app.use(express.static(path.join(__dirname,"/public")))
//Rotas
app.get('/', (req,res)=> {
    res.send("Home do Blog")
})

app.use('/admin', admin)

//Outros

app.listen(PORT, () =>{
    console.log("Server run: http://localhost::"+PORT)
})