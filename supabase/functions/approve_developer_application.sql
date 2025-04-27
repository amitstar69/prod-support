
CREATE OR REPLACE FUNCTION public.approve_developer_application(
  p_application_id uuid,
  p_developer_id uuid,
  p_request_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the selected developer's application to approved_by_client
  UPDATE help_request_matches
  SET status = 'approved_by_client'
  WHERE id = p_application_id;

  -- Update the help request with the approved developer
  UPDATE help_requests
  SET 
    status = 'approved',
    selected_developer_id = p_developer_id
  WHERE id = p_request_id;

  -- Auto-reject all other pending applications for this request
  UPDATE help_request_matches
  SET status = 'rejected_by_client'
  WHERE request_id = p_request_id 
    AND id != p_application_id 
    AND status = 'pending';
END;
$$;
