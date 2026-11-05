// Purchase review is saved separately from the active list. Only the final
// confirmation writes Inventory. A journal makes interrupted transfers repeatable.
(() => {
  const el = id => document.getElementById(id);
  const reviewKey = 'kk_purchase_reviews';
  const journalKey = 'kk_purchase_transfer';
  const tab = el('tab-shopping');
  const panel = document.createElement('section');
  panel.id = 'shopping-review';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'purchase-title');
  panel.innerHTML = `
    <header class="shopping-header"><h1 id="purchase-title" tabindex="-1">Put groceries away</h1></header>
    <p id="purchase-intro" class="purchase-copy"></p>
    <ul id="purchase-items" aria-label="Purchased items"></ul>
    <form id="purchase-form" hidden>
      <div class="shopping-fields">
        <label for="purchase-name">Item name</label><input id="purchase-name" maxlength="80" required autocomplete="off">
        <div class="shopping-form-row">
          <div><label for="purchase-quantity">Quantity</label><input id="purchase-quantity" type="number" min="0.01" max="9999" step="0.01" inputmode="decimal" required></div>
          <div><label for="purchase-unit">Unit</label><select id="purchase-unit" required></select></div>
        </div>
        <div class="shopping-form-row">
          <div><label for="purchase-location">Store in</label><select id="purchase-location" required><option value="">Choose...</option><option>Fridge</option><option>Pantry</option><option>Freezer</option></select></div>
          <div><label for="purchase-expiration">Expiration</label><input id="purchase-expiration" type="date" required></div>
        </div>
      </div>
      <div class="shopping-form-actions"><button type="button" id="purchase-cancel" class="shopping-button">Cancel</button><button type="submit" class="shopping-button shopping-primary">Save review</button></div>
    </form>
    <p id="purchase-status" class="purchase-copy" role="status"></p>
    <div id="purchase-actions" class="purchase-actions">
      <button type="button" id="purchase-back" class="shopping-button">Back to list</button>
      <button type="button" id="purchase-next" class="shopping-button shopping-primary">Review transfer</button>
    </div>`;
  tab.append(panel);
  el('purchase-unit').innerHTML = el('shopping-unit').innerHTML;
  const keyboard = el('shopping-editor').querySelector('.shopping-keyboard').cloneNode(true);
  panel.append(keyboard);
  for (const option of el('shopping-unit').options) {
    if (![...el('food-unit-input').options].some(existing => existing.value === option.value)) {
      el('food-unit-input').add(new Option(option.text, option.value));
    }
  }
  let reviews = {};
  let mode = 'overview';
  let editingId = null;
  let busy = false;
  let completedCount = 0;
  try { reviews = JSON.parse(localStorage.getItem(reviewKey) || '{}') || {}; }
  catch { reviews = {}; }
  const signature = item => JSON.stringify([item.name, item.quantity, item.unit, item.note || '']);
  const purchased = () => shoppingList.getItems().filter(item => item.purchased);
  const reviewFor = item => {
    const review = reviews[item.id];
    return review && review.signature === signature(item) ? review : null;
  };
  const formatDate = date => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function showPanel() {
    tab.classList.add('is-reviewing');
    panel.hidden = false;
    el('purchase-title').focus();
  }

  function showOverview(confirm = false) {
    mode = confirm ? 'confirm' : 'overview';
    editingId = null;
    keyboard.hidden = true;
    el('purchase-form').hidden = true;
    el('purchase-items').hidden = false;
    el('purchase-actions').hidden = false;
    el('purchase-next').hidden = false;
    el('purchase-title').textContent = confirm ? 'Confirm transfer' : 'Put groceries away';
    const entries = purchased();
    const reviewed = entries.filter(reviewFor).length;
    el('purchase-intro').textContent = confirm
      ? `Add ${entries.length} purchased item${entries.length === 1 ? '' : 's'} to Kitchen? Each is added as a separate batch.`
      : `${reviewed} of ${entries.length} reviewed. Check each purchase before adding it to Kitchen.`;
    el('purchase-items').replaceChildren();
    entries.forEach(item => {
      const review = reviewFor(item);
      const row = document.createElement('li');
      const text = document.createElement('div');
      text.className = 'purchase-item-text';
      const name = document.createElement('strong');
      name.textContent = review ? review.name : item.name;
      const detail = document.createElement('span');
      detail.textContent = review
        ? `${review.quantity} ${review.unit} · ${review.location}`
        : `${item.quantity} ${item.unit}`;
      const state = document.createElement('span');
      state.className = 'purchase-review-state';
      state.textContent = review ? `Reviewed · Expires ${formatDate(review.expirationDate)}` : 'Needs review';
      text.append(name, detail, state);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shopping-button';
      button.textContent = review ? 'Edit' : 'Review';
      button.setAttribute('aria-label', `${review ? 'Edit review for' : 'Review'} ${item.name}`);
      button.addEventListener('click', () => openReview(item));
      row.append(text, button);
      el('purchase-items').append(row);
    });
    const remaining = shoppingList.getItems().length - entries.length;
    el('purchase-status').textContent = confirm
      ? `${remaining} unpurchased item${remaining === 1 ? '' : 's'} will stay on your list.`
      : reviewed < entries.length ? 'Review every purchased item to continue.' : 'All purchases reviewed. Ready for the final check.';
    el('purchase-back').textContent = confirm ? 'Back to review' : 'Back to list';
    el('purchase-next').textContent = confirm ? `Confirm transfer (${entries.length})` : 'Review transfer';
    el('purchase-next').disabled = busy || !entries.length || reviewed !== entries.length;
    showPanel();
  }

  function openReview(item) {
    mode = 'editing';
    editingId = item.id;
    const saved = reviewFor(item);
    el('purchase-form').reset();
    el('purchase-name').setCustomValidity('');
    el('purchase-name').value = saved?.name || item.name;
    el('purchase-quantity').value = saved?.quantity ?? item.quantity;
    el('purchase-unit').value = saved?.unit || item.unit;
    el('purchase-location').value = saved?.location || '';
    el('purchase-expiration').value = saved?.expirationDate || '';
    el('purchase-title').textContent = 'Review purchase';
    const entries = purchased();
    el('purchase-intro').textContent = `Item ${entries.findIndex(entry => entry.id === item.id) + 1} of ${entries.length} · Correct the amount you bought.`;
    el('purchase-status').textContent = '';
    el('purchase-items').hidden = true;
    el('purchase-actions').hidden = true;
    el('purchase-form').hidden = false;
    el('purchase-name').focus();
    keyboard.hidden = false;
  }

  function showComplete(count) {
    completedCount = count;
    mode = 'complete';
    keyboard.hidden = true;
    el('purchase-form').hidden = true;
    el('purchase-items').hidden = true;
    el('purchase-actions').hidden = false;
    el('purchase-title').textContent = 'Groceries put away';
    el('purchase-intro').textContent = `${count} item${count === 1 ? '' : 's'} added to Kitchen.`;
    const remaining = shoppingList.getItems().length;
    el('purchase-status').textContent = remaining ? `${remaining} item${remaining === 1 ? '' : 's'} remain on your shopping list.` : 'Your shopping list is now empty.';
    el('purchase-back').textContent = 'Back to Shopping';
    el('purchase-next').textContent = 'View Kitchen';
    el('purchase-next').disabled = false;
    showPanel();
  }

  function finishJournal(transaction) {
    // Deterministic batch IDs prevent a retry/reload from adding food twice.
    const inventory = getInventoryData();
    const ids = new Set(inventory.map(item => item.id));
    saveInventoryData([...inventory, ...transaction.batches.filter(item => !ids.has(item.id))]);
    const current = JSON.parse(localStorage.getItem('kk_shopping') || '[]');
    localStorage.setItem('kk_shopping', JSON.stringify(current.filter(item => !transaction.sourceIds.includes(item.id))));
    for (const id of transaction.sourceIds) delete reviews[id];
    localStorage.setItem(reviewKey, JSON.stringify(reviews));
    localStorage.removeItem(journalKey);
    shoppingList.refresh();
    renderKitchenInventory();
    return transaction.batches.length;
  }

  function confirmTransfer() {
    if (busy) return;
    busy = true;
    el('purchase-next').disabled = true;
    try {
      let transaction = JSON.parse(localStorage.getItem(journalKey) || 'null');
      if (!transaction) {
        const entries = purchased();
        if (!entries.length || !entries.every(reviewFor)) throw Error('Review all purchases first.');
        // Do not transfer an older review after another browser window changes the list.
        const current = JSON.parse(localStorage.getItem('kk_shopping') || '[]');
        if (entries.some(item => !current.some(saved => saved.id === item.id && saved.purchased && signature(saved) === signature(item)))) {
          shoppingList.refresh();
          busy = false;
          showOverview();
          el('purchase-status').textContent = 'The list changed. Check the purchases again.';
          return;
        }
        const batchId = crypto.randomUUID();
        transaction = {
          sourceIds: entries.map(item => item.id),
          batches: entries.map(item => {
            const review = reviewFor(item);
            return {
              id: `purchase-${batchId}-${item.id}`, name: review.name,
              quantity: review.quantity, unit: review.unit, location: review.location,
              owner: 'You', expirationDate: review.expirationDate,
              daysUntilExpiration: daysToExpiration(review.expirationDate), note: item.note || ''
            };
          })
        };
        // Writing this journal records the user's explicit transfer authorization.
        localStorage.setItem(journalKey, JSON.stringify(transaction));
      }
      showComplete(finishJournal(transaction));
    } catch {
      el('purchase-status').textContent = 'Transfer could not finish. Try again; groceries will not be added twice.';
      el('purchase-next').textContent = 'Retry transfer';
      el('purchase-next').disabled = false;
      mode = 'retry';
    } finally { busy = false; }
  }

  el('purchase-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = el('purchase-name');
    name.setCustomValidity(name.value.trim() ? '' : 'Enter an item name.');
    if (!event.target.reportValidity()) return;
    const item = purchased().find(entry => entry.id === editingId);
    if (!item) { showOverview(); return; }
    const next = { ...reviews, [item.id]: {
      signature: signature(item), name: name.value.trim(), quantity: Number(el('purchase-quantity').value),
      unit: el('purchase-unit').value, location: el('purchase-location').value,
      expirationDate: el('purchase-expiration').value
    } };
    try { localStorage.setItem(reviewKey, JSON.stringify(next)); }
    catch { el('purchase-status').textContent = 'Could not save this review. Try again.'; return; }
    reviews = next;
    showOverview();
  });
  el('purchase-name').addEventListener('input', () => el('purchase-name').setCustomValidity(''));
  el('purchase-cancel').addEventListener('click', () => showOverview());
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mode === 'editing') { event.preventDefault(); showOverview(); }
  });
  el('purchase-back').addEventListener('click', () => {
    if (mode === 'retry') {
      el('purchase-status').textContent = 'Please retry the confirmed transfer before continuing.';
    } else if (mode === 'confirm') showOverview();
    else shoppingList.show();
  });
  el('purchase-next').addEventListener('click', () => {
    if (mode === 'complete') {
      shoppingList.show();
      // Show all food so a prior Inventory search cannot hide the new groceries.
      activeLocation = 'All'; searchQuery = ''; expiringOnly = false;
      el('kitchen-search').value = '';
      el('expiring-soon-toggle').checked = false;
      document.querySelectorAll('.filter-btn').forEach(button => button.classList.toggle('active', button.dataset.location === 'All'));
      renderKitchenInventory();
      el('inventory-status').textContent = `${completedCount} purchased items added to your kitchen.`;
      switchTab('tab-kitchen', document.querySelectorAll('.nav-button')[0]);
    } else if (mode === 'overview') showOverview(true);
    else if (mode === 'confirm' || mode === 'retry') confirmTransfer();
  });
  el('shopping-finish').addEventListener('click', () => {
    if (!purchased().length || !shoppingList.persist()) return;
    if (localStorage.getItem(journalKey)) { mode = 'retry'; confirmTransfer(); }
    else showOverview();
  });
  // Recovery runs only for a previously confirmed transfer, never for a draft.
  try {
    const pending = JSON.parse(localStorage.getItem(journalKey) || 'null');
    if (pending) showComplete(finishJournal(pending));
  } catch {
    showOverview(true);
    mode = 'retry';
    el('purchase-status').textContent = 'A confirmed transfer was interrupted. Retry to finish it safely.';
    el('purchase-next').textContent = 'Retry transfer';
    el('purchase-next').disabled = false;
  }
})();
