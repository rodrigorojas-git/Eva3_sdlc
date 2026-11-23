const request = require('supertest');
const { app, calcularPromedio, porcentajeAsistencia } = require('../src/app');

describe('Funciones de cálculo', () => {
  test('calcula el promedio de notas', () => {
    expect(calcularPromedio([5, 6, 7])).toBe(6);
    expect(calcularPromedio([])).toBe(0);
  });

  test('calcula el porcentaje de asistencia', () => {
    expect(porcentajeAsistencia([{ presente: true }, { presente: false }])).toBe(50);
    expect(porcentajeAsistencia([])).toBe(0);
  });
});

describe('Endpoints generales', () => {
  test('GET / responde', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
  });
});

describe('Asistencia', () => {
  test('registra asistencia y calcula porcentaje', async () => {
    await request(app).post('/asistencia').send({ estudiante: 'ana', fecha: '2026-11-20', presente: true });
    await request(app).post('/asistencia').send({ estudiante: 'ana', fecha: '2026-11-21', presente: false });
    const res = await request(app).get('/asistencia/ana');
    expect(res.body.porcentaje).toBe(50);
  });

  test('rechaza asistencia sin datos', async () => {
    const res = await request(app).post('/asistencia').send({});
    expect(res.status).toBe(400);
  });
});

describe('Notas', () => {
  test('registra notas y muestra estado aprobado', async () => {
    await request(app).post('/notas').send({ estudiante: 'pedro', nota: 6 });
    await request(app).post('/notas').send({ estudiante: 'pedro', nota: 5 });
    const res = await request(app).get('/notas/pedro');
    expect(res.body.promedio).toBe(5.5);
    expect(res.body.estado).toBe('aprobado');
  });

  test('muestra estado reprobado', async () => {
    await request(app).post('/notas').send({ estudiante: 'luis', nota: 3 });
    const res = await request(app).get('/notas/luis');
    expect(res.body.estado).toBe('reprobado');
  });

  test('rechaza nota fuera de rango', async () => {
    const res = await request(app).post('/notas').send({ estudiante: 'pedro', nota: 8 });
    expect(res.status).toBe(400);
  });
});

describe('Mensajes', () => {
  test('publica y lista mensajes', async () => {
    const creado = await request(app).post('/mensajes').send({ de: 'profe', texto: 'Mañana hay prueba' });
    expect(creado.status).toBe(201);
    const res = await request(app).get('/mensajes');
    expect(res.body.length).toBe(1);
  });

  test('rechaza mensaje vacío', async () => {
    const res = await request(app).post('/mensajes').send({ de: 'profe' });
    expect(res.status).toBe(400);
  });
});
