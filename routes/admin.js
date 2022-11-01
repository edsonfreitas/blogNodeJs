const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
//Import o helpers
const { eAdmin } = require("../helpers/eAdmin")

require("../models/Categoria");
const Categoria = mongoose.model("categorias");

require("../models/Postagem");
const Postagem = mongoose.model("postagens");

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
  res.send("Página de Posts");
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .lean()
    .sort({ data: "desc" })
    .then((categorias) => {
      res.render("admin/Categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Ops! Houve um erro ao listar as categorias.");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {
  //Validar formulário
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    //Se não tiver erro, cadastrar os dados.
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch(() => {
        req.flash(
          "error_msg",
          "Ops! ocorreu um erro ao salvar a categoria, tente novamente!"
        );
        res.redirect("/admin");
      });
  }
});

//Rota de atualização de dados
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editcategoria", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria não exite!");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso.");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash(
            "error_mgs",
            "Houve um erro interno ao salvar a edição da categoria"
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria!");
      res.redirect("/admin/categorias");
    });
}); // <-- Atualiza Categoria<---

//Deleta Categoria
router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Ops! Ocorreu um erro ao deletar a categoria!.");
      res.redirect("/admin/categorias");
    });
}); //<--Deleta Categoria<--

//Rotas postagens
router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_mgs", "Ops! Ocorreu um erro ao listar as postagens");
      res.redirect("/admin");
    });
});

router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("admin/addpostagens", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Ops! Houve um erro ao carregar o formulário!");
      res.redirect("admin/postagens");
    });
});
//Salva Postagens no Banco de dados
router.post("/postagens/nova", eAdmin, (req, res) => {
  var erros = [];

  if (
    !req.body.titulo ||
    typeof req.body.titulo == undefined ||
    req.body.titulo == null
  ) {
    erros.push({ texto: "Título inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug inválido" });
  }
  if (req.body.descricao.length < 2) {
    erros.push({ texto: "Descrição muito curta" });
  }
  if (req.body.conteudo.length < 2) {
    erros.push({ texto: "Descrição muito curta" });
  }
  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria!" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagens", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      slug: req.body.slug,
      categoria: req.body.categoria,
    };

    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso!");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro durante o salvamento da postagem!"
        );
        res.redirect("/admin/postagens");
      });
  }
});
//Rota de edição de postagem
router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  //Busca postagens no mongoDB
  Postagem.findOne({ _id: req.params.id })
    .lean()
    .then((postagem) => {
      //Busca Categoria no mongoDB
      Categoria.find()
        .lean()
        .then((categorias) => {
          res.render("admin/editpostagens", {
            categorias: categorias,
            postagem: postagem,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar as categorias.");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição!"
      );
      res.redirect("/admin/postagens");
    });
});
//Atualiza dados da postagem
router.post("/postagem/edit", eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.titulo ||
    typeof req.body.titulo == undefined ||
    req.body.titulo == null
  ) {
    erros.push({ texto: "Título inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug inválido" });
  }
  if (req.body.descricao.length < 2) {
    erros.push({ texto: "Descrição muito curta" });
  }
  if (req.body.conteudo.length < 2) {
    erros.push({ texto: "Descrição muito curta" });
  }
  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria!" });
  }
  if (erros.length > 0) {
    res.render("admin/editpostagens", { erros: erros });
  } else {
    Postagem.findOne({ _id: req.body.id })
      .then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem
          .save()
          .then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!");
            res.redirect("/admin/postagens");
          })
          .catch((err) => {
            req.flash("error_msg", "Ops! Erro interno!");
            res.redirect("/admin/postagens");
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição.");
        res.redirect("/admin/postagens");
      });
  }
});
//Deletar postagem
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.deleteOne({ _id: req.params.id })
    .lean()
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso!");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Ops! Houve um erro interno");
      res.redirect("admin/postagens");
    });
});
// <-- Rotas Postagem < --

module.exports = router;
