-- V3 - Ajout du champ username pour login (remplace email comme identifiant de connexion)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Valeur par défaut temporaire = partie locale de l'email
UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;

-- Rendre unique et non null après peuplement
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

CREATE INDEX idx_users_username ON users(username);

-- Mise à jour des rôles existants
UPDATE users SET role = 'ADMIN' WHERE role IN ('ADMIN', 'MANAGER');
UPDATE users SET role = 'USER'  WHERE role IN ('AGENT', 'ASSISTANT');
