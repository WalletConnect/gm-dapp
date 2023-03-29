CREATE TABLE gm_users (
    id UUID NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    account varchar(255) NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
