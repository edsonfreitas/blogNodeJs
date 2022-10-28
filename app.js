const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const admin = require("./routes/admin");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
// Postagens
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
//Cateorias
require("./models/Categoria");
const Categoria = mongoose.model("categorias");

const usuarios = require("./routes/usuario")

const path = require("path");
const app = express();
const PORT = 8989;

//Configurações
//Sessão
app.use(
  session({
    secret: "estaSeraChaveSecreta",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});
//Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Handlebars
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado ao mongodb");
  })
  .catch((err) => {
    console.log("Ops! Erro ao se conecta: " + err);
  });
//Public
app.use(express.static(path.join(__dirname, "/public")));

//Rotas
app.get("/", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Ops! Houve um erro interno.");
      res.redirect("/404");
    });
});
//Postagens
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Essa postagem não existe.");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
}); //<--

//Categorias
app.get("/categorias", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Ops! Houve um erro interno ao listar as categorias"
      );
      res.redirect("/");
    });
});//<--
//categorias slug
app.get("/categorias/:slug", (req,res) => {
  Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
    if(categoria){
      
      Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{

        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
      }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar os posts!')
        res.redirect("/")
      })
    }else{
      req.flash('error_msg', 'Essa categoria não existe!')
      res.redirect("/")
    }
  }).catch((err) => {
    req.flash('error_msg', 'Ops! Houve um erro interno ao carregar a página desta categoria.')
    res.redirect("/")
  })
})//<-- 

app.get("/404", (req, res) => {
  res.send("ERRO 404");
});

//Rotas externas
app.use("/admin", admin);
app.use('/usuarios', usuarios)
//<--

//Outros

app.listen(PORT, () => {
  console.log("Server run: http://localhost:" + PORT);
});
