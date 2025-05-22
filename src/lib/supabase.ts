import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables before creating client
const validateConfig = () => {
  const errors = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL não encontrada');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL inválida - deve começar com https://');
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY não encontrada');
  } else if (!supabaseAnonKey.includes('.')) {
    errors.push('VITE_SUPABASE_ANON_KEY inválida - formato JWT incorreto');
  }
  
  if (errors.length > 0) {
    const errorMessage = errors.join('\n');
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

validateConfig();

// Configuração do cliente Supabase com retry e timeout
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: { 
      'apikey': supabaseAnonKey,
      'X-Client-Info': 'supabase-js/2.39.7'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Função para verificar a conexão com retry melhorado
export const checkSupabaseConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      if (error) {
        console.warn(`Tentativa ${i + 1} de ${retries} falhou:`, error);
        
        // Handle specific error cases
        switch (error.code) {
          case 'PGRST301':
            toast.error('Credenciais do Supabase inválidas. Por favor, verifique suas credenciais.');
            return false;
          case '20014':
            toast.error('Erro de acesso ao banco. Por favor, verifique as permissões.');
            return false;
          case '23505':
            toast.error('Conflito de dados. Por favor, tente novamente.');
            return false;
          case 'PGRST116':
            toast.error('Erro de conexão com o banco de dados. Por favor, tente novamente.');
            return false;
          default:
            if (i === retries - 1) {
              toast.error(`Não foi possível conectar ao Supabase: ${error.message}`);
              return false;
            }
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }

      return true;
    } catch (error) {
      console.warn(`Tentativa ${i + 1} de ${retries} falhou:`, error);
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        toast.error('Erro de conexão com a internet. Por favor, verifique sua conexão.');
        return false;
      }
      
      if (i === retries - 1) {
        console.error('Supabase connection error:', error);
        toast.error('Erro de conexão com o Supabase. Por favor, verifique sua conexão.');
        return false;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  return false;
};

// Wrapper para queries com retry automático e backoff exponencial
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries = 3,
  initialDelay = 2000
): Promise<{ data: T | null; error: any }> => {
  for (let i = 0; i < retries; i++) {
    try {
      const isConnected = await checkSupabaseConnection(1, 0);
      if (!isConnected) {
        if (i === retries - 1) {
          return { data: null, error: new Error('Not connected to Supabase') };
        }
        await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
        continue;
      }

      const result = await queryFn();
      if (result.error) {
        console.warn(`Query attempt ${i + 1} of ${retries} failed:`, result.error);
        if (i === retries - 1) {
          return result;
        }
        await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
        continue;
      }

      return result;
    } catch (error) {
      console.warn(`Query attempt ${i + 1} of ${retries} failed:`, error);
      if (i === retries - 1) {
        return { data: null, error };
      }
      await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
    }
  }
  return { data: null, error: new Error('Max retries reached') };
};

// Função para verificar o status da conexão com timeout
export const getConnectionStatus = async () => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    const connectionPromise = supabase.from('profiles').select('count').limit(1);
    
    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]) as any;
    
    if (error) {
      if (error.message?.includes('Failed to fetch')) {
        return {
          isConnected: false,
          error: 'Erro de conexão com a internet. Por favor, verifique sua conexão.'
        };
      }
      
      return {
        isConnected: false,
        error: error.message || 'Erro desconhecido ao conectar com Supabase'
      };
    }
    
    return {
      isConnected: true,
      error: null
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Connection timeout') {
        return {
          isConnected: false,
          error: 'Tempo limite de conexão excedido. Por favor, tente novamente.'
        };
      }
      return {
        isConnected: false,
        error: error.message
      };
    }
    return {
      isConnected: false,
      error: 'Erro desconhecido'
    };
  }
};

export { supabase, checkSupabaseConnection }

export { safeQuery }