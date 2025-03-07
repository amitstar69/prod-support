
-- Function to get table information
CREATE OR REPLACE FUNCTION public.get_table_info(table_name text)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Get column information
    SELECT jsonb_agg(jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default
    ))
    INTO result
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    ORDER BY ordinal_position;

    -- Add constraint information
    SELECT jsonb_build_object(
        'columns', result,
        'constraints', (
            SELECT jsonb_agg(jsonb_build_object(
                'constraint_name', c.conname,
                'constraint_type', CASE
                    WHEN c.contype = 'p' THEN 'PRIMARY KEY'
                    WHEN c.contype = 'f' THEN 'FOREIGN KEY'
                    WHEN c.contype = 'u' THEN 'UNIQUE'
                    WHEN c.contype = 'c' THEN 'CHECK'
                    ELSE c.contype::text
                END
            ))
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = 'public'
            AND t.relname = $1
        )
    )
    INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add proper permissions
GRANT EXECUTE ON FUNCTION public.get_table_info(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_table_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_info(text) TO service_role;

-- Add the function to the list of available RPC functions in Supabase
DO $$
BEGIN
  -- Add the function to expose it via the Supabase client
  -- This is needed for TypeScript type safety
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'get_table_info'
  ) THEN
    RAISE NOTICE 'Function get_table_info does not exist';
  ELSE
    RAISE NOTICE 'Function get_table_info exists';
  END IF;
END $$;
