import { NutritionDetail } from '../types';

// ─── Configuration ────────────────────────────────────────────────────────────
// The API key is loaded from:
// 1. EXPO_PUBLIC_GOOGLE_AI_KEY env var (set in .env.local or Vercel)
// 2. Manual call to setGoogleAIKey() from Settings screen
// ──────────────────────────────────────────────────────────────────────────────

let _apiKey: string | null =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GOOGLE_AI_KEY) || null;

export function setGoogleAIKey(key: string) {
  _apiKey = key;
}

export function getGoogleAIKey(): string | null {
  return _apiKey;
}

export function isAIConfigured(): boolean {
  return _apiKey !== null && _apiKey.length > 0;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIFoodResult {
  title: string;
  description: string;
  amount: string;
  calories: number;
  macros: { carbs: number; protein: number; fat: number };
  type: 'food' | 'exercise';
  healthAnalysis: string;
  nutritionDetail?: NutritionDetail;
}

interface GoogleAIResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

// ─── Prompt Templates ────────────────────────────────────────────────────────

const TEXT_PROMPT = `Eres un nutricionista experto. El usuario te dice que comio o que ejercicio hizo en lenguaje natural.
Analiza el texto y devuelve un JSON array con cada item detectado.

Cada item debe tener esta estructura exacta:
{
  "title": "Nombre del alimento o ejercicio",
  "description": "descripcion breve",
  "amount": "cantidad estimada (ej: 150 g, 1 unidad, 30 min)",
  "calories": numero,
  "type": "food" o "exercise",
  "macros": { "carbs": numero_gramos, "protein": numero_gramos, "fat": numero_gramos },
  "healthAnalysis": "analisis breve de salud en español, 2-3 oraciones",
  "nutritionDetail": {
    "totalCarbs": numero, "fiber": numero, "sugars": numero, "addedSugars": 0, "sugarAlcohols": 0, "netCarbs": numero,
    "protein": numero, "totalFat": numero, "saturatedFat": numero, "transFat": numero,
    "polyunsaturatedFat": numero, "monounsaturatedFat": numero,
    "cholesterol": numero_mg, "sodium": numero_mg, "calcium": numero_mg, "iron": numero_mg,
    "potassium": numero_mg, "vitaminA": numero_IU, "vitaminC": numero_mg, "vitaminD": numero_IU
  }
}

Para ejercicio, los macros deben ser todos 0 y no incluyas nutritionDetail.
Devuelve SOLO el JSON array, sin markdown ni texto extra.

Texto del usuario: `;

const IMAGE_PROMPT = `Eres un nutricionista experto. Analiza esta imagen de comida y devuelve un JSON array con cada alimento que identifiques.

Cada item debe tener esta estructura exacta:
{
  "title": "Nombre del alimento",
  "description": "descripcion breve de lo que ves",
  "amount": "cantidad estimada (ej: 150 g, 1 porcion)",
  "calories": numero,
  "type": "food",
  "macros": { "carbs": numero_gramos, "protein": numero_gramos, "fat": numero_gramos },
  "healthAnalysis": "analisis breve de salud en español, 2-3 oraciones",
  "nutritionDetail": {
    "totalCarbs": numero, "fiber": numero, "sugars": numero, "addedSugars": 0, "sugarAlcohols": 0, "netCarbs": numero,
    "protein": numero, "totalFat": numero, "saturatedFat": numero, "transFat": numero,
    "polyunsaturatedFat": numero, "monounsaturatedFat": numero,
    "cholesterol": numero_mg, "sodium": numero_mg, "calcium": numero_mg, "iron": numero_mg,
    "potassium": numero_mg, "vitaminA": numero_IU, "vitaminC": numero_mg, "vitaminD": numero_IU
  }
}

Devuelve SOLO el JSON array, sin markdown ni texto extra.`;

// ─── API Calls ───────────────────────────────────────────────────────────────

async function callGoogleAI(
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<string> {
  if (!_apiKey) {
    throw new Error('Google AI API key not configured.');
  }

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${_apiKey}`;

  const parts: Array<Record<string, unknown>> = [];

  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      },
    });
  }

  parts.push({ text: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI API error (${response.status}): ${error}`);
  }

  const data: GoogleAIResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Empty response from Google AI');
  }

  return text;
}

