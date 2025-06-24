// Standardized fields that every store must have
export const REQUIRED_FIELDS = [
  "apparel",
  "shoes",
  "jewelery",
  "bags",
  "notes",
  "lastUpdated",
];

// Fields that users can set (excluding lastUpdated which is auto-generated)
export const USER_SETTABLE_FIELDS = REQUIRED_FIELDS.filter(
  (field) => field !== "lastUpdated"
);

// Field display names for UI
export const FIELD_DISPLAY_NAMES = {
  apparel: "Apparel",
  shoes: "Shoes",
  jewelery: "Jewelery",
  bags: "Bags",
  notes: "Notes",
  lastUpdated: "Last Updated",
};

// Validation function to ensure data structure
export function validateStoreData(storeData) {
  if (!storeData || typeof storeData !== "object") {
    return false;
  }

  // Check that all required fields are present
  return REQUIRED_FIELDS.every((field) => field in storeData);
}

// Function to create a standardized store object with all fields set to null
export function createEmptyStoreData() {
  const emptyStore = {};
  REQUIRED_FIELDS.forEach((field) => {
    emptyStore[field] = null;
  });
  return emptyStore;
}
