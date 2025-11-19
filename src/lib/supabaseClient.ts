import { createClient } from '@supabase/supabase-js';

// Obtener las credenciales de Supabase desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Faltan las credenciales de Supabase. Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tus variables de entorno.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);