# Guía de Scrapers - The Algorithm by The Lab

Esta guía explica cómo funcionan los 3 scrapers de tendencias del proyecto The Algorithm.

---

## Filosofía de los Scrapers

**TODOS los scrapers usan el mismo enfoque:**
- Observación de tendencias públicas
- Independientes de cuentas personales
- Sin necesidad de tokens privados (actualmente)
- Datos curados de fuentes verificables
- Enfocados en las necesidades del cliente configurado

**NO extraen datos de cuentas personales ni requieren autenticación privada.**

---

## 1. Google Trends Scraper

### Descripción
Extrae tendencias de búsqueda para keywords configurados por cliente.

### Tecnología
- **Librería:** `pytrends` (API no oficial de Google Trends)
- **Idioma:** Python 3
- **Requiere Token:** NO

### Datos que proporciona
- Keywords configurados por cliente (ej: admisión, carreras, becas, etc.)
- Interés promedio (0-100)
- Tendencia (rising, stable, falling)
- Crecimiento últimos 30 días
- Regiones top: Lima, Puno, Cusco, Moquegua, Tacna

### Cómo ejecutarlo
```bash
# Instalar dependencias (solo primera vez)
pip3 install pytrends pandas

# Ejecutar scraper
python3 scrapers/google_trends.py
```

### Salida
- `data/trends/latest.json`
- `data/trends/trends_YYYYMMDD_HHMMSS.json`
- `public/data/trends/latest.json` (para frontend)

### Limitaciones
- Google puede bloquear con 403 si hay muchos requests
- Fallback automático a datos curados cuando hay rate limit
- Datos curados basados en observación manual de Google Trends

---

## 2. TikTok Trends Scraper

### Descripción
Curador de tendencias educativas y universitarias en TikTok.

### Tecnología
- **Librería:** Node.js + fs (sin axios necesario)
- **Idioma:** JavaScript (ES Modules)
- **Requiere Token:** NO

### Datos que proporciona
- Hashtags trending (ej: #universidad, #vidauniversitaria, #admision2026)
- Views, posts, growth percentage
- Relevance score (0-100)
- Región (LATAM, Global, Peru)
- Categoría (Education, Career, Location)

### Cómo ejecutarlo
```bash
# Ejecutar scraper
node scrapers/tiktok_scraper.js
```

### Salida
- `data/tiktok/latest.json`
- `data/tiktok/tiktok_YYYYMMDD.json`
- `public/data/tiktok/latest.json` (para frontend)

### Método de curación
Los datos son curados semanalmente basándose en:
- TikTok Creative Center público
- Observación de hashtags educativos populares
- Análisis de engagement visible
- Tendencias en región Perú y LATAM

**NO usa API de TikTok ni acceso a cuentas privadas.**

---

## 3. Meta/Facebook Public Trends Scraper

### Descripción
Curador de tendencias en Facebook/Instagram público para el cliente configurado.

### Tecnología
- **Librería:** Node.js + fs
- **Idioma:** JavaScript (ES Modules)
- **Requiere Token:** NO

### Datos que proporciona
- Topics educativos con engagement scores
- Menciones, crecimiento, sentiment
- Top brands/entidades por categoría
- Métricas de engagement (reactions, comments, shares)
- Análisis de grupos públicos relevantes al cliente

### Cómo ejecutarlo
```bash
# Ejecutar scraper
node scrapers/meta_scraper.js
```

### Salida
- `data/meta/latest.json`
- `data/meta/meta_YYYYMMDD.json`
- `public/data/meta/latest.json` (para frontend)

### Fuentes de observación
**Páginas públicas monitoreadas:**
- Configuradas por cliente en `scrapers/config/[cliente].json`

**Grupos públicos monitoreados:**
- Configurados por cliente en `scrapers/config/[cliente].json`

**Instagram público:**
- Hashtags configurados por cliente

### Método de curación
Actualización semanal (cada lunes 8 AM Perú) basada en:
- Análisis de posts públicos de páginas oficiales
- Engagement observable (reactions, comments, shares)
- Tendencias en grupos públicos de postulantes
- Hashtags de Instagram público

**NO usa Meta Graph API ni acceso a cuentas personales.**

---

## Ejecutar Todos los Scrapers

### Opción 1: Uno por uno
```bash
python3 scrapers/google_trends.py
node scrapers/tiktok_scraper.js
node scrapers/meta_scraper.js
```

### Opción 2: Automatización con GitHub Actions
El workflow `.github/workflows/scrape-data.yml` ejecuta todos los scrapers automáticamente cada lunes a las 8 AM (hora de Perú).

Para ejecutar manualmente:
1. Ir a GitHub → Actions → "The Algorithm - Weekly Data Scrape"
2. Click "Run workflow"

---

## Estructura de Datos

### Google Trends (`data/trends/latest.json`)
```json
{
  "timestamp": "2025-12-04T22:54:58",
  "region": "PE",
  "category": "Education",
  "source": "Google Trends",
  "client": "Cliente de ejemplo",
  "keywords": [
    {
      "keyword": "keyword de ejemplo",
      "average_interest": 85,
      "trend": "rising",
      "peak_score": 100,
      "growth_3m": "+145%",
      "top_regions": {
        "Lima": 100,
        "Puno": 65,
        "Cusco": 48
      }
    }
  ]
}
```

### TikTok (`data/tiktok/latest.json`)
```json
{
  "timestamp": "2025-12-04T22:55:00Z",
  "source": "TikTok Creative Center",
  "region": "PE",
  "category": "Education",
  "client": "Cliente de ejemplo",
  "trends": {
    "hashtags": [
      {
        "hashtag": "#marca",
        "views": "2.8M",
        "posts": "1.2K",
        "growth": "+95%",
        "relevanceScore": 100,
        "region": "Peru",
        "category": "MARCA"
      }
    ]
  }
}
```

### Meta (`data/meta/latest.json`)
```json
{
  "timestamp": "2025-12-04T22:55:00Z",
  "source": "Meta/Facebook Public Trends",
  "region": "Peru",
  "category": "Education",
  "client": "Cliente de ejemplo",
  "aggregatedTopics": [
    {
      "topic": "Tema de ejemplo",
      "mentions": 2850,
      "engagement_score": 9.5,
      "growth": "+125%",
      "sentiment": "very positive",
      "top_brands": ["MARCA"],
      "avg_reactions": 580,
      "avg_comments": 125,
      "avg_shares": 185
    }
  ]
}
```

---

## Troubleshooting

### Google Trends da error 403
**Causa:** Rate limit de Google
**Solución:** El scraper usa fallback automático a datos curados. Espera 1-2 horas y vuelve a intentar.

### pytrends no está instalado
**Causa:** Dependencias no instaladas
**Solución:**
```bash
pip3 install pytrends pandas
```

### Node scrapers no funcionan
**Causa:** Error de sintaxis o permisos
**Solución:**
```bash
cd scrapers
node --version  # Verificar Node 18+
node tiktok_scraper.js
```

### Datos no se actualizan en dashboard
**Causa:** Cache del navegador o Netlify
**Solución:**
```bash
# Forzar rebuild en Netlify o local
npm run build
```

---

## Validación de Datos

Todos los scrapers guardan sus datos en JSON. Para verificar que funcionan:

```bash
# Ver última actualización de cada fuente
ls -lh data/trends/latest.json
ls -lh data/tiktok/latest.json
ls -lh data/meta/latest.json

# Ver contenido resumido (requiere jq)
cat data/trends/latest.json | jq '.keywords[] | {keyword, average_interest, trend}'
cat data/tiktok/latest.json | jq '.trends.hashtags[] | {hashtag, relevanceScore, growth}'
cat data/meta/latest.json | jq '.aggregatedTopics[] | {topic, engagement_score, growth}'
```

---

## Mejores Prácticas

1. **Ejecuta los scrapers semanalmente** (cada lunes automáticamente)
2. **No ejecutes más de 1 vez por día** Google Trends (evitar rate limit)
3. **Revisa los datos generados** antes de commitear
4. **Los datos curados son válidos** para demos y presentaciones
5. **Para datos en tiempo real** considera Apify ($49/mes)

---

## Roadmap - Automatización con Apify

### Cuando se active Apify ($49/mes):
- [ ] Reemplazar datos curados con scraping real de Google Trends
- [ ] Integrar TikTok Scraper de Apify para hashtags en tiempo real
- [ ] Integrar Facebook Pages Scraper para métricas reales
- [ ] Dashboard de actualización automática semanal
- [ ] Alertas cuando un topic crece >50% en 7 días

---

**¿Preguntas?** Revisa el código de cada scraper - está documentado con comentarios en español.
