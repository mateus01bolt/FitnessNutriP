import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  toast.error('Por favor, conecte ao Supabase primeiro');
  throw new Error('Missing Supabase environment variables');
}

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
    headers: { 'apikey': supabaseAnonKey }
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
      if (!supabaseUrl || !supabaseAnonKey) {
        toast.error('Por favor, conecte ao Supabase primeiro');
        return false;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      if (error) {
        console.warn(`Tentativa ${i + 1} de ${retries} falhou:`, error);
        
        // Show different messages based on error type
        if (error.code === '503') {
          toast.error('Servidor Supabase temporariamente indisponível. Tentando reconectar...');
        } else if (error.code === 'NETWORK_ERROR') {
          toast.error('Erro de conexão. Verificando sua conexão com a internet...');
        } else if (error.message?.includes('upstream connect error')) {
          toast.error('Problema de conexão com o servidor. Tentando reconectar...');
        }

        if (i === retries - 1) {
          toast.error('Não foi possível conectar ao Supabase. Por favor, tente novamente mais tarde.');
          return false;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }

      return true;
    } catch (error) {
      console.warn(`Tentativa ${i + 1} de ${retries} falhou:`, error);
      
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
    
    return {
      isConnected: !error,
      error: error ? error.message : null
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};