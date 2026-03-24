module.exports = (req, res) => {
  res.status(200).json({
    mensagem: "Olá! Meu primeiro deploy na Vercel!",
    metodo: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
};