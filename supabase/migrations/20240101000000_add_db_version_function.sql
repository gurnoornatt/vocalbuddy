-- Function to get database version
CREATE OR REPLACE FUNCTION get_db_version()
RETURNS text
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT version();
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_db_version() TO anon, authenticated; 