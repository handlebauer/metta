-- Create user role enum
CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin');

-- Add role column to profiles
ALTER TABLE public.profiles
ADD COLUMN role user_role NOT NULL DEFAULT 'customer';

-- Create index on role for faster lookups
CREATE INDEX profiles_role_idx ON public.profiles(role);

-- Create ticket status enum
CREATE TYPE ticket_status AS ENUM ('new', 'open', 'closed');

-- Create tickets table
CREATE TABLE public.tickets (
  id TEXT PRIMARY KEY DEFAULT gen_ulid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status DEFAULT 'new',
  customer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES public.users(id),
  CONSTRAINT subject_not_empty CHECK (length(trim(subject)) > 0)
);

-- Add updated_at trigger
CREATE TRIGGER set_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Customers can view their own tickets
CREATE POLICY "Customers can view own tickets"
  ON public.tickets
  FOR SELECT
  USING (auth.uid()::text = customer_id);

-- Agents can view all tickets
CREATE POLICY "Agents can view all tickets"
  ON public.tickets
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::text
    AND role = 'agent'
  ));

-- Customers can create tickets
CREATE POLICY "Customers can create tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (auth.uid()::text = customer_id);

-- Agents can update tickets
CREATE POLICY "Agents can update tickets"
  ON public.tickets
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::text
    AND role = 'agent'
  ));

-- Agents can create tickets
CREATE POLICY "Agents can create tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::text
    AND role = 'agent'
  ));

-- Create indexes
CREATE INDEX tickets_customer_id_idx ON public.tickets(customer_id);
CREATE INDEX tickets_agent_id_idx ON public.tickets(agent_id);
CREATE INDEX tickets_status_idx ON public.tickets(status);

