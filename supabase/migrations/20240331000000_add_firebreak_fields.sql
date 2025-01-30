alter table tickets
    add column parent_ticket_id text references tickets(id),
    add column crisis_keywords text[],
    add column chaos_score integer check (chaos_score >= 0 and chaos_score <= 100);

-- Add an index to help with parent ticket lookups
create index tickets_parent_ticket_id_idx on tickets(parent_ticket_id);

-- Add an index to help with crisis keyword searches
create index tickets_crisis_keywords_idx on tickets using gin(crisis_keywords);
