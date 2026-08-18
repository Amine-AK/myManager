import { describe, it, expect } from 'vitest';
import { calculateAcquisitionSummaries } from '../acquisition';
import type { Job } from '../../../types';

describe('Acquisition Funnel Analytics Engine', () => {
  it('correctly groups revenue and collected cash by lead source', () => {
    const mockJobs: Job[] = [
      {
        id: 'j-1',
        title: 'CCTV Installation',
        clientName: 'Karim',
        category: 'CCTV Installation',
        status: 'paid',
        agreedPrice: 2000,
        paidAmount: 2000,
        materialCosts: 800,
        startDate: '2026-08-01',
        acquisitionSource: 'Droguerie (Recommandation)'
      },
      {
        id: 'j-2',
        title: 'Fiber Sharing Router',
        clientName: 'Amine',
        category: 'Fiber Sharing (Partage Fibre)',
        status: 'paid',
        agreedPrice: 1500,
        paidAmount: 1500,
        materialCosts: 400,
        startDate: '2026-08-05',
        acquisitionSource: 'Droguerie (Recommandation)'
      },
      {
        id: 'j-3',
        title: 'Satellite Dish Parabole',
        clientName: 'Rachid',
        category: 'Satellite Dish (Parabole)',
        status: 'completed',
        agreedPrice: 800,
        paidAmount: 500,
        materialCosts: 200,
        startDate: '2026-08-10',
        acquisitionSource: 'Mustapha Alliance'
      }
    ];

    const summaries = calculateAcquisitionSummaries(mockJobs);

    // Droguerie should be top channel with 2 jobs and 3500 MAD collected
    expect(summaries[0].source).toBe('Droguerie (Recommandation)');
    expect(summaries[0].jobCount).toBe(2);
    expect(summaries[0].totalCollected).toBe(3500);

    // Mustapha Alliance should have 1 job and 500 MAD collected
    expect(summaries[1].source).toBe('Mustapha Alliance');
    expect(summaries[1].jobCount).toBe(1);
    expect(summaries[1].totalCollected).toBe(500);
  });
});
