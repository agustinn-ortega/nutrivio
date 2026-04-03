import { FoodEntry, NutritionDetail, Reminder, DaySummary } from '../types';

const today = new Date().toISOString().split('T')[0];

export const sampleNutrition: NutritionDetail = {
  totalCarbs: 0,
  fiber: 0,
  sugars: 0,
  addedSugars: 0,
  sugarAlcohols: 0,
  netCarbs: 0,
  protein: 26,
  totalFat: 15,
  saturatedFat: 6,
  transFat: 0.5,
  polyunsaturatedFat: 0.5,
  monounsaturatedFat: 7,
  cholesterol: 80,
  sodium: 60,
  calcium: 15,
  iron: 2.6,
  potassium: 350,
  vitaminA: 40,
  vitaminC: 0,
  vitaminD: 7,
};

export const mockEntries: FoodEntry[] = [
  {
    id: '1',
    title: 'Pechuga de pollo a la plancha',
    description: 'pechuga de pollo, ensalada',
    amount: '150 g',
    calories: 248,
    macros: { carbs: 0, protein: 46, fat: 5 },
    time: '13:20',
    date: today,
    type: 'food',
    healthAnalysis:
      'La pechuga de pollo es una fuente magra de proteina de alta calidad, ideal para la reparacion muscular. Baja en grasas saturadas y versatil en preparaciones saludables.',
    nutritionDetail: {
      ...sampleNutrition,
      protein: 46,
      totalFat: 5,
      saturatedFat: 1.4,
      transFat: 0,
      polyunsaturatedFat: 1,
      monounsaturatedFat: 1.8,
      cholesterol: 110,
      sodium: 85,
      iron: 0.9,
      potassium: 450,
    },
  },
  {
    id: '2',
    title: 'Avena con banana y miel',
    description: 'desayuno, avena integral',
    amount: '200 g',
    calories: 320,
    macros: { carbs: 58, protein: 10, fat: 6 },
    time: '08:30',
    date: today,
    type: 'food',
    healthAnalysis:
      'La avena es rica en fibra soluble, que ayuda a regular el colesterol y mantener la saciedad. Combinada con banana aporta potasio y energia sostenida.',
    nutritionDetail: {
      ...sampleNutrition,
      totalCarbs: 58,
      fiber: 5,
      sugars: 18,
      netCarbs: 53,
      protein: 10,
      totalFat: 6,
      saturatedFat: 1,
      monounsaturatedFat: 2,
      potassium: 420,
    },
  },
  {
    id: '3',
    title: 'Caminata rapida',
    description: '30 min, ritmo moderado',
    amount: '30 min',
    calories: 150,
    macros: { carbs: 0, protein: 0, fat: 0 },
    time: '07:00',
    date: today,
    type: 'exercise',
  },
];

export const mockEntriesEmpty: FoodEntry[] = [];

export const defaultReminders: Reminder[] = [
  { id: 'morning', label: 'Manana', time: '09:00', enabled: false },
  { id: 'afternoon', label: 'Tarde', time: '13:00', enabled: false },
  { id: 'night', label: 'Noche', time: '19:00', enabled: false },
];

export const mockWeeklySummary: DaySummary[] = (() => {
  const days: DaySummary[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isPast = d <= now;
    days.push({
      date: dateStr,
      calories: {
        food: isPast && i < 4 ? Math.floor(Math.random() * 600 + 1500) : 0,
        exercise: isPast && i < 4 ? Math.floor(Math.random() * 200 + 100) : 0,
      },
      macros: {
        carbs: isPast && i < 4 ? Math.floor(Math.random() * 80 + 150) : 0,
        protein: isPast && i < 4 ? Math.floor(Math.random() * 40 + 80) : 0,
        fat: isPast && i < 4 ? Math.floor(Math.random() * 20 + 40) : 0,
      },
    });
  }
  return days;
})();

export const quickSuggestions = [
  { label: 'Ensalada verde con pechuga de pollo a la parrilla', icon: '🥗' },
  { label: 'Salmon a la parrilla con brocoli y arroz', icon: '🐟' },
  { label: 'Bowl de acai con granola y frutas', icon: '🫐' },
  { label: 'Omelette de claras con espinaca', icon: '🥚' },
];

export const premiumBenefits = [
  'Registros ilimitados',
  'Sin anuncios',
  'Analisis de salud con IA',
  'Exportar datos',
  'Estadisticas avanzadas',
  'Soporte prioritario',
];
