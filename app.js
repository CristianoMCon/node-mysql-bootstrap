//Importando dependencias
const express       = require('express');
const fileupload    = require('express-fileupload');
const { engine }    = require('express-handlebars');
const mysql         = require('mysql2');
const bodyParser    = require('body-parser');
const fs            = require('fs');
const doorServer    = 8080;

//Inicializando app
const app = express();

//Habilita upload de arquivos do formulario
app.use(fileupload());

//Habilita resgate dos dados do formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Referenciados dependencias
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/css', express.static('./css'));
//Se nao referenciar diretorio das imagens, app nao localiza as imagens
app.use('/imagens', express.static('./imagens'));


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

//Rotas

//Listar dos produtos
app.get('/',function(req,res){
    //sql
    let sql = "SELECT * FROM produtos";
    conexao.query(sql,function(erro, retorno){
        if(erro) throw erro;
        res.render('formulario',{produtos:retorno});
    });    
});

//Gravar novo produto
app.post('/cadastrar', function(req,res){
    let nome    = req.body.nome;
    let valor    = req.body.valor;
    let imagem  = req.files.imagem.name;
    //SQL
    let sql = "INSERT INTO produtos (nome, valor, imagem) VALUES('"+nome+"',"+valor+",'"+imagem+"')";
    //console.log(sql);
    conexao.query(sql,function(erro, retorno){
        if(erro) throw erro;
        req.files.imagem.mv(__dirname+'/imagens/'+req.files.imagem.name);
        //console.log(retorno);
    })
    res.redirect('/');
})

//Excluir produto
app.get('/excluir/:codigo&:imagem', function(req,res){
    //sql 
    let sql = `DELETE FROM produtos WHERE codigo=`+req.params.codigo;
    conexao.query(sql,function(erro, retorno){
        if(erro) throw erro;
        try {
            //Exclui imagem antiga se existir
            if(fs.existsSync( __dirname+'/imagens/'+req.params.imagem)){
                fs.unlink(__dirname+'/imagens/'+req.params.imagem, (erro_imagem)=>{
                    if(erro_imagem) throw erro_imagem
                    console.log('Sucesso! Imagem do produto foi removida!');
                });  
            }
        }catch(erro){
            console.log('Ops! Nehuma Imagem para remover');
        }   
    })
    res.redirect('/');
})

//Alterar produto - 
//Formulario de alteracao
app.get('/formalterar/:codigo', function(req,res){
    //sql 
    let sql = `SELECT * FROM produtos WHERE codigo=`+req.params.codigo;
    conexao.query(sql,function(erro, retorno){
        if(erro) throw erro;
        res.render('formularioEditar',{produtos:retorno[0]});
    })    
})
//Grava alteracao
app.post('/alterar', function(req,res){
    let codigo        = req.body.codigo;
    let nome         = req.body.nome;
    let valor        = req.body.valor;
    let imagemAntiga = req.body.imagemAntiga;  
    let imagem       = imagemAntiga;  
    let imagemFoiAlterada = false;

    try {
        //console.log(req.files);
        var imagemNova = req.files.imagem.name;        

        if(imagemAntiga == imagemNova){
            console.log('Mesma imagem');
        }else{
            imagemFoiAlterada = true;
            imagem = imagemNova;
            console.log('Nova imagem');            
        }
    }catch(erro){
        console.log('Imagem nao alterada');
    }
    
    //Grava alteracao dos dados no BD
    let sql = "UPDATE produtos SET nome='"+nome+"',valor="+valor+",imagem='"+imagem+"' WHERE codigo="+codigo;
    conexao.query(sql,function(erro, retorno){
        
        if(erro) throw erro;
        console.log('Produto atualizado');
        //console.log('Existe imagem? '+fs.existsSync( __dirname+'/imagens/'+imagemAntiga ));

        if(imagemFoiAlterada){            

            //Exclui imagem antiga se existir
            if(fs.existsSync( __dirname+'/imagens/'+imagemAntiga)){
                fs.unlink(__dirname+'/imagens/'+imagemAntiga, (erro_imagem)=>{
                    if(erro_imagem) throw erro_imagem
                    console.log('Sucesso! Imagem antiga removida');
                }); 
            }

            //Guarda nova imagem
            req.files.imagem.mv(__dirname+'/imagens/'+req.files.imagem.name);
            console.log('Sucesso! Nova imagem guardada');
        }
    }) 

    console.log(nome,valor,imagem);
    res.redirect('/');
})


app.listen(doorServer);