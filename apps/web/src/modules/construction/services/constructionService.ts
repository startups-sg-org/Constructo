import { apiClient } from '../../../shared/services/api';

export interface ConstructionWork {
  id: string;
  name: string;
  builderId: string;
  status: 'planned' | 'in_progress' | 'delayed' | 'completed';
  progressPercentage: number;
  updatedAt: string;
}

export const constructionService = {
  async getAll(): Promise<ConstructionWork[]> {
    try {
      return await apiClient<ConstructionWork[]>('/works/');
    } catch {
      // Mock de fallback para desenvolvimento local desacoplado da API
      return [
        {
          id: '1',
          name: 'Residencial Palmas Prime',
          builderId: 'builder-1',
          status: 'in_progress',
          progressPercentage: 42,
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getById(id: string): Promise<ConstructionWork> {
    return apiClient<ConstructionWork>(`/works/${id}/`);
  },

  async create(data: Omit<ConstructionWork, 'id' | 'updatedAt'>): Promise<ConstructionWork> {
    return apiClient<ConstructionWork>('/works/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};