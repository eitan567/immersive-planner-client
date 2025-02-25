import { dbOperation } from '../../../lib/supabase-client.ts';

interface MaterialsCreateData {
  title: string;
  content: string;
}

interface MaterialsUpdateData {
  title?: string;
  content?: string;
}

export const materialsService = {
  async createMaterial(material: MaterialsCreateData) {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('materials')
        .insert([material])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create material');
      return data;
    });
  },

  async updateMaterial(id: string, updates: MaterialsUpdateData) {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update material');
      return data;
    });
  },

  async getMaterial(id: string) {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    });
  }
};
