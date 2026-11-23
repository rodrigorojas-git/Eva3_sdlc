# EduTech Labs - Pipeline CI/CD

Evaluación Parcial 3 - AUY1102 Ciclo de vida del Software I

Integrantes: _Nombre 1_ y _Nombre 2_

## Descripción

API simple para la plataforma de EduTech Labs, que permite registrar **asistencia**, **notas** y **mensajes**
entre docentes y estudiantes. Sobre esta API armamos un pipeline con GitHub Actions que compila, prueba,
revisa la calidad y la seguridad, y publica la imagen en Docker Hub.

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | Revisa que la API esté arriba |
| POST | `/asistencia` | Registra asistencia `{ estudiante, fecha, presente }` |
| GET | `/asistencia/:estudiante` | Porcentaje de asistencia |
| POST | `/notas` | Registra una nota `{ estudiante, nota }` (1.0 a 7.0) |
| GET | `/notas/:estudiante` | Promedio y si aprueba o reprueba |
| POST | `/mensajes` | Publica un mensaje `{ de, texto }` |
| GET | `/mensajes` | Lista los mensajes |

## Cómo ejecutarlo

```bash
npm install
npm test        # pruebas + cobertura
npm start       # http://localhost:3000

docker build -t edutech-labs .
docker run -p 3000:3000 edutech-labs
```

## Pipeline

Archivo: `.github/workflows/ci.yml`

```
pruebas ──┬── sonarcloud ──┐
          └── snyk ────────┼── docker (build + Scout + push)
codeql ────────────────────┘
```

Más detalle en [`docs/informe.md`](docs/informe.md).
