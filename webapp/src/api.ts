// Re-export from the new data client so existing imports keep working.
export {
  searchMedicines,
  getMedicineDetail,
  getAlternatives,
  getStats,
  formatPrice,
  isApiConfigured,
} from "./dataClient";
export { uploadPrescription } from "./upload";
