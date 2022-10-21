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
    res.render("admin/Categorias")
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

module.exports = router;