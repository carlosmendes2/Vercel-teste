//importar o express
const express = require('express');
//criar uma instancia do express
const app = express();

//colocar uma rota para testes 
app.get('/', (req, res) => {
    res.send('Olá! teste na vercel funcionando');
})

app.get('/teste/:nome', (req, res) => {
    res.json({saudacao: `Oi ${req.params.nome}, tudo certo?`});
});

module.exports = app;