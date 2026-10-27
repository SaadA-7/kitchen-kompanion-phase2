let activeLocation = "All";
let expiringOnly = false;
let searchQuery = "";
let sortBy = "expiry";
let editingFoodId = null;
let foodDialogReturnId = "open-add-modal-btn";

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
        <div class="food-name-row">
          <p class="food-name"></p>
          <button type="button" class="edit-food-btn">Edit</button>
        </div>
        <div class="badge-row">
          <span class="location-badge"></span>
          <button type="button" class="owner-badge ${isShared ? "shared" : "personal"}"></button>
        </div>
        <span class="expiry-text ${isWarning ? "warning" : ""}">${formatExpirationText(item.daysUntilExpiration)}</span>
      </div>
      <div class="quantity-controls">
        <button type="button" class="qty-btn minus">-</button>
        <span class="qty-label"></span>
        <button type="button" class="qty-btn plus">+</button>
      </div>
    `;
    // Food names and other stored values are text, never HTML markup.
    card.querySelector(".food-name").textContent = item.name;
    card.querySelector(".location-badge").textContent = item.location;
    card.querySelector(".owner-badge").textContent = item.owner;
    card.querySelector(".qty-label").textContent = `${item.quantity} ${item.unit}`;
    const editButton = card.querySelector(".edit-food-btn");
    editButton.id = `edit-food-${item.id}`;
    editButton.setAttribute("aria-label", `Edit ${item.name}`);
    editButton.addEventListener("click", () => openFoodModal(item.id));
    card.querySelector(".owner-badge").addEventListener("click", () => toggleOwner(item.id));
    card.querySelector(".minus").addEventListener("click", () => updateQuantity(item.id, -1));
    card.querySelector(".plus").addEventListener("click", () => updateQuantity(item.id, 1));
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

function openFoodModal(itemId = null) {
  const form = document.getElementById("add-food-form");
  const item = itemId === null ? null : getInventoryData().find(food => food.id === itemId);
  if (itemId !== null && !item) return;

  form.reset();
  document.getElementById("food-name-input").setCustomValidity("");
  editingFoodId = itemId;
  foodDialogReturnId = item ? `edit-food-${item.id}` : "open-add-modal-btn";
  document.getElementById("food-modal-title").textContent = item ? "Edit Food in Kitchen" : "Add Food to Kitchen";
  document.getElementById("save-food-btn").textContent = item ? "Save changes" : "Add to Kitchen";

  if (item) {
    document.getElementById("food-name-input").value = item.name;
    document.getElementById("food-qty-input").value = item.quantity;
    document.getElementById("food-unit-input").value = item.unit;
    document.getElementById("food-location-input").value = item.location;
    document.getElementById("food-owner-input").value = item.owner;
    document.getElementById("food-expiry-input").value = item.daysUntilExpiration;
  }

  document.getElementById("add-food-modal").classList.add("open");
  document.querySelector(".content-area").inert = true;
  document.getElementById("nav-bar").inert = true;
  document.getElementById("food-name-input").focus();
}

function closeFoodModal() {
  document.getElementById("add-food-modal").classList.remove("open");
  document.querySelector(".content-area").inert = false;
  document.getElementById("nav-bar").inert = false;
  editingFoodId = null;
  const returnButton = document.getElementById(foodDialogReturnId) || document.getElementById("open-add-modal-btn");
  returnButton.focus();
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
    document.getElementById("inventory-status").textContent = "Demo inventory restored.";
    renderKitchenInventory();
  });

  const modal = document.getElementById("add-food-modal");
  document.getElementById("open-add-modal-btn").addEventListener("click", () => openFoodModal());
  document.getElementById("close-add-modal-btn").addEventListener("click", closeFoodModal);
  document.getElementById("cancel-add-modal-btn").addEventListener("click", closeFoodModal);
  document.getElementById("food-name-input").addEventListener("input", (e) => e.target.setCustomValidity(""));

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeFoodModal();
    } else if (e.key === "Tab") {
      const controls = modal.querySelectorAll("button, input, select");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.getElementById("add-food-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("food-name-input");
    nameInput.setCustomValidity(nameInput.value.trim() ? "" : "Enter a food name.");
    if (!e.target.reportValidity()) return;

    const items = getInventoryData();
    const food = {
      name: nameInput.value.trim(),
      quantity: Number(document.getElementById("food-qty-input").value),
      unit: document.getElementById("food-unit-input").value,
      location: document.getElementById("food-location-input").value,
      owner: document.getElementById("food-owner-input").value,
      daysUntilExpiration: Number(document.getElementById("food-expiry-input").value)
    };
    const isEditing = editingFoodId !== null;
    if (isEditing) {
      const index = items.findIndex(item => item.id === editingFoodId);
      if (index === -1) {
        document.getElementById("inventory-status").textContent = "That item is no longer in your kitchen.";
        closeFoodModal();
        renderKitchenInventory();
        return;
      }
      items[index] = { ...items[index], ...food };
    } else {
      items.push({ id: "item-" + Date.now(), ...food });
    }
    saveInventoryData(items);
    e.target.reset();
    renderKitchenInventory();
    closeFoodModal();
    document.getElementById("inventory-status").textContent = `${food.name} ${isEditing ? "updated" : "added to your kitchen"}.`;
  });
});
