// ============================================================================
// index.ts (value-objects) — Point d'entree unique des value-objects du domaine
// ----------------------------------------------------------------------------
// Role : re-exporter Temperature, Threshold et leurs types pour permettre un
//        import groupe (import { Temperature, Threshold } from "...value-objects").
// Simplifie et centralise les imports dans le reste de l'application.
// ============================================================================
export { Temperature } from "./Temperature";
export { Threshold, DEFAULT_THRESHOLDS } from "./Threshold";
export type { ThresholdConfig } from "./Threshold";
