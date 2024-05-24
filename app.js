//Importando dependencias
const express = require('express');
const { engine } = require('express-handlebars');
const mysql = require('mysql2');

//Inicializando app
const app = express();

//Adicionando bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/css', express.static('./css'));

//Config handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//Ativando manipulacao de rotas com json - se nao nao resgata os dados do formulario
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Config conexao com banco de dados
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lojaroupas'
});

//Teste conexao com banco de dados
conexao.connect(function(erro){
    if(erro){ throw erro;}
    //console.log('Uhuuuuu! Conexao sucesso!');
})

//Rota raiz
app.get('/',function(req,res){
    //res.write('Cristiano esta aqui!');
    res.render('formulario');
    //res.end();
});

app.post('/cadastrar', function(req,res){
    console.log(req.body);
    res.end();
})

//Porta monitorada que sera a home do app
app.listen(8080);

