/**
 * Tiny i18n module. English and Bangla, no external library.
 *
 * Brand names and generic names are NEVER translated — only UI labels.
 * This is a deliberate medical-app convention.
 */

export type Lang = "en" | "bn";

export interface Strings {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  searchPlaceholderShort: string;
  searchEmpty: string;
  searchLoading: string;
  searchNoResults: string;
  searchError: string;
  retry: string;

  configureMedicine: string;
  selectMedicine: string;
  modePrescription: string;
  modeQuantity: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: string;
  perDay: string;
  days: string;
  units: string;
  frequencyPerDay: string;

  addToList: string;
  updateInList: string;
  cancel: string;

  dailyQuantity: string;
  totalRequired: string;
  purchaseQuantity: string;
  estimatedCost: string;
  packInfo: string;
  perPack: string;
  perUnit: string;
  packUnavailable: string;

  cart: string;
  cartEmpty: string;
  cartEmptyHint: string;
  cartEmptyCta: string;
  cartItems: (n: number) => string;
  cartTotal: string;
  cartMedicines: string;
  cartUnits: string;
  cartPacks: string;
  cartSubtotal: string;
  cartEstimatedTotal: string;

  edit: string;
  remove: string;
  view: string;
  viewSummary: string;
  clearCart: string;
  clearCartConfirm: string;

  addedToast: (name: string) => string;
  removedToast: (name: string) => string;
  updatedToast: (name: string) => string;
  clearedToast: string;
  undo: string;

  summaryTitle: string;
  printDate: (d: string) => string;
  printTableMedicine: string;
  printTableDose: string;
  printTableFrequency: string;
  printTableDuration: string;
  printTableRequired: string;
  printTableCost: string;
  printTotal: string;
  printDisclaimer: string;

  print: string;
  downloadPdf: string;
  copy: string;
  share: string;
  shareTitle: string;
  copied: string;
  shared: string;
  shareUnavailable: string;

  prescription: string;
  prescriptionTitle: string;
  prescriptionDesc: string;
  prescriptionUpload: string;
  prescriptionAnalyzing: string;
  prescriptionNotConfigured: string;
  prescriptionAddAll: string;
  prescriptionResultTitle: string;

  medicalDisclaimer: string;

  errorLoadPrices: string;
  language: string;
  loadingMedicine: string;
  notFoundTitle: string;
  notFoundDesc: string;
  backToHome: string;
  pageNotFound: string;
}

