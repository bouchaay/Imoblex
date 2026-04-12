-- V6 — Ajout du chemin de dossier sur les documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS folder_path VARCHAR(500);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_path);
