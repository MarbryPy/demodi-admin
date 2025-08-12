import { createClient } from '@supabase/supabase-js';
import type { InsertCarte, Carte } from "@shared/schema";

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export class SupabaseStorage {
  async createCarte(insertCarte: InsertCarte): Promise<Carte> {
    const { data, error } = await supabase
      .from('cartes')
      .insert(insertCarte)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create carte: ${error.message}`);
    }
    
    return data as Carte;
  }

  async getRecentCartes(limit: number = 5): Promise<Carte[]> {
    const { data, error } = await supabase
      .from('cartes')
      .select('*')
      .order('cree_a', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to fetch cartes: ${error.message}`);
    }
    
    return data as Carte[];
  }

  async getAllCartes(): Promise<Carte[]> {
    const { data, error } = await supabase
      .from('cartes')
      .select('*')
      .order('cree_a', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch cartes: ${error.message}`);
    }
    
    return data as Carte[];
  }

  async getCarteById(id: string): Promise<Carte | undefined> {
    const { data, error } = await supabase
      .from('cartes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined; // Not found
      }
      throw new Error(`Failed to fetch carte: ${error.message}`);
    }
    
    return data as Carte;
  }
}

export const supabaseStorage = new SupabaseStorage();