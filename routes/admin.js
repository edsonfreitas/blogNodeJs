const { text } = require('body-parser')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')

router.get('/', (req, res)=>{
    res.render("admin/index")
})

router.get('/posts', (req, res)=>{
    res.send("Página de Posts")
})

router.get('/categorias', (req, res)=>{
    Categoria.find().lean().sort({data: 'desc'}).then((categorias) => {
        res.render("admin/Categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Ops! Houve um erro ao listar as categorias.')
        res.redirect("/admin")
    })
})

router.get('/categorias/add',(req, res)=>{
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', (req, res) => {
    //Validar formulário
    var erros = []

    if(!req.body.nome  || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"})
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        //Se não tiver erro, cadastrar os dados.
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        
        new Categoria(novaCategoria).save().then(()=>{
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch(()=>{
            req.flash('error_msg', 'Ops! ocorreu um erro ao salvar a categoria, tente novamente!')
            res.redirect('/admin')
        })
    }
})

//Rota de atualização de dados
router.get("/categorias/edit/:id", (req, res) => {

    Categoria.findOne({_id: req.params.id}).lean().then((categoria) =>{
        res.render("admin/editcategoria", {categoria: categoria})
    }).catch((err)=>{
        req.flash('error_msg', 'Esta categoria não exite!')
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", (req, res) => {

    Categoria.findOne({_id: req.body.id}).then((categoria) =>{

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() =>{
            req.flash('success_msg', 'Categoria editada com sucesso.')
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash('error_mgs', 'Houve um erro interno ao salvar a edição da categoria')
            res.redirect("/admin/categorias")
        })

    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao editar a categoria!')
        res.redirect("/admin/categorias")
    })
}) // <-- Atualiza Categoria<---

//Deleta Categoria
router.post("/categorias/deletar", (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash('error_msg', 'Ops! Ocorreu um erro ao deletar a categoria!.')
        res.redirect("/admin/categorias")
    })
})

//<--Deleta Categoria<--

module.exports = router;