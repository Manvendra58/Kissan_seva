import { cropTypes } from './indianStates';

export const getDefaultCropData = (name: string) => {
  const baseDesc = `${name} cultivation guide. Includes soil preparation, fertilizers, pest control, and modern techniques.`;
  const seasons: Record<string, string> = {
    Rice: 'Kharif', Wheat: 'Rabi', Maize: 'Kharif', Sugarcane: 'Year-round',
    Cotton: 'Kharif', Soybean: 'Kharif', Groundnut: 'Kharif', Pulses: 'Rabi',
    Vegetables: 'Year-round', Fruits: 'Year-round', Spices: 'Year-round',
    Tea: 'Year-round', Coffee: 'Year-round', Rubber: 'Year-round',
    Jute: 'Kharif', Oilseeds: 'Rabi', Millets: 'Kharif', Other: 'Year-round',
  };
  return {
    id: `default-${name.toLowerCase().replace(/\s/g, '-')}`,
    name,
    category: name,
    description: baseDesc,
    soil_preparation: 'Prepare well-drained soil with proper tillage.',
    fertilizers: 'Apply NPK as per soil test recommendations.',
    pesticides: 'Follow IPM practices. Use approved pesticides only when needed.',
    organic_methods: 'Crop rotation, organic manure, and bio-pesticides.',
    modern_techniques: 'Precision farming and drip irrigation for better yield.',
    season: seasons[name] || 'Year-round',
    image_url: null,
  };
};

export const getAllDefaultCrops = () =>
  cropTypes.map((name) => getDefaultCropData(name));
