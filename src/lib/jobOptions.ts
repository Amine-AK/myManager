// ==========================================
// SHARED JOB FORM OPTIONS (used by Quick Job entry & Edit Job)
// ==========================================

import type { JobCategory, AcquisitionSource } from '../types';

export const CATEGORIES: JobCategory[] = [
  'CCTV Installation',
  'IP Camera Installation',
  'Camera Error / Repair',
  'Satellite Dish (Parabole)',
  'Câblage (Network & Cable)',
  'TV Repair',
  'Printer Repair & Maintenance',
  'Informatique (IT & Hardware)',
  'Fiber Sharing (Partage Fibre)'
];

export const DEFAULT_SOURCES: AcquisitionSource[] = [
  'Friend (Recommandation)',
  'Business Card (Carte de visite)',
  'Droguerie (Recommandation)',
  'Mustapha Alliance',
  'Mestour'
];
