// Rotas da API de Obras - /api/v1/obras
const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/v1/obras - Lista todas as obras com dados da equipe associada
router.get('/', (req, res) => {
  try {
    const statement = db.prepare(`
      SELECT o.*, e.nome as equipe_nome 
      FROM obras o
      LEFT JOIN equipes e ON o.equipe_id = e.id
      ORDER BY o.criado_em DESC
    `);
    const obras = statement.all();
    res.json({ success: true, data: obras });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar obras: ' + error.message });
  }
});

// POST /api/v1/obras - Cria uma nova obra
router.post('/', (req, res) => {
  const { nome, endereco, equipe_id, status } = req.body;

  if (!nome || !endereco) {
    return res.status(400).json({ success: false, error: 'Nome e endereço são obrigatórios.' });
  }

  const equipeValida = equipe_id || null;
  const statusValido = status || 'em_andamento';

  try {
    // Se equipe_id for especificado, verifica se a equipe existe
    if (equipeValida !== null) {
      const equipe = db.prepare('SELECT id FROM equipes WHERE id = ?').get(equipeValida);
      if (!equipe) {
        return res.status(400).json({ success: false, error: 'Equipe especificada não existe.' });
      }
    }

    const statement = db.prepare(
      'INSERT INTO obras (nome, endereco, equipe_id, status) VALUES (?, ?, ?, ?)'
    );
    const result = statement.run(nome, endereco, equipeValida, statusValido);

    const novaObra = db.prepare(`
      SELECT o.*, e.nome as equipe_nome 
      FROM obras o
      LEFT JOIN equipes e ON o.equipe_id = e.id
      WHERE o.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: novaObra });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao criar obra: ' + error.message });
  }
});

// PUT /api/v1/obras/:id - Atualiza uma obra
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, endereco, equipe_id, status } = req.body;

  if (!nome || !endereco || !status) {
    return res.status(400).json({ success: false, error: 'Nome, endereço e status são obrigatórios.' });
  }

  const equipeValida = equipe_id || null;

  try {
    const checkStatement = db.prepare('SELECT * FROM obras WHERE id = ?');
    const obra = checkStatement.get(id);

    if (!obra) {
      return res.status(404).json({ success: false, error: 'Obra não encontrada.' });
    }

    // Se equipe_id for especificado, verifica se a equipe existe
    if (equipeValida !== null) {
      const equipe = db.prepare('SELECT id FROM equipes WHERE id = ?').get(equipeValida);
      if (!equipe) {
        return res.status(400).json({ success: false, error: 'Equipe especificada não existe.' });
      }
    }

    const updateStatement = db.prepare(
      'UPDATE obras SET nome = ?, endereco = ?, equipe_id = ?, status = ? WHERE id = ?'
    );
    updateStatement.run(nome, endereco, equipeValida, status, id);

    const obraAtualizada = db.prepare(`
      SELECT o.*, e.nome as equipe_nome 
      FROM obras o
      LEFT JOIN equipes e ON o.equipe_id = e.id
      WHERE o.id = ?
    `).get(id);

    res.json({ success: true, data: obraAtualizada });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao atualizar obra: ' + error.message });
  }
});

// DELETE /api/v1/obras/:id - Remove uma obra
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const checkStatement = db.prepare('SELECT * FROM obras WHERE id = ?');
    const obra = checkStatement.get(id);

    if (!obra) {
      return res.status(404).json({ success: false, error: 'Obra não encontrada.' });
    }

    const deleteStatement = db.prepare('DELETE FROM obras WHERE id = ?');
    deleteStatement.run(id);

    res.json({ success: true, message: 'Obra removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao remover obra: ' + error.message });
  }
});

module.exports = router;
