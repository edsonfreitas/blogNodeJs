const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const admin = require('./routes/admin')
const session = require('express-session')
const flash = require('connect-flash')

const path = require('path')
const app = express()

const PORT = 8989
const mongoose = require('mongoose')

//Configurações
    //Sessão
    app.use(session({
        secret: "estaSeraChaveSecreta",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    //Middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        next();
    })
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