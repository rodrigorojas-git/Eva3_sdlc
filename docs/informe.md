# Informe - Pipeline CI/CD EduTech Labs

**Ramo:** AUY1102 Ciclo de vida del Software I
**Integrantes:** _Nombre 1_ y _Nombre 2_
**Repositorio:** https://github.com/TU_USUARIO/edutech-labs
**Imagen Docker:** https://hub.docker.com/r/TU_USUARIO/edutech-labs

## 1. Arquitectura implementada

La aplicación es una API hecha en **Node.js con Express**. Tiene tres partes, que son las que pide el caso:
asistencia, evaluaciones (notas) y comunicaciones (mensajes). Los datos se guardan en memoria porque el foco
de la evaluación es el pipeline y no la base de datos.

Herramientas que usamos:

- **GitHub:** repositorio con dos ramas, `main` (producción) y `develop` (desarrollo).
- **GitHub Actions:** ejecuta el pipeline automáticamente.
- **Jest:** pruebas unitarias, con una cobertura mínima del 80%.
- **Docker:** el `Dockerfile` usa `node:22-alpine` porque es una imagen liviana, instala solo las dependencias de producción y ejecuta la app con un usuario que no es root.
- **Docker Hub:** donde se publica la imagen.
- **SonarCloud:** revisa la calidad del código (bugs, code smells, duplicación, cobertura).
- **Snyk:** revisa si las dependencias tienen vulnerabilidades.
- **Docker Scout:** revisa las vulnerabilidades de la imagen Docker.
- **GitHub Advanced Security:** secret scanning, Dependabot y CodeQL.

## 2. Flujo CI/CD

El pipeline se ejecuta cuando se hace **push a `develop`** y cuando se abre un **Pull Request hacia `main`**.

1. **pruebas:** instala dependencias, valida que el código compile (`npm run build`) y corre las pruebas con cobertura. Si la cobertura es menor al 80%, falla.
2. **sonarcloud:** analiza el código y espera el resultado del Quality Gate. Si no pasa, falla.
3. **snyk:** revisa las dependencias y falla si hay vulnerabilidades críticas.
4. **codeql:** revisa el código buscando problemas de seguridad.
5. **docker:** construye la imagen, la analiza con Docker Scout (falla si hay vulnerabilidades críticas) y la publica en Docker Hub.

El job `docker` tiene `needs: [pruebas, sonarcloud, snyk, codeql]`, entonces **si cualquier control falla la imagen no se publica**.
En los Pull Requests la imagen se construye y se analiza, pero no se publica: solo se publica con push a `develop`.

Además protegimos la rama `main` con un ruleset para que no se pueda hacer merge sin que todos los checks estén en verde.

Los tokens (SonarCloud, Snyk y Docker Hub) se guardaron como **Secrets** del repositorio y no en el código.

## 3. Problemas detectados

> Completar con lo que nos salió al ejecutar el pipeline.

| Problema | Dónde lo vimos | Acción correctiva |
|---|---|---|
| Al agregar código sin pruebas la cobertura bajó del 80% | Job `pruebas` (Jest) | Agregar pruebas antes de hacer merge |
| Al agregar una dependencia vulnerable (`ejs@3.1.6`) | Snyk / Dependabot | Actualizar la dependencia a una versión corregida |
| Vulnerabilidades moderadas en dependencias de desarrollo (Jest) | `npm audit` / Snyk | No llegan a la imagen porque instalamos con `--omit=dev`. Esperar la actualización con Dependabot |
| Intentamos subir un token al repo | Push protection de GitHub | El push fue bloqueado, revocamos el token |
| SonarCloud fallaba con "Automatic Analysis is enabled" | Job `sonarcloud` | Desactivamos el análisis automático en SonarCloud |

## 4. Mejoras para futuras iteraciones

- Agregar una base de datos real (por ejemplo PostgreSQL).
- Agregar despliegue automático a un servidor o a la nube (CD), con un ambiente de pruebas y uno de producción.
- Agregar login para docentes y estudiantes.
- Bloquear también las vulnerabilidades altas, no solo las críticas.
- Etiquetar las imágenes con la versión o el commit, no solo `latest`.
- Agregar ESLint para revisar el estilo del código.
