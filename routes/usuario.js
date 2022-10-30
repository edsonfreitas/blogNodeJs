const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");

require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

router.get("/registro", (req, res) => {
  res.render("usuarios/registro");
});

//Validaçao do formulario
router.post("/registro", (req, res) => {
  let erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    erros.push({ texto: "E-mail inválido" });
  }
  if (
    !req.body.senha ||
    typeof req.body.senha == undefined ||
    req.body.senha == null
  ) {
    erros.push({ texto: "Senha inválida" });
  }
  if (req.body.senha.length < 4) {
    erros.push({ texto: "Senha muito curta" });
  }
  if (req.body.senha != req.body.senha2) {
    erros.push({ texto: "As senhas são diferentes, tente novamente!" });
  }

  if (erros.length > 0) {
    res.render("usuarios/registro", { erros: erros });
  } else {
    //Verifica se usuário já está cadrastado
    Usuario.findOne({ email: req.body.email })
      .lean()
      .then((usuario) => {
        if (usuario) {
          req.flash(
            "error_msg",
            "Já existe uma conta com esse e-mail no nosso sistema"
          );
          res.redirect("/usuarios/registro");
        } else {
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
          });

          //criptografia de senha
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash(
                  "error_msg",
                  "Houve ao tentar salvar os dados do usuário.!"
                );
                res.redirect("/");
              } else {
                novoUsuario.senha = hash;

                novoUsuario
                  .save()
                  .then(() => {
                    req.flash("success_msg", "Usuário criado com sucesso!");
                    res.redirect("/");
                  })
                  .catch((err) => {
                    req.flash(
                      "error_msg",
                      "Ops! Houve um erro ao criar o usuário, tente novamente!"
                    );
                    res.redirect("/usuarios/registro");
                  });
              }
            });
          });
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
      });
  }
});
//Rota login
router.get("/login", (req, res) => {
  res.render("usuarios/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true
  })(req, res, next);
});

module.exports = router;
