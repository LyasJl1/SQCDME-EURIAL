# Architecture UX et technique

## Parcours
- **Dashboard** : situation du jour, SQCDME, lignes, Top 3, actions et alertes sur un seul écran.
- **API 15 guidée** : dix étapes, progression et chronomètre, puis compte-rendu.
- **Lignes** : cartes TRS et composantes filtrables par période.
- **Historique** : matrice mensuelle 1–31 avec fiche événement en panneau latéral.
- **Problèmes** : backlog recherchable, filtre stagnant, priorisation et escalade.
- **Actions** : Kanban manipulable par glisser-déposer.
- **Escalades / Analyses / Administration** : décisions, indicateurs management et réglages.

## Architecture
SPA React + TypeScript. `data.ts` fournit le jeu de démonstration et les types. Les composants métier sont regroupés dans `App.tsx`; la persistance cible est Supabase/PostgreSQL via `supabase/schema.sql`. La navigation sans rechargement et les états locaux permettent une démonstration immédiatement interactive.

## Règles métier
Trois rangs prioritaires uniques, propriétaire/action/échéance obligatoires, stagnation paramétrable à trois jours, signalement critique au-delà de sept jours. Le schéma contraint les champs structurants; une fonction RPC transactionnelle est recommandée pour toute repriorisation simultanée.
