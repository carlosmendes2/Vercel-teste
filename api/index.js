
const express = require('express');
const pool = require('../db/pool');

const app = express();

// Middleware para ler JSON
app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
  res.json({ mensagem: "Olá! teste na vercel funcionando!" });
});

// Rota com parâmetro
app.get('/teste/:nome', (req, res) => {
  res.json({ saudacao: `Oi ${req.params.nome}, tudo certo?` });
});


// LISTAR todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar:', error);
    res.status(500).json({ erro: error.message });
  }
});

// BUSCAR um usuário específico por ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar:', error);
    res.status(500).json({ erro: error.message });
  }
});

// CRIAR um novo usuário
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, idade } = req.body;
    
    // Validação básica
    if (!nome || !email) {
      return res.status(400).json({ erro: "Nome e email são obrigatórios" });
    }
    
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, idade) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, idade || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar:', error);
    
    // Verificar se é erro de email duplicado
    if (error.code === '23505') { // Código de violação de unique constraint
      return res.status(409).json({ erro: "Email já cadastrado" });
    }
    
    res.status(500).json({ erro: error.message });
  }
});

// ATUALIZAR um usuário
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, idade } = req.body;
    
    const result = await pool.query(
      'UPDATE usuarios SET nome = $1, email = $2, idade = $3 WHERE id = $4 RETURNING *',
      [nome, email, idade, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }
    
    res.status(500).json({ erro: error.message });
  }
});

// DELETAR um usuário
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    
    res.json({ mensagem: "Usuário deletado com sucesso!" });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ erro: error.message });
  }
});

// Rota extra: buscar usuários por idade (exemplo de filtro)
app.get('/usuarios/idade/:min/:max', async (req, res) => {
  try {
    const { min, max } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE idade BETWEEN $1 AND $2 ORDER BY idade',
      [min, max]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao filtrar:', error);
    res.status(500).json({ erro: error.message });
  }
});

module.exports = app;
app.get('/teste/:nome', (req, res) => {
    res.json({saudacao: `Oi ${req.params.nome}, tudo certo?`});
});

module.exports = app;