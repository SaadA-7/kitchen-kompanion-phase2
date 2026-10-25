const INITIAL_INVENTORY = [
  { id: "1", name: "Fresh spinach", location: "Fridge", owner: "Shared", quantity: 2, unit: "cups", daysUntilExpiration: 1 },
  { id: "2", name: "Greek yogurt", location: "Fridge", owner: "Alex's", quantity: 3, unit: "cups", daysUntilExpiration: 2 },
  { id: "3", name: "Bananas", location: "Pantry", owner: "Shared", quantity: 6, unit: "count", daysUntilExpiration: 3 },
  { id: "4", name: "Large eggs", location: "Fridge", owner: "Shared", quantity: 6, unit: "eggs", daysUntilExpiration: 7 },
  { id: "5", name: "Cheddar cheese", location: "Fridge", owner: "Suhaas's", quantity: 8, unit: "oz", daysUntilExpiration: 12 },
  { id: "6", name: "Chicken breast", location: "Freezer", owner: "Shared", quantity: 2, unit: "lbs", daysUntilExpiration: 60 },
  { id: "7", name: "Gluten-free pasta", location: "Pantry", owner: "Suhaas's", quantity: 1, unit: "boxes", daysUntilExpiration: 90 },
  { id: "8", name: "Jasmine rice", location: "Pantry", owner: "Alex's", quantity: 1, unit: "bag", daysUntilExpiration: 180 },
  { id: "9", name: "Black beans", location: "Pantry", owner: "Shared", quantity: 4, unit: "cans", daysUntilExpiration: 365 }
];

function getInventoryData() {
  const saved = localStorage.getItem("kk_inventory");
  if (!saved) {
    localStorage.setItem("kk_inventory", JSON.stringify(INITIAL_INVENTORY));
    return [...INITIAL_INVENTORY];
  }
  return JSON.parse(saved);
}

function saveInventoryData(items) {
  localStorage.setItem("kk_inventory", JSON.stringify(items));
}

function resetInventoryData() {
  localStorage.setItem("kk_inventory", JSON.stringify(INITIAL_INVENTORY));
}