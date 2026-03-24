const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ mensagem: "Olá! API funcionando na Vercel!" });
});

app.get('/teste/:nome', (req, res) => {
  res.json({ saudacao: `Olá ${req.params.nome}!` });
});

module.exports = app;