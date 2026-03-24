import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CompanyManagerMapping } from '../types';
import { supabase } from '../lib/supabase';

interface MappingContextType {
  mappings: CompanyManagerMapping[];
  loading: boolean;
  addMapping: (data: Omit<CompanyManagerMapping, 'id' | 'createdAt'>) => Promise<boolean>;
  updateMapping: (id: string, data: Partial<Omit<CompanyManagerMapping, 'id' | 'createdAt'>>) => Promise<boolean>;
  removeMapping: (id: string) => Promise<boolean>;
  getMappingByCompany: (companyEmail: string) => CompanyManagerMapping | undefined;
  refreshMappings: () => Promise<void>;
}

const MappingContext = createContext<MappingContextType | null>(null);

export function MappingProvider({ children }: { children: ReactNode }) {
  const [mappings, setMappings] = useState<CompanyManagerMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMappings = useCallback(async () => {
    const { data, error } = await supabase
      .from('company_manager_mapping')
      .select('*')
      .order('created_at');
    if (error) {
      console.error('매칭 조회 실패:', error.message);
      return;
    }
    if (data) {
      setMappings(data.map(row => ({
        id: row.id,
        companyEmail: row.company_email,
        managerName: row.manager_name,
        managerEmail: row.manager_email,
        googleChatWebhook: row.google_chat_webhook,
        createdAt: row.created_at,
      })));
    }
  }, []);

  useEffect(() => {
    refreshMappings().then(() => setLoading(false));
  }, [refreshMappings]);

  const addMapping = async (data: Omit<CompanyManagerMapping, 'id' | 'createdAt'>): Promise<boolean> => {
    const { error } = await supabase
      .from('company_manager_mapping')
      .insert({
        company_email: data.companyEmail,
        manager_name: data.managerName,
        manager_email: data.managerEmail,
        google_chat_webhook: data.googleChatWebhook || null,
      });
    if (error) {
      console.error('매칭 등록 실패:', error.message);
      return false;
    }
    await refreshMappings();
    return true;
  };

  const updateMapping = async (id: string, data: Partial<Omit<CompanyManagerMapping, 'id' | 'createdAt'>>): Promise<boolean> => {
    const updateData: Record<string, unknown> = {};
    if (data.companyEmail !== undefined) updateData.company_email = data.companyEmail;
    if (data.managerName !== undefined) updateData.manager_name = data.managerName;
    if (data.managerEmail !== undefined) updateData.manager_email = data.managerEmail;
    if (data.googleChatWebhook !== undefined) updateData.google_chat_webhook = data.googleChatWebhook || null;

    const { error } = await supabase
      .from('company_manager_mapping')
      .update(updateData)
      .eq('id', id);
    if (error) {
      console.error('매칭 수정 실패:', error.message);
      return false;
    }
    await refreshMappings();
    return true;
  };

  const removeMapping = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('company_manager_mapping')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('매칭 삭제 실패:', error.message);
      return false;
    }
    await refreshMappings();
    return true;
  };

  const getMappingByCompany = (companyEmail: string) =>
    mappings.find(m => m.companyEmail.toLowerCase() === companyEmail.toLowerCase());

  return (
    <MappingContext.Provider value={{
      mappings, loading, addMapping, updateMapping, removeMapping, getMappingByCompany, refreshMappings,
    }}>
      {children}
    </MappingContext.Provider>
  );
}

export function useMapping() {
  const ctx = useContext(MappingContext);
  if (!ctx) throw new Error('useMapping must be used within MappingProvider');
  return ctx;
}
