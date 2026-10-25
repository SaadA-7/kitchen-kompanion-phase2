let activeLocation = "All";
let expiringOnly = false;
let searchQuery = "";
let sortBy = "expiry";

const ownersOrder = ["Shared", "Alex's", "Suhaas's"];

function switchTab(tabId, btnElement) {
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => tab.classList.remove("active"));

  const buttons = document.querySelectorAll(".nav-button");
  buttons.forEach((btn) => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  btnElement.classList.add("active");
}

function formatExpirationText(days) {
  if (days <= 0) return "Expired";
  if (days === 1) return "Expires tomorrow";
  if (days < 30) return `Expires in ${days} days`;
  const months = Math.round(days / 30);
  return `Expires in ${months} months`;
}

function renderKitchenInventory() {
  const grid = document.getElementById("inventory-grid");
  const title = document.getElementById("inventory-count-title");
  if (!grid) return;

  let items = getInventoryData().filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoc = activeLocation === "All" || item.location === activeLocation;
    const matchesExp = !expiringOnly || item.daysUntilExpiration <= 3;
    return matchesSearch && matchesLoc && matchesExp;
  });

  items.sort((a, b) => {
    if (sortBy === "expiry") return a.daysUntilExpiration - b.daysUntilExpiration;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "location") return a.location.localeCompare(b.location);
    return 0;
  });

  title.textContent = `Food inventory (${items.length} items)`;
  grid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "food-card";

    const isShared = item.owner === "Shared";
    const isWarning = item.daysUntilExpiration <= 3;

    card.innerHTML = `
      <div class="food-card-left">
        <p class="food-name">${item.name}</p>
        <div class="badge-row">
          <span class="location-badge">${item.location}</span>
          <button type="button" class="owner-badge ${isShared ? "shared" : "personal"}" onclick="toggleOwner('${item.id}')">${item.owner}</button>
        </div>
        <span class="expiry-text ${isWarning ? "warning" : ""}">${formatExpirationText(item.daysUntilExpiration)}</span>
      </div>
      <div class="quantity-controls">
        <button type="button" class="qty-btn minus" onclick="updateQuantity('${item.id}', -1)">-</button>
        <span class="qty-label">${item.quantity} ${item.unit}</span>
        <button type="button" class="qty-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateQuantity(id, delta) {
  const items = getInventoryData();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;

  items[idx].quantity += delta;
  if (items[idx].quantity <= 0) {
    items.splice(idx, 1);
  }
  saveInventoryData(items);
  renderKitchenInventory();
}

function toggleOwner(id) {
  const items = getInventoryData();
  const item = items.find((i) => i.id === id);
  if (!item) return;

  const nextIndex = (ownersOrder.indexOf(item.owner) + 1) % ownersOrder.length;
  item.owner = ownersOrder[nextIndex];
  saveInventoryData(items);
  renderKitchenInventory();
}

document.addEventListener("DOMContentLoaded", () => {
  renderKitchenInventory();

  document.getElementById("kitchen-search").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderKitchenInventory();
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeLocation = btn.dataset.location;
      renderKitchenInventory();
    });
  });

  document.getElementById("expiring-soon-toggle").addEventListener("change", (e) => {
    expiringOnly = e.target.checked;
    renderKitchenInventory();
  });

  document.getElementById("sort-select").addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderKitchenInventory();
  });

  document.getElementById("reset-demo-btn").addEventListener("click", () => {
    resetInventoryData();
    renderKitchenInventory();
  });

  const modal = document.getElementById("add-food-modal");
  document.getElementById("open-add-modal-btn").addEventListener("click", () => modal.classList.add("open"));
  document.getElementById("close-add-modal-btn").addEventListener("click", () => modal.classList.remove("open"));
  document.getElementById("cancel-add-modal-btn").addEventListener("click", () => modal.classList.remove("open"));

  document.getElementById("add-food-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const items = getInventoryData();
    items.push({
      id: "item-" + Date.now(),
      name: document.getElementById("food-name-input").value.trim(),
      quantity: Number(document.getElementById("food-qty-input").value),
      unit: document.getElementById("food-unit-input").value,
      location: document.getElementById("food-location-input").value,
      owner: document.getElementById("food-owner-input").value,
      daysUntilExpiration: Number(document.getElementById("food-expiry-input").value)
    });
    saveInventoryData(items);
    e.target.reset();
    modal.classList.remove("open");
    renderKitchenInventory();
  });
});