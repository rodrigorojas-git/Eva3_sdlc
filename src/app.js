const express = require('express');

const app = express();
app.use(express.json());

// "Base de datos" en memoria para la demo
const asistencias = [];
const notas = [];
const mensajes = [];

// Calcula el promedio de un arreglo de notas (escala 1.0 a 7.0)
function calcularPromedio(lista) {
  if (lista.length === 0) return 0;
  const suma = lista.reduce((total, n) => total + n, 0);
  return Math.round((suma / lista.length) * 10) / 10;
}

// Calcula el porcentaje de asistencia de un estudiante
function porcentajeAsistencia(registros) {
  if (registros.length === 0) return 0;
  const presentes = registros.filter((r) => r.presente).length;
  return Math.round((presentes / registros.length) * 100);
}

app.get('/', (req, res) => {
  res.json({ mensaje: 'API EduTech Labs funcionando' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---- Asistencia ----
app.post('/asistencia', (req, res) => {
  const { estudiante, fecha, presente } = req.body;
  if (!estudiante || !fecha || typeof presente !== 'boolean') {
    return res.status(400).json({ error: 'Faltan datos de asistencia' });
  }
  const registro = { estudiante, fecha, presente };
  asistencias.push(registro);
  res.status(201).json(registro);
});

app.get('/asistencia/:estudiante', (req, res) => {
  const registros = asistencias.filter((a) => a.estudiante === req.params.estudiante);
  res.json({
    estudiante: req.params.estudiante,
    porcentaje: porcentajeAsistencia(registros),
  });
});

// ---- Evaluaciones ----
app.post('/notas', (req, res) => {
  const { estudiante, nota } = req.body;
  if (!estudiante || typeof nota !== 'number' || nota < 1 || nota > 7) {
    return res.status(400).json({ error: 'La nota debe estar entre 1.0 y 7.0' });
  }
  notas.push({ estudiante, nota });
  res.status(201).json({ estudiante, nota });
});

app.get('/notas/:estudiante', (req, res) => {
  const lista = notas.filter((n) => n.estudiante === req.params.estudiante).map((n) => n.nota);
  const promedio = calcularPromedio(lista);
  res.json({
    estudiante: req.params.estudiante,
    promedio,
    estado: promedio >= 4 ? 'aprobado' : 'reprobado',
  });
});

// ---- Comunicaciones ----
app.post('/mensajes', (req, res) => {
  const { de, texto } = req.body;
  if (!de || !texto) {
    return res.status(400).json({ error: 'El mensaje necesita remitente y texto' });
  }
  mensajes.push({ de, texto });
  res.status(201).json({ de, texto });
});

app.get('/mensajes', (req, res) => {
  res.json(mensajes);
});

module.exports = { app, calcularPromedio, porcentajeAsistencia };
