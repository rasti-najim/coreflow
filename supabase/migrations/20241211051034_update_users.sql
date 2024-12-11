-- First drop the existing primary key and auth_user_id column
ALTER TABLE users
DROP CONSTRAINT users_pkey,
DROP COLUMN auth_user_id;

-- Modify the id column to be a non-null primary key referencing auth.users
ALTER TABLE users
ALTER COLUMN id SET NOT NULL,
ADD CONSTRAINT users_pkey PRIMARY KEY (id),
ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
