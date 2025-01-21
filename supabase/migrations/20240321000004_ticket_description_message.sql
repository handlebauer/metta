-- Create a trigger function to create a message from ticket description
CREATE OR REPLACE FUNCTION public.handle_ticket_description()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create a message if description is not empty
    IF NEW.description IS NOT NULL AND LENGTH(TRIM(NEW.description)) > 0 THEN
        INSERT INTO messages (
            ticket_id,
            content,
            html_content,
            user_id,
            role
        ) VALUES (
            NEW.id,
            NEW.description,
            NEW.description,
            NEW.customer_id,
            'customer'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to the tickets table
CREATE TRIGGER create_description_message
    AFTER INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_ticket_description();
