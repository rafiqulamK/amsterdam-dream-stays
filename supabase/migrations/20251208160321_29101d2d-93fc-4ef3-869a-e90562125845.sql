-- Update the admin trigger to use the new email domain
CREATE OR REPLACE FUNCTION public.handle_admin_user_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the new user's email is sunjida@hause.ink
  IF NEW.email = 'sunjida@hause.ink' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;