const en: Strings = {
  appName: "BD Medicine Price",
  tagline: "Calculate your medicine cost in seconds",
  searchPlaceholder: "Search Napa, Paracetamol, Sergel...",
  searchPlaceholderShort: "Search medicine",
  searchEmpty: "Start typing to search medicines",
  searchLoading: "Searching…",
  searchNoResults: "No medicines found",
  searchError: "Unable to load medicines. Check your connection and try again.",
  retry: "Try again",

  configureMedicine: "Configure medicine",
  selectMedicine: "Select a medicine to start",
  modePrescription: "Prescription",
  modeQuantity: "Quantity",
  dose: "Dose",
  frequency: "Frequency",
  duration: "Duration",
  quantity: "Quantity",
  perDay: "times per day",
  days: "days",
  units: "units",
  frequencyPerDay: "/ day",

  addToList: "Add to medicine list",
  updateInList: "Update medicine",
  cancel: "Cancel",

  dailyQuantity: "Daily",
  totalRequired: "Required",
  purchaseQuantity: "Purchase",
  estimatedCost: "Cost",
  packInfo: "Pack",
  perPack: "per pack",
  perUnit: "per unit",
  packUnavailable: "Pack information unavailable — calculated using unit price.",

  cart: "Medicine list",
  cartEmpty: "Your medicine list is empty.",
  cartEmptyHint: "Search for a medicine above to start calculating your cost.",
  cartEmptyCta: "Search medicine",
  cartItems: (n: number) => `${n} ${n === 1 ? "medicine" : "medicines"}`,
  cartTotal: "Total",
  cartMedicines: "Medicines",
  cartUnits: "Required units",
  cartPacks: "Purchase packs",
  cartSubtotal: "Subtotal",
  cartEstimatedTotal: "Estimated total",

  edit: "Edit",
  remove: "Remove",
  view: "View",
  viewSummary: "View summary",
  clearCart: "Clear list",
  clearCartConfirm: "Remove all medicines from your list?",

  addedToast: (name: string) => `✓ ${name} added`,
  removedToast: (name: string) => `${name} removed`,
  updatedToast: (name: string) => `✓ ${name} updated`,
  clearedToast: "Medicine list cleared",
  undo: "Undo",

  summaryTitle: "Medicine Cost Estimate",
  printDate: (d: string) => `Date: ${d}`,
  printTableMedicine: "Medicine",
  printTableDose: "Dose",
  printTableFrequency: "Frequency",
  printTableDuration: "Duration",
  printTableRequired: "Required qty",
  printTableCost: "Cost",
  printTotal: "Total",
  printDisclaimer:
    "Prices are indicative and may change. Verify the MRP printed on the medicine package.",

  print: "Print",
  downloadPdf: "Download PDF",
  copy: "Copy",
  share: "Share",
  shareTitle: "Medicine Cost Estimate",
  copied: "Copied to clipboard",
  shared: "Shared",
  shareUnavailable: "Sharing not supported on this device",

  prescription: "Prescription",
  prescriptionTitle: "Scan a prescription",
  prescriptionDesc:
    "Upload a photo of a handwritten prescription. We'll try to read the medicine names and add them to your list.",
  prescriptionUpload: "Choose image",
  prescriptionAnalyzing: "Reading prescription…",
  prescriptionNotConfigured:
    "Prescription scanning requires the FastAPI backend. Set VITE_API_BASE and rebuild, or run it locally.",
  prescriptionAddAll: "Add all to list",
  prescriptionResultTitle: "Detected medicines",

  medicalDisclaimer:
    "Always follow your doctor's prescription. This tool only estimates medicine costs and does not provide medical advice.",

  errorLoadPrices: "Unable to load medicine prices.",
  language: "Language",
  loadingMedicine: "Loading medicine…",
  notFoundTitle: "Medicine not found",
  notFoundDesc: "The medicine you are looking for is no longer in our database.",
  backToHome: "Back to calculator",
  pageNotFound: "Page not found",
};

