// Rotas da API de Configurações - /api/v1/configuracoes
const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/v1/configuracoes/google-maps-key - Retorna o valor atual da chave
router.get('/google-maps-key', (req, res) => {
  try {
    const statement = db.prepare("SELECT valor FROM configuracoes WHERE chave = 'google_maps_api_key'");
    const config = statement.get();
    
    res.json({
      success: true,
      data: {
        key: config ? config.valor : ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar chave do Google Maps: ' + error.message });
  }
});

// PUT /api/v1/configuracoes/google-maps-key - Atualiza a chave
router.put('/google-maps-key', (req, res) => {
  const { key } = req.body;

  if (key === undefined) {
    return res.status(400).json({ success: false, error: 'O campo key é obrigatório.' });
  }

  try {
    const statement = db.prepare(
      "INSERT OR REPLACE INTO configuracoes (chave, valor) VALUES ('google_maps_api_key', ?)"
    );
    statement.run(key.trim());

    res.json({ success: true, message: 'Chave da API do Google Maps atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao salvar chave do Google Maps: ' + error.message });
  }
});

module.exports = router;
