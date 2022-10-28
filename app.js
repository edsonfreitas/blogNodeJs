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
app.get("/404", (req, res) => {
  res.send("ERRO 404");
});

app.use("/admin", admin);

//Outros

app.listen(PORT, () => {
  console.log("Server run: http://localhost:" + PORT);
});
