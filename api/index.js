const express = require('express');
const { Pool } = require('pg');

const app = express();

// Middleware para ler JSON
app.use(express.json());

// Pool de conexão GLOBAL (reutilizado)
let pool = null;

function getPool() {
  if (!pool) {
    console.log('🔄 Criando nova conexão com o banco...');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

// Rota de teste inicial
app.get('/', (req, res) => {
  res.json({ 
    mensagem: "Olá! API funcionando!",
    status: "online",
    database: process.env.DATABASE_URL ? "configurado" : "não configurado"
  });
});

// Rota para testar conexão com banco
app.get('/health', async (req, res) => {
  try {
    const dbPool = getPool();
    const result = await dbPool.query('SELECT NOW() as agora');
    res.json({ 
      status: "ok", 
      database: "conectado",
      hora: result.rows[0].agora 
    });
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    res.status(500).json({ 
      status: "erro", 
      database: "falhou",
      erro: error.message 
    });
  }
});

// LISTAR todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const dbPool = getPool();
    const result = await dbPool.query('SELECT * FROM usuarios ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar:', error.message);
    res.status(500).json({ 
      erro: error.message,
      dica: "Verifique se a tabela 'usuarios' existe"
    });
  }
});

// CRIAR um novo usuário
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, idade } = req.body;
    
    if (!nome || !email) {
      return res.status(400).json({ erro: "Nome e email são obrigatórios" });
    }
    
    const dbPool = getPool();
    const result = await dbPool.query(
      'INSERT INTO usuarios (nome, email, idade) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, idade || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar:', error.message);
    
    if (error.code === '23505') {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }
    
    if (error.code === '42P01') {
      return res.status(500).json({ 
        erro: "Tabela 'usuarios' não existe. Execute o script SQL no Supabase.",
        sql: "CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nome VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, idade INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
      });
    }
    
    res.status(500).json({ erro: error.message });
  }
});

// BUSCAR um usuário
app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbPool = getPool();
    const result = await dbPool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar:', error.message);
    res.status(500).json({ erro: error.message });
  }
});

// ATUALIZAR um usuário
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, idade } = req.body;
    
    const dbPool = getPool();
    const result = await dbPool.query(
      'UPDATE usuarios SET nome = $1, email = $2, idade = $3 WHERE id = $4 RETURNING *',
      [nome, email, idade, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar:', error.message);
    res.status(500).json({ erro: error.message });
  }
});

// DELETAR um usuário
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbPool = getPool();
    const result = await dbPool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    
    res.json({ mensagem: "Usuário deletado com sucesso!" });
  } catch (error) {
    console.error('Erro ao deletar:', error.message);
    res.status(500).json({ erro: error.message });
  }
});

// Rota de teste com parâmetro
app.get('/teste/:nome', (req, res) => {
  res.json({ saudacao: `Oi ${req.params.nome}, tudo certo?` });
});

// Tratamento de erros GLOBAL
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    detalhe: err.message 
  });
});

// ⚠️ EXPORTAÇÃO OBRIGATÓRIA PARA A VERCEL
module.exports = app;