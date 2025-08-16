-- Remove trade_method parameter from rpc_create_session function
-- Since no current scenarios use trade_method, we can simplify the function

-- First, drop all existing versions of the function
DROP FUNCTION IF EXISTS rpc_create_session(text, text, timestamp, text, text);
DROP FUNCTION IF EXISTS rpc_create_session(text, text, date, text, text);
DROP FUNCTION IF EXISTS rpc_create_session(text, text, timestamp, text);
DROP FUNCTION IF EXISTS rpc_create_session(text, text, date, text);

-- Create the new simplified function without trade_method
CREATE OR REPLACE FUNCTION rpc_create_session(
  p_scenario text,
  p_title text,
  p_move_date timestamp DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_session_id uuid;
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Insert session without trade_method
  INSERT INTO lgb_sessions (
    user_id,
    scenario,
    title,
    move_date,
    region,
    status,
    created_at,
    updated_at
  ) VALUES (
    auth.uid(),
    p_scenario,
    p_title,
    p_move_date,
    p_region,
    'active',
    now(),
    now()
  )
  RETURNING session_id INTO new_session_id;
  
  RETURN new_session_id;
END;
$$;