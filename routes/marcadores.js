// Rotas da API de Marcadores - /api/v1/marcadores
const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/v1/marcadores - Lista todos os marcadores de mapa
router.get('/', (req, res) => {
  try {
    const statement = db.prepare('SELECT * FROM marcadores ORDER BY criado_em DESC');
    const marcadores = statement.all();
    res.json({ success: true, data: marcadores });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar marcadores: ' + error.message });
  }
});

// POST /api/v1/marcadores - Adiciona um novo marcador ao mapa
router.post('/', (req, res) => {
  const { lat, lng, tipo, label } = req.body;

  // Validação
  if (lat === undefined || lng === undefined || !tipo || !label) {
    return res.status(400).json({ success: false, error: 'Campos lat, lng, tipo e label são obrigatórios.' });
  }

  // Validação dos tipos suportados
  const tiposValidos = ['obra', 'hospedagem', 'deposito', 'veiculo'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ success: false, error: `Tipo inválido. Deve ser um dos seguintes: ${tiposValidos.join(', ')}` });
  }

  // Definindo a cor padrão correspondente a cada tipo
  let cor = '#00d4ff'; // Hospedagem (azul)
  if (tipo === 'obra') cor = '#ff4757'; // Vermelho
  else if (tipo === 'deposito') cor = '#ffb300'; // Amarelo
  else if (tipo === 'veiculo') cor = '#1adb8a'; // Verde

  try {
    const statement = db.prepare(
      'INSERT INTO marcadores (lat, lng, tipo, label, cor) VALUES (?, ?, ?, ?, ?)'
    );
    const result = statement.run(Number(lat), Number(lng), tipo, label, cor);

    const novoMarcador = db.prepare('SELECT * FROM marcadores WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: novoMarcador });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao adicionar marcador: ' + error.message });
  }
});

// DELETE /api/v1/marcadores/:id - Remove um marcador do mapa
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const checkStatement = db.prepare('SELECT * FROM marcadores WHERE id = ?');
    const marcador = checkStatement.get(id);

    if (!marcador) {
      return res.status(404).json({ success: false, error: 'Marcador não encontrado.' });
    }

    const deleteStatement = db.prepare('DELETE FROM marcadores WHERE id = ?');
    deleteStatement.run(id);

    res.json({ success: true, message: 'Marcador removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao remover marcador: ' + error.message });
  }
});

module.exports = router;
