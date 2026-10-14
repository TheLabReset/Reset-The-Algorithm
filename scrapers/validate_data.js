#!/usr/bin/env node
/**
 * The Algorithm by The Lab - Validador de Datos
 *
 * Valida que los archivos JSON generados por los scrapers
 * tengan la estructura correcta esperada por el frontend.
 *
 * Uso: node validate_data.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schemas de validación
const SCHEMAS = {
  trends: {
    required: ['timestamp', 'source', 'region', 'keywords'],
    keywordFields: ['keyword', 'average_interest', 'trend'],
    validTrends: ['rising', 'stable', 'falling']
  },
  tiktok: {
    required: ['timestamp', 'source', 'region', 'trends'],
    trendsRequired: ['hashtags'],
    hashtagFields: ['hashtag', 'views', 'posts', 'relevanceScore']
  },
  meta: {
    required: ['timestamp', 'source', 'aggregatedTopics'],
    topicFields: ['topic', 'mentions', 'engagement_score']
  },
  ga4: {
    required: ['timestamp', 'source', 'overview'],
    overviewFields: ['totalUsers', 'sessions', 'conversions', 'conversionRate']
  }
};

class ValidationError extends Error {
  constructor(file, field, message) {
    super(`[${file}] ${field}: ${message}`);
    this.file = file;
    this.field = field;
  }
}

async function validateFile(filePath, schema) {
  const fileName = path.basename(filePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const errors = [];

    // Validar campos requeridos
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(new ValidationError(fileName, field, 'Campo requerido faltante'));
      }
    }

    // Validaciones específicas por tipo
    if (schema.keywordFields && data.keywords) {
      data.keywords.forEach((kw, idx) => {
        for (const field of schema.keywordFields) {
          if (!(field in kw)) {
            errors.push(new ValidationError(fileName, `keywords[${idx}].${field}`, 'Campo faltante'));
          }
        }
        if (kw.trend && !schema.validTrends.includes(kw.trend)) {
          errors.push(new ValidationError(fileName, `keywords[${idx}].trend`, `Valor inválido: ${kw.trend}`));
        }
        if (kw.average_interest !== undefined && (kw.average_interest < 0 || kw.average_interest > 100)) {
          errors.push(new ValidationError(fileName, `keywords[${idx}].average_interest`, 'Debe estar entre 0 y 100'));
        }
      });
    }

    if (schema.trendsRequired && data.trends) {
      for (const field of schema.trendsRequired) {
        if (!(field in data.trends)) {
          errors.push(new ValidationError(fileName, `trends.${field}`, 'Campo requerido faltante'));
        }
      }
      if (schema.hashtagFields && data.trends.hashtags) {
        data.trends.hashtags.forEach((tag, idx) => {
          for (const field of schema.hashtagFields) {
            if (!(field in tag)) {
              errors.push(new ValidationError(fileName, `trends.hashtags[${idx}].${field}`, 'Campo faltante'));
            }
          }
          if (tag.relevanceScore !== undefined && (tag.relevanceScore < 0 || tag.relevanceScore > 100)) {
            errors.push(new ValidationError(fileName, `trends.hashtags[${idx}].relevanceScore`, 'Debe estar entre 0 y 100'));
          }
        });
      }
    }

    if (schema.topicFields && data.aggregatedTopics) {
      data.aggregatedTopics.forEach((topic, idx) => {
        for (const field of schema.topicFields) {
          if (!(field in topic)) {
            errors.push(new ValidationError(fileName, `aggregatedTopics[${idx}].${field}`, 'Campo faltante'));
          }
        }
        if (topic.engagement_score !== undefined && (topic.engagement_score < 0 || topic.engagement_score > 10)) {
          errors.push(new ValidationError(fileName, `aggregatedTopics[${idx}].engagement_score`, 'Debe estar entre 0 y 10'));
        }
      });
    }

    if (schema.overviewFields && data.overview) {
      for (const field of schema.overviewFields) {
        if (!(field in data.overview)) {
          errors.push(new ValidationError(fileName, `overview.${field}`, 'Campo faltante'));
        }
      }
    }

    return {
      file: fileName,
      valid: errors.length === 0,
      errors,
      recordCount: getRecordCount(data, schema)
    };

  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        file: fileName,
        valid: false,
        errors: [new ValidationError(fileName, 'file', 'Archivo no encontrado')],
        recordCount: 0
      };
    }
    if (error instanceof SyntaxError) {
      return {
        file: fileName,
        valid: false,
        errors: [new ValidationError(fileName, 'json', 'JSON inválido: ' + error.message)],
        recordCount: 0
      };
    }
    throw error;
  }
}

function getRecordCount(data, schema) {
  if (data.keywords) return data.keywords.length;
  if (data.trends?.hashtags) return data.trends.hashtags.length;
  if (data.aggregatedTopics) return data.aggregatedTopics.length;
  return 0;
}

async function main() {
  console.log('🔍 The Algorithm - Validación de Datos\n');
  console.log('='.repeat(60));

  const dataDir = path.join(__dirname, '../data');

  const filesToValidate = [
    { path: path.join(dataDir, 'trends/latest.json'), schema: SCHEMAS.trends },
    { path: path.join(dataDir, 'tiktok/latest.json'), schema: SCHEMAS.tiktok },
    { path: path.join(dataDir, 'meta/latest.json'), schema: SCHEMAS.meta },
    { path: path.join(dataDir, 'mock/ga4_data.json'), schema: SCHEMAS.ga4 }
  ];

  let allValid = true;
  const results = [];

  for (const { path: filePath, schema } of filesToValidate) {
    const result = await validateFile(filePath, schema);
    results.push(result);

    if (!result.valid) {
      allValid = false;
    }
  }

  // Mostrar resultados
  console.log('\n📊 Resultados de Validación:\n');

  for (const result of results) {
    const status = result.valid ? '✅' : '❌';
    const recordInfo = result.recordCount > 0 ? ` (${result.recordCount} registros)` : '';

    console.log(`${status} ${result.file}${recordInfo}`);

    if (!result.valid) {
      result.errors.forEach(error => {
        console.log(`   ⚠️  ${error.message}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));

  if (allValid) {
    console.log('✅ Todos los archivos son válidos');
    process.exit(0);
  } else {
    console.log('❌ Algunos archivos tienen errores de validación');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
