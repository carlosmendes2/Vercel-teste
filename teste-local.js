require('dotenv').config();

console.log('📋 Verificando .env...');
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL não encontrada no .env');
  process.exit(1);
}

// Esconder a senha no log
const urlSegura = process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@');
console.log('🔗 String de conexão:', urlSegura);

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testar() {
  try {
    console.log('🔄 Conectando ao banco...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    // Testar se a tabela existe
    const result = await client.query('SELECT * FROM usuarios');
    console.log('📋 Usuários encontrados:', result.rows.length);
    console.table(result.rows);
    
    await client.end();
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Dicas:');
      console.log('1. Verifique se a senha no .env está correta');
      console.log('2. No Supabase, vá em Settings → Database e confirme a senha');
      console.log('3. Se não souber a senha, clique em "Reset password"');
    }
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔧 Dicas:');
      console.log('1. O projeto pode ter sido desativado ou deletado');
      console.log('2. Crie um novo projeto no Supabase');
      console.log('3. Copie a nova string de conexão');
    }
    
    await client.end();
  }
}

testar();