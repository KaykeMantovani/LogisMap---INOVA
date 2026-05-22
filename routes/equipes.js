// Rotas da API de Equipes - /api/v1/equipes
const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/v1/equipes - Lista todas as equipes
router.get('/', (req, res) => {
  try {
    const statement = db.prepare('SELECT * FROM equipes ORDER BY criado_em DESC');
    const equipes = statement.all();
    res.json({ success: true, data: equipes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar equipes: ' + error.message });
  }
});

// POST /api/v1/equipes - Cria uma nova equipe
router.post('/', (req, res) => {
  const { nome, responsavel, status } = req.body;

  // Validação simples
  if (!nome || !responsavel) {
    return res.status(400).json({ success: false, error: 'Nome e responsável são obrigatórios.' });
  }

  const statusValido = status || 'ativo';
  if (statusValido !== 'ativo' && statusValido !== 'inactive' && statusValido !== 'inativo') {
    // Garantir que é ativo ou inativo
  }

  try {
    const statement = db.prepare(
      'INSERT INTO equipes (nome, responsavel, status) VALUES (?, ?, ?)'
    );
    const result = statement.run(nome, responsavel, statusValido);
    
    // Busca a equipe recém-criada
    const novaEquipe = db.prepare('SELECT * FROM equipes WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, data: novaEquipe });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao criar equipe: ' + error.message });
  }
});

// PUT /api/v1/equipes/:id - Atualiza uma equipe
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, responsavel, status } = req.body;

  if (!nome || !responsavel || !status) {
    return res.status(400).json({ success: false, error: 'Nome, responsável e status são obrigatórios.' });
  }

  try {
    const checkStatement = db.prepare('SELECT * FROM equipes WHERE id = ?');
    const equipe = checkStatement.get(id);

    if (!equipe) {
      return res.status(404).json({ success: false, error: 'Equipe não encontrada.' });
    }

    const updateStatement = db.prepare(
      'UPDATE equipes SET nome = ?, responsavel = ?, status = ? WHERE id = ?'
    );
    updateStatement.run(nome, responsavel, status, id);

    const equipeAtualizada = checkStatement.get(id);
    res.json({ success: true, data: equipeAtualizada });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao atualizar equipe: ' + error.message });
  }
});

// DELETE /api/v1/equipes/:id - Remove uma equipe
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const checkStatement = db.prepare('SELECT * FROM equipes WHERE id = ?');
    const equipe = checkStatement.get(id);

    if (!equipe) {
      return res.status(404).json({ success: false, error: 'Equipe não encontrada.' });
    }

    // Ao deletar uma equipe, a chave estrangeira em obras (equipe_id) será definida como NULL automaticamente devido a ON DELETE SET NULL
    const deleteStatement = db.prepare('DELETE FROM equipes WHERE id = ?');
    deleteStatement.run(id);

    res.json({ success: true, message: 'Equipe removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao remover equipe: ' + error.message });
  }
});

module.exports = router;