function parseAIResponse(text: string): AIFoodResult[] {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(cleaned);
  const items: AIFoodResult[] = Array.isArray(parsed) ? parsed : [parsed];

  return items.map((item) => ({
    title: String(item.title || 'Alimento'),
    description: String(item.description || ''),
    amount: String(item.amount || '1 porcion'),
    calories: Math.max(0, Math.round(Number(item.calories) || 0)),
    type: item.type === 'exercise' ? 'exercise' : 'food',
    macros: {
      carbs: Math.max(0, Math.round(Number(item.macros?.carbs) || 0)),
      protein: Math.max(0, Math.round(Number(item.macros?.protein) || 0)),
      fat: Math.max(0, Math.round(Number(item.macros?.fat) || 0)),
    },
    healthAnalysis: String(item.healthAnalysis || ''),
    nutritionDetail: item.nutritionDetail || undefined,
  }));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function analyzeText(input: string): Promise<AIFoodResult[]> {
  if (!isAIConfigured()) {
    return localEstimate(input);
  }

  try {
    const response = await callGoogleAI(TEXT_PROMPT + input);
    return parseAIResponse(response);
  } catch (error) {
    console.warn('AI text analysis failed, using local estimate:', error);
    return localEstimate(input);
  }
}

export async function analyzeImage(
  base64: string,
  mimeType: string = 'image/jpeg'
): Promise<AIFoodResult[]> {
  if (!isAIConfigured()) {
    return [{
      title: 'Comida detectada por foto',
      description: 'Conecta Google AI para analisis de imagen',
      amount: '1 porcion',
      calories: 300,
      macros: { carbs: 35, protein: 20, fat: 12 },
      type: 'food',
      healthAnalysis: 'Configura tu API key de Google AI para obtener un analisis nutricional preciso de tus fotos.',
    }];
  }

  try {
    const response = await callGoogleAI(IMAGE_PROMPT, base64, mimeType);
    return parseAIResponse(response);
  } catch (error) {
    console.warn('AI image analysis failed:', error);
    return [{
      title: 'Error al analizar imagen',
      description: 'No se pudo procesar la imagen',
      amount: '1 porcion',
      calories: 0,
      macros: { carbs: 0, protein: 0, fat: 0 },
      type: 'food',
      healthAnalysis: 'Hubo un error al analizar la imagen. Intenta de nuevo o describe tu comida por texto.',
    }];
  }
}

// ─── Local Fallback ──────────────────────────────────────────────────────────

const LOCAL_DB: Record<string, Omit<AIFoodResult, 'description'>> = {
  pollo: { title: 'Pechuga de pollo a la plancha', amount: '150 g', calories: 248, macros: { carbs: 0, protein: 46, fat: 5 }, type: 'food', healthAnalysis: 'Excelente fuente de proteina magra, ideal para la reparacion muscular.' },
  carne: { title: 'Carne de res', amount: '100 g', calories: 250, macros: { carbs: 0, protein: 26, fat: 15 }, type: 'food', healthAnalysis: 'Rica en proteina y hierro. Consumir con moderacion por su contenido de grasas saturadas.' },
  arroz: { title: 'Arroz blanco cocido', amount: '150 g', calories: 195, macros: { carbs: 43, protein: 4, fat: 0 }, type: 'food', healthAnalysis: 'Fuente rapida de energia. Preferir version integral para mas fibra.' },
  ensalada: { title: 'Ensalada verde mixta', amount: '200 g', calories: 45, macros: { carbs: 8, protein: 3, fat: 0 }, type: 'food', healthAnalysis: 'Excelente fuente de vitaminas y minerales con muy pocas calorias.' },
  avena: { title: 'Avena con leche', amount: '200 g', calories: 320, macros: { carbs: 58, protein: 10, fat: 6 }, type: 'food', healthAnalysis: 'Rica en fibra soluble. Ayuda a regular el colesterol y mantener saciedad.' },
  huevo: { title: 'Huevo entero', amount: '2 unidades', calories: 155, macros: { carbs: 1, protein: 13, fat: 11 }, type: 'food', healthAnalysis: 'Proteina completa de alta calidad con vitaminas B12 y D.' },
  banana: { title: 'Banana', amount: '1 mediana', calories: 105, macros: { carbs: 27, protein: 1, fat: 0 }, type: 'food', healthAnalysis: 'Rica en potasio y energia rapida. Ideal antes o despues del ejercicio.' },
  salmon: { title: 'Salmon a la parrilla', amount: '150 g', calories: 280, macros: { carbs: 0, protein: 35, fat: 15 }, type: 'food', healthAnalysis: 'Excelente fuente de omega-3 y proteina. Beneficioso para el corazon.' },
  pasta: { title: 'Pasta cocida con salsa', amount: '200 g', calories: 350, macros: { carbs: 62, protein: 12, fat: 5 }, type: 'food', healthAnalysis: 'Buena fuente de carbohidratos complejos. Ideal para energia sostenida.' },
  pan: { title: 'Pan integral', amount: '2 rebanadas', calories: 160, macros: { carbs: 28, protein: 8, fat: 2 }, type: 'food', healthAnalysis: 'Version integral aporta fibra y nutrientes adicionales.' },
  cafe: { title: 'Cafe con leche', amount: '250 ml', calories: 70, macros: { carbs: 8, protein: 4, fat: 2 }, type: 'food', healthAnalysis: 'Moderado en calorias. La cafeina puede mejorar el rendimiento.' },
  yogur: { title: 'Yogur natural', amount: '200 g', calories: 120, macros: { carbs: 15, protein: 8, fat: 3 }, type: 'food', healthAnalysis: 'Rico en probioticos beneficiosos para la salud digestiva.' },
  manzana: { title: 'Manzana', amount: '1 mediana', calories: 95, macros: { carbs: 25, protein: 0, fat: 0 }, type: 'food', healthAnalysis: 'Rica en fibra y antioxidantes. Excelente snack natural.' },
  tostada: { title: 'Tostadas con queso', amount: '2 unidades', calories: 220, macros: { carbs: 24, protein: 10, fat: 9 }, type: 'food', healthAnalysis: 'Combinacion de carbohidratos y proteina. Moderado en grasas.' },
  gimnasio: { title: 'Entrenamiento en gimnasio', amount: '60 min', calories: 350, macros: { carbs: 0, protein: 0, fat: 0 }, type: 'exercise', healthAnalysis: 'Excelente para fuerza muscular y salud cardiovascular.' },
  correr: { title: 'Correr', amount: '30 min', calories: 300, macros: { carbs: 0, protein: 0, fat: 0 }, type: 'exercise', healthAnalysis: 'Gran ejercicio cardiovascular. Quema calorias eficientemente.' },
  caminar: { title: 'Caminata rapida', amount: '30 min', calories: 150, macros: { carbs: 0, protein: 0, fat: 0 }, type: 'exercise', healthAnalysis: 'Ejercicio de bajo impacto ideal para todos los niveles.' },
  bicicleta: { title: 'Bicicleta', amount: '30 min', calories: 250, macros: { carbs: 0, protein: 0, fat: 0 }, type: 'exercise', healthAnalysis: 'Excelente cardio de bajo impacto para piernas y resistencia.' },
  nadar: { title: 'Natacion', amount: '30 min', calories: 280, macros: { carbs: 0, protein: 0, fat: 0 }, type: 'exercise', healthAnalysis: 'Ejercicio de cuerpo completo, excelente para articulaciones.' },
  yoga: { title: 'Yoga', amount: '45 min', calories: 180, macros: { carbs: 0, protein: 0, fat: 0 }, type: 'exercise', healthAnalysis: 'Mejora flexibilidad, equilibrio y reduce estres.' },
};

function localEstimate(input: string): AIFoodResult[] {
  const text = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const results: AIFoodResult[] = [];
  const matched = new Set<string>();

  for (const [key, val] of Object.entries(LOCAL_DB)) {
    if (text.includes(key) && !matched.has(key)) {
      matched.add(key);
      results.push({ ...val, description: input });
    }
  }

  if (results.length === 0) {
    results.push({
      title: input.trim().charAt(0).toUpperCase() + input.trim().slice(1),
      description: input,
      amount: '1 porcion',
      calories: Math.floor(Math.random() * 200 + 150),
      macros: {
        carbs: Math.floor(Math.random() * 30 + 10),
        protein: Math.floor(Math.random() * 20 + 5),
        fat: Math.floor(Math.random() * 15 + 3),
      },
      type: 'food',
      healthAnalysis: 'Valores estimados localmente. Configura Google AI para datos nutricionales precisos.',
    });
  }

  return results;
}
