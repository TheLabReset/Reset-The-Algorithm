# The Algorithm by Reset

**Social Intelligence Platform - Template para Optimización de Marketing Digital**

![Version](https://img.shields.io/badge/version-1.0.0-7C3AED)
![Status](https://img.shields.io/badge/status-Template-10B981)
![License](https://img.shields.io/badge/license-Proprietary-5B21B6)

---

## Descripcion

**The Algorithm by Reset** es un template de Social Intelligence reutilizable que unifica datos de diversas fuentes digitales para optimizar la inversión publicitaria de cualquier cliente.

Identifica microcomportamientos, emociones e intenciones en el ecosistema digital, optimizando la inversión mediante decisiones automatizadas basadas en señales de data en tiempo real.

### Propuesta de Valor

- **Producto**: The Algorithm by Reset (por Reset Agency)
- **Tipo**: Template reutilizable de Social Intelligence
- **Cliente Demo**: FitZone Perú (cadena de gimnasios ficticia)
- **Objetivo**: Sistema automatizado para optimizar campañas de marketing digital
- **Enfoque**: Leads calificados, alcance geográfico, engagement e interacciones

---

## Las 4 Capas del Algorithm

### 1. **Capa de Datos (Data Layer)**
Monitoreo en tiempo real del ecosistema digital:
- **Google Trends**: Búsquedas relevantes en zonas objetivo
- **TikTok**: Hashtags y contenido viral del sector
- **Meta Platforms**: Insights de Facebook e Instagram
- **YouTube**: Contenido de video y engagement
- **GA4**: Métricas web del cliente

**Métricas**: Búsqueda, Tendencia, Intención, Engagement

### 2. **Capa de Decisión (Decision Layer)**
Inteligencia de mercado y estrategia automática:
- **Opportunity Score**: Índice de oportunidad 0-100
- **Audiencias objetivo**: Segmentos configurables por cliente
- **Mensajes clave**: Recomendaciones de messaging por canal
- **Recomendaciones automáticas** basadas en signals de mercado

**Output**: Qué mensaje activar, en qué momento y en qué plataforma

### 3. **Capa de Ejecución (Execution Layer)**
Distribución inteligente de presupuesto y contenidos:
- **Budget Allocation**: Distribución optimizada por canal (Meta, Google, YouTube, Display)
- **Timing Óptimo**: Horarios y días de mayor rendimiento
- **KPIs por canal**: Conversiones, CPL, Alcance, Engagement

**Output**: Implementación en tiempo real de campañas optimizadas

### 4. **Capa de Optimización (Optimization Layer)**
Performance y ajustes automáticos:
- **KPIs principales**: Conversiones, Alcance total, Interacciones
- **Funnel de conversión**: Alcance → Visitas → Formularios → Conversiones
- **Análisis de competencia**: Share of voice y sentiment vs competidores
- **Sistema de alertas**: Notificaciones cuando CPL supera límites

**Output**: Evaluación continua y redistribución de inversión

---

## Stack Tecnológico

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (tema personalizable por cliente)
- **Recharts** para visualizaciones de datos
- **Lucide React** para iconografía

### Scrapers & Data
- **Node.js 20** con **Apify Client** para scraping automatizado
- **Google Trends**: Via Apify `apify/google-trends-scraper`
- **TikTok**: Via Apify scrapers
- **Meta/Facebook**: Via Apify scrapers
- **Mock Data GA4** para demostración (pendiente integración API real)

### Machine Learning
- **Budget Optimizer**: Multi-Armed Bandit con Thompson Sampling
- **Sentiment Analyzer**: Análisis de sentimiento en español (rule-based)
- **Insight Generator**: Generación automática de insights priorizados
- **Weekly Pipeline**: Pipeline ML automatizado en GitHub Actions

### Infraestructura
- **GitHub** (repositorio + versionado)
- **GitHub Actions** (CI/CD automático - scrapers + ML pipeline semanales)
- **Netlify** (hosting + deploy continuo)

---

## Instalación Rápida

### 1. Clonar repositorio

```bash
git clone https://github.com/alonsix6/Reset-The-Algorithm.git
cd Reset-The-Algorithm
```

### 2. Instalar dependencias

```bash
# Frontend
npm install

# Scrapers (opcional)
cd scrapers
npm install
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### 4. Build para producción

```bash
npm run build
npm run preview
```

---

## Cliente Demo: FitZone

El template viene pre-configurado con **FitZone Perú** como cliente demo (ficticio). Esto incluye:
- Datos mockup de rendimiento en el dashboard
- Keywords y hashtags del sector fitness
- 12 sedes en Lima Metropolitana
- Competidores del sector (Smart Fit, b2, KO Urban, Sportlife)
- Paleta de colores purple/premium

Esto permite ver el sistema funcionando con datos realistas antes de configurar un cliente real.

---

## Arquitectura de Datos - Guía Completa

### IMPORTANTE: Cómo funcionan los datos en este sistema

El sistema usa **2 estrategias diferentes** para cargar datos según el componente:

#### Estrategia 1: Imports estáticos (Build time)
Componentes que cargan datos desde archivos JavaScript:
- **DecisionLayer** → `src/data/mockData.js` + `src/data/config.js`
- **ExecutionLayer** → `src/data/mockData.js` + `src/data/config.js`
- **OptimizationLayer** → `src/data/mockData.js` + `src/data/config.js`
- **Dashboard** → `src/data/config.js`

#### Estrategia 2: Fetch dinámico (Runtime)
Componentes que cargan datos desde archivos JSON:
- **DataLayer** → `public/data/*.json` (cargados con fetch al montar)

### Mapa Completo de Archivos de Datos

```
Reset-The-Algorithm/
├── src/data/                    # Datos importados (build time)
│   ├── config.js               # Configuración global del sistema
│   │   ├── BRAND_CONFIG        # Nombre del producto, cliente, agencia
│   │   ├── LAYER_CONFIG        # Nombres y descripciones de capas
│   │   ├── KEY_MESSAGES        # Mensajes clave del cliente
│   │   ├── TARGET_AUDIENCES    # Audiencias objetivo + CPL targets
│   │   ├── CHANNELS_CONFIG     # Google Search, Meta Ads, YouTube, Display
│   │   ├── CRM_CONFIG          # Thresholds de CPL, alertas
│   │   └── METRIC_CARDS_CONFIG # Cards de KPIs principales
│   │
│   ├── keywords.js             # Keywords y hashtags del cliente
│   │
│   └── mockData.js             # Datos de rendimiento (mockup)
│       ├── OPPORTUNITY_SCORE   # Score 0-100 + componentes + recomendación
│       ├── BUDGET_ALLOCATION   # Presupuesto mensual por canal
│       ├── PERFORMANCE_KPIS    # Leads, conversión, CPL, budget
│       ├── CONTENT_PILLARS     # Pilares de contenido + rendimiento
│       ├── ALERTS              # Alertas automáticas
│       └── COMPETITOR_INSIGHTS # Análisis de competencia
│
├── public/data/                # Datos JSON dinámicos (runtime)
│   ├── trends/
│   │   └── latest.json         # Google Trends - keywords del cliente
│   ├── tiktok/
│   │   └── latest.json         # TikTok - hashtags del sector
│   ├── meta/
│   │   └── latest.json         # Meta - temas con engagement
│   ├── ml/                     # Outputs del ML Pipeline (auto-generado)
│   │   ├── predictions.json    # Predicciones de tendencias y sentimiento
│   │   ├── scores.json         # Scores ML-calculados
│   │   ├── insights.json       # Insights generados priorizados
│   │   └── recommendations.json # Recomendaciones de presupuesto
│   └── mock/
│       └── ga4_data.json       # Google Analytics 4 - métricas web
│
├── ml/                         # Machine Learning Models
│   ├── models/
│   │   ├── budget_optimizer.js # Multi-Armed Bandit (Thompson Sampling)
│   │   └── sentiment_analyzer.js # Análisis de sentimiento español
│   ├── insights/
│   │   └── generator.js        # Generador de insights priorizados
│   ├── pipeline/
│   │   └── weekly_pipeline.js  # Pipeline semanal (GitHub Actions)
│   └── config/
│       └── model_config.json   # Configuración de modelos
│
├── scrapers/                   # Scrapers de datos (Apify)
│   ├── google_trends_apify.js  # Google Trends via Apify
│   ├── tiktok_apify.js         # TikTok via Apify
│   ├── meta_apify.js           # Meta/Facebook via Apify
│   ├── validate_data.js        # Validación de datos scrapeados
│   ├── config/
│   │   ├── example-client.json # Template de configuración de cliente
│   │   ├── fitzone.json        # Config del cliente demo (FitZone)
│   └── package.json            # Dependencias de scrapers
│
└── docs/                       # Documentación adicional
    ├── ML_ARCHITECTURE_PLAN.md # Plan completo de ML
    ├── PRODUCTION_AUDIT.md     # Auditoría para producción
    ├── API_SETUP_GUIDE.md      # Guía paso a paso de APIs
    ├── API_REQUIREMENTS.md     # Requisitos de APIs
    ├── APIFY_SCRAPERS.md       # Documentación de Apify
    └── SCRAPERS_GUIDE.md       # Guía de scrapers
```

### Cómo Editar Datos Mockup

#### ¿Qué necesitas cambiar?

| **Quiero cambiar...**                  | **Archivo a editar**            | **Ruta**                        |
|----------------------------------------|---------------------------------|---------------------------------|
| Nombre del producto / agencia          | `BRAND_CONFIG`                  | `src/data/config.js`            |
| Presupuesto mensual                    | `BUDGET_ALLOCATION`             | `src/data/mockData.js`          |
| CPL por servicio/producto              | Objetos de performance          | `src/data/mockData.js`          |
| Opportunity Score                      | `OPPORTUNITY_SCORE`             | `src/data/mockData.js`          |
| KPIs principales                       | `PERFORMANCE_KPIS`              | `src/data/mockData.js`          |
| Thresholds CPL                         | `CRM_CONFIG.cpl_thresholds`     | `src/data/config.js`            |
| Mensajes clave                         | `KEY_MESSAGES`                  | `src/data/config.js`            |
| Keywords de Google Trends              | `trends/latest.json`            | `public/data/trends/`           |
| Hashtags de TikTok                     | `tiktok/latest.json`            | `public/data/tiktok/`           |
| Temas de Meta                          | `meta/latest.json`              | `public/data/meta/`             |
| Métricas de Google Analytics           | `ga4_data.json`                 | `public/data/mock/`             |
| Configuración de scrapers              | `[cliente].json`                | `scrapers/config/`              |

### Reglas de Edición (CRITICO)

#### 1. **Moneda: TODO en USD ($)**
Todos los valores monetarios deben estar en **dólares estadounidenses**:
- `cpl: 10.40` = $10.40
- `total_budget: 23000` = $23,000

#### 2. **Estructura de OPPORTUNITY_SCORE**
Esta estructura es crítica para DecisionLayer. No alterar la forma:

```javascript
export const OPPORTUNITY_SCORE = {
  current_score: 82,        // Debe ser "current_score" (no "total")
  trend: '+5.2%',           // Debe existir
  components: {             // Debe ser objeto (no array)
    search_interest: {
      score: 85,
      weight: 0.25,         // Decimal (no porcentaje)
      contribution: 21.25,  // Debe existir
    },
    // ... otros componentes
  },
  recommendation: {         // Debe existir
    message: '...',
    confidence: '95%',
    priority: 'high',
  },
};
```

---

## Migración de Mockup a Producción

### **Fase 1: Activar Scrapers Automáticos (OBLIGATORIO)**

1. **Configurar APIFY_TOKEN** en GitHub Secrets:
   - GitHub → Settings → Secrets and variables → Actions
   - New repository secret: `APIFY_TOKEN`

2. **Crear config del cliente** en `scrapers/config/`:
   ```bash
   cp scrapers/config/example-client.json scrapers/config/mi-cliente.json
   # Editar: client, keywords, facebook_pages, etc.
   ```

3. **Actualizar workflow** (`.github/workflows/scrape-data.yml`):
   - Cambiar `--client=fitzone` por `--client=mi-cliente`

4. **Activar GitHub Actions**:
   - GitHub → Settings → Actions → Allow all actions

### **Fase 2: Conectar Google Analytics 4 Real (OPCIONAL)**

> Solo si el cliente tiene GA4 configurado.

1. Crear Service Account en Google Cloud
2. Dar acceso a GA4 con rol "Viewer"
3. Crear función serverless para obtener datos
4. Reemplazar mockData con datos reales

### **Fase 3: Integrar Meta Ads API y Google Ads API (OPCIONAL)**

> Solo si el cliente quiere pausado automático de campañas basado en CPL.

### **Fase 4: Integración CRM (OPCIONAL)**

> Para monitoreo de CPL en tiempo real con HubSpot u otro CRM.

### Testing Antes de Producción

```bash
# 1. Test local con datos mockup
npm run dev

# 2. Test build
npm run build
npm run preview

# 3. Test scrapers
cd scrapers
npm run scrape:all

# 4. Validar datos scrapeados
node scrapers/validate_data.js
```

### Checklist de Producción

**Obligatorio:**
- [ ] Todos los valores en USD ($)
- [ ] CPL targets actualizados
- [ ] OPPORTUNITY_SCORE con estructura correcta
- [ ] Scrapers testeados localmente
- [ ] GitHub Actions activadas
- [ ] APIFY_TOKEN configurado en GitHub Secrets
- [ ] Build exitoso sin errores

**Opcional (según necesidad del cliente):**
- [ ] GA4 Service Account creada
- [ ] Variables de entorno en Netlify
- [ ] Meta Ads API token válido
- [ ] Google Ads API configurada
- [ ] CRM API key configurada

---

## Machine Learning Pipeline

El sistema incluye un pipeline ML completo que se ejecuta semanalmente después del scraping de datos.

### Componentes ML

| Modelo | Descripción | Ubicación |
|--------|-------------|-----------|
| **Sentiment Analyzer** | Análisis de sentimiento en español (rule-based) | `ml/models/sentiment_analyzer.js` |
| **Budget Optimizer** | Multi-Armed Bandit con Thompson Sampling | `ml/models/budget_optimizer.js` |
| **Insight Generator** | Generación automática de insights priorizados | `ml/insights/generator.js` |
| **Weekly Pipeline** | Orquestador del pipeline ML | `ml/pipeline/weekly_pipeline.js` |

### Ejecución del Pipeline

```bash
# El pipeline se ejecuta automáticamente cada lunes via GitHub Actions
# Para ejecutar manualmente:
node ml/pipeline/weekly_pipeline.js
```

Para más detalles técnicos, consulta `docs/ML_ARCHITECTURE_PLAN.md`.

---

## Crear un Nuevo Cliente (Clonar Template)

Para crear un nuevo Algorithm para otro cliente:

```bash
# 1. Clonar el repo template
git clone https://github.com/alonsix6/Reset-The-Algorithm.git NuevoCliente-algorithm
cd NuevoCliente-algorithm

# 2. Cambiar remote a nuevo repo
git remote set-url origin https://github.com/tu-usuario/NuevoCliente-algorithm.git

# 3. Crear archivo de configuración del nuevo cliente
cp scrapers/config/example-client.json scrapers/config/nuevocliente.json
# Editar: client, clientFullName, keywords, facebook_pages, etc.

# 4. Actualizar branding del frontend
# Editar: src/data/config.js → BRAND_CONFIG (name, client, tagline)
# Editar: src/data/keywords.js → Keywords del nuevo sector
# Editar: src/data/mockData.js → Datos iniciales del cliente

# 5. Actualizar workflow
# Editar: .github/workflows/scrape-data.yml → --client=nuevocliente

# 6. Limpiar datos del cliente demo
rm -rf public/data/*/latest.json
rm -rf data/*/

# 7. Configurar secretos en GitHub
# GitHub → Settings → Secrets → APIFY_TOKEN

# 8. Commit inicial
git add .
git commit -m "Configuración inicial para NuevoCliente"
git push -u origin main
```

### Checklist de nuevo cliente

**Obligatorio:**
- [ ] Repo clonado y remote actualizado
- [ ] `scrapers/config/[cliente].json` creado con keywords y páginas
- [ ] `src/data/config.js` actualizado (BRAND_CONFIG)
- [ ] `src/data/keywords.js` actualizado con keywords del sector
- [ ] `APIFY_TOKEN` configurado en GitHub Secrets
- [ ] GitHub Actions habilitado
- [ ] Primer scraping manual ejecutado (workflow_dispatch)

### Costos estimados por cliente

| Servicio | Costo mensual | Notas |
|----------|--------------|-------|
| Apify | ~$10-15 | Depende del volumen de scraping |
| GitHub | $0 | Actions gratuito para repos públicos |
| Netlify | $0 | Tier gratuito suficiente |
| **Total** | **~$10-15/cliente** | Con una cuenta Apify de $49 puedes manejar 3-5 clientes |

---

## Arquitectura de Producción (Apify)

```
┌─────────────────────────────────────────────────────────────────┐
│  Tu Repositorio (GitHub)                                        │
│                                                                 │
│  scrapers/config/           scrapers/                           │
│  └── [cliente].json ───────▶ google_trends_apify.js ───┐        │
│                              tiktok_apify.js     ──────┤        │
│                              meta_apify.js       ──────┘        │
│                                                  │              │
│  .github/workflows/                              │              │
│  └── scrape-data.yml  ◀──────────────────────────┘              │
│       (Semanal)                                                 │
│                                                                 │
│  ml/pipeline/                                                   │
│  └── weekly_pipeline.js  ◀── Ejecutado post-scraping            │
└──────────────────────────────────────────────────│──────────────┘
                                                   │
                          API call con parámetros  │
                                                   ▼
                      ┌─────────────────────────────────────────┐
                      │  Apify Cloud                            │
                      │  ┌─────────────────────────────────┐    │
                      │  │ Actors (scrapers pre-hechos):   │    │
                      │  │ • apify/google-trends-scraper   │    │
                      │  │ • TikTok scraper                │    │
                      │  │ • Meta/Facebook scraper         │    │
                      │  └─────────────────────────────────┘    │
                      └─────────────────────────────────────────┘
                                                   │
                                Resultados JSON    │
                                                   ▼
                      ┌─────────────────────────────────────────┐
                      │  GitHub Actions:                        │
                      │  1. Recibe datos de Apify               │
                      │  2. Ejecuta ML Pipeline                 │
                      │  3. Guarda en public/data/ + data/      │
                      │  4. Commit + Push automático            │
                      │  5. Netlify detecta cambio → Deploy     │
                      └─────────────────────────────────────────┘
```

---

## Troubleshooting

**Error: "APIFY_TOKEN not found"**
- Verificar que el secreto esté configurado en GitHub → Settings → Secrets → Actions

**Error: "Actor not found"**
- Los actors de Apify pueden cambiar de nombre. Verificar en apify.com/store

**Error: "Rate limit exceeded"**
- Reducir maxResults o espaciar ejecuciones en el workflow

**Datos no se actualizan en Netlify**
- Verificar que el commit se haya hecho: `git log -1`
- Verificar en Netlify Dashboard → Deploys

---

## Documentación Adicional

Para información más detallada, consulta los documentos en `/docs/`:
- `ML_ARCHITECTURE_PLAN.md` - Plan completo de arquitectura ML
- `PRODUCTION_AUDIT.md` - Auditoría de producción
- `API_SETUP_GUIDE.md` - Guía paso a paso para configurar APIs
- `SCRAPERS_GUIDE.md` - Guía detallada de scrapers
- `APIFY_SCRAPERS.md` - Documentación de Apify

---

## Licencia

Este proyecto es propiedad de Reset Agency. Todos los derechos reservados.

---

## Contacto

- **Agencia**: Reset Agency
- **Repositorio**: https://github.com/alonsix6/Reset-The-Algorithm

---

**© 2026 The Algorithm by Reset - Reset Agency**