const bn: Strings = {
  appName: "বিডি মেডিসিন প্রাইস",
  tagline: "মুহূর্তেই হিসাব করুন ওষুধের খরচ",
  searchPlaceholder: "নাপা, প্যারাসিটামল, সার্জেল খুঁজুন...",
  searchPlaceholderShort: "ওষুধ খুঁজুন",
  searchEmpty: "ওষুধ খুঁজতে টাইপ করুন",
  searchLoading: "খোঁজা হচ্ছে…",
  searchNoResults: "কোনো ওষুধ পাওয়া যায়নি",
  searchError: "ওষুধ লোড করা যাচ্ছে না। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
  retry: "আবার চেষ্টা করুন",

  configureMedicine: "ওষুধ কনফিগার করুন",
  selectMedicine: "শুরু করতে একটি ওষুধ নির্বাচন করুন",
  modePrescription: "প্রেসক্রিপশন",
  modeQuantity: "পরিমাণ",
  dose: "ডোজ",
  frequency: "দিনে কতবার",
  duration: "কতদিন",
  quantity: "পরিমাণ",
  perDay: "বার / দিন",
  days: "দিন",
  units: "ইউনিট",
  frequencyPerDay: "/ দিন",

  addToList: "তালিকায় যোগ করুন",
  updateInList: "আপডেট করুন",
  cancel: "বাতিল",

  dailyQuantity: "দৈনিক",
  totalRequired: "প্রয়োজনীয় পরিমাণ",
  purchaseQuantity: "কেনার পরিমাণ",
  estimatedCost: "আনুমানিক খরচ",
  packInfo: "প্যাক",
  perPack: "প্রতি প্যাক",
  perUnit: "প্রতি ইউনিট",
  packUnavailable: "প্যাকের তথ্য পাওয়া যায়নি — ইউনিট মূল্যে হিসাব করা হয়েছে।",

  cart: "ওষুধের তালিকা",
  cartEmpty: "আপনার ওষুধের তালিকা খালি।",
  cartEmptyHint: "খরচ হিসাব করতে উপরে একটি ওষুধ খুঁজুন।",
  cartEmptyCta: "ওষুধ খুঁজুন",
  cartItems: (n: number) => `${n}টি ওষুধ`,
  cartTotal: "মোট",
  cartMedicines: "ওষুধ সংখ্যা",
  cartUnits: "মোট ইউনিট",
  cartPacks: "মোট প্যাক",
  cartSubtotal: "সাবটোটাল",
  cartEstimatedTotal: "আনুমানিক মোট",

  edit: "সম্পাদনা",
  remove: "মুছুন",
  view: "দেখুন",
  viewSummary: "সারাংশ দেখুন",
  clearCart: "তালিকা মুছুন",
  clearCartConfirm: "আপনার কি তালিকা থেকে সব ওষুধ মুছে ফেলতে চান?",

  addedToast: (name: string) => `✓ ${name} যোগ হয়েছে`,
  removedToast: (name: string) => `${name} মুছে ফেলা হয়েছে`,
  updatedToast: (name: string) => `✓ ${name} আপডেট হয়েছে`,
  clearedToast: "ওষুধের তালিকা মুছে ফেলা হয়েছে",
  undo: "ফিরিয়ে আনুন",

  summaryTitle: "ওষুধ খরচের আনুমানিক হিসাব",
  printDate: (d: string) => `তারিখ: ${d}`,
  printTableMedicine: "ওষুধ",
  printTableDose: "ডোজ",
  printTableFrequency: "দিনে কতবার",
  printTableDuration: "কতদিন",
  printTableRequired: "প্রয়োজনীয় পরিমাণ",
  printTableCost: "খরচ",
  printTotal: "মোট",
  printDisclaimer:
    "মূল্য নির্দেশক এবং পরিবর্তন হতে পারে। ওষুধের প্যাকে লেখা MRP যাচাই করুন।",

  print: "প্রিন্ট",
  downloadPdf: "পিডিএফ ডাউনলোড",
  copy: "কপি",
  share: "শেয়ার",
  shareTitle: "ওষুধ খরচের হিসাব",
  copied: "ক্লিপবোর্ডে কপি হয়েছে",
  shared: "শেয়ার হয়েছে",
  shareUnavailable: "এই ডিভাইসে শেয়ার সমর্থিত নয়",

  prescription: "প্রেসক্রিপশন",
  prescriptionTitle: "প্রেসক্রিপশন স্ক্যান করুন",
  prescriptionDesc:
    "হাতে লেখা প্রেসক্রিপশনের ছবি আপলোড করুন। আমরা ওষুধের নাম পড়ার চেষ্টা করব এবং আপনার তালিকায় যোগ করব।",
  prescriptionUpload: "ছবি নির্বাচন করুন",
  prescriptionAnalyzing: "প্রেসক্রিপশন পড়া হচ্ছে…",
  prescriptionNotConfigured:
    "প্রেসক্রিপশন স্ক্যান করতে FastAPI ব্যাকএন্ড দরকার। VITE_API_BASE সেট করে রিবিল্ড করুন, অথবা স্থানীয়ভাবে চালান।",
  prescriptionAddAll: "সব তালিকায় যোগ করুন",
  prescriptionResultTitle: "শনাক্তকৃত ওষুধ",

  medicalDisclaimer:
    "সবসময় আপনার ডাক্তারের প্রেসক্রিপশন অনুসরণ করুন। এই টুল শুধুমাত্র ওষুধের খরচের আনুমানিক হিসাব দেয়, চিকিৎসা পরামর্শ নয়।",

  errorLoadPrices: "ওষুধের মূল্য লোড করা যাচ্ছে না।",
  language: "ভাষা",
  loadingMedicine: "ওষুধ লোড হচ্ছে…",
  notFoundTitle: "ওষুধ পাওয়া যায়নি",
  notFoundDesc: "আপনার খোঁজা ওষুধটি আমাদের ডাটাবেজে নেই।",
  backToHome: "ক্যালকুলেটরে ফিরে যান",
  pageNotFound: "পেজ পাওয়া যায়নি",
};

export const STRINGS: Record<Lang, typeof en> = { en, bn };

export function pickStrings(lang: Lang) {
  return STRINGS[lang];
}
