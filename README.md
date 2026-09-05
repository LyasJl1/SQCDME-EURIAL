# PilotIQ — SQCDME Thermo

Application React/TypeScript de pilotage quotidien SQCDME pour un atelier de conditionnement.

```bash
npm install
npm run dev
```

Le prototype inclut dashboard, API 15 guidée, historique mensuel, performance de cinq lignes, backlog de 15 problèmes et Kanban de 30 actions. Le modèle PostgreSQL/Supabase se trouve dans `supabase/schema.sql`.

## Persistance Supabase

1. Exécuter `supabase/schema.sql` dans l’éditeur SQL du projet Supabase.
2. Copier `.env.example` vers `.env.local` et renseigner l’URL et la clé publique anon.
3. Relancer l’application. Problèmes, Top 3 et actions sont alors synchronisés avec Supabase.

Sans ces variables, l’application reste utilisable hors ligne et conserve les données dans le `localStorage`. Aucune clé de service ou clé privée ne doit être exposée dans une variable `VITE_*`.
