// Active shopping list and item editing.
(() => {
  const storageKey = 'kk_shopping';
  const initialItems = [
    { id: 's1', name: 'Milk', quantity: 1, unit: 'gallon', purchased: false },
    { id: 's2', name: 'Apples', quantity: 1.5, unit: 'lbs', purchased: false },
    { id: 's3', name: 'Whole wheat bread', quantity: 1, unit: 'loaf', purchased: true },
    { id: 's4', name: 'Bell peppers', quantity: 3, unit: 'count', purchased: false },
    { id: 's5', name: 'Greek yogurt', quantity: 2, unit: 'cups', note: 'Plain, unsweetened', purchased: false },
    { id: 's6', name: 'Large eggs', quantity: 12, unit: 'count', purchased: true },
    { id: 's7', name: 'Rolled oats', quantity: 1, unit: 'bag', purchased: false }
  ];
  const el = id => document.getElementById(id);
  let items = initialItems;
  let storageProblem = false;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && Number.isFinite(item.quantity) && item.quantity > 0 && typeof item.unit === 'string' && typeof item.purchased === 'boolean')) throw Error('Invalid shopping data');
      items = parsed;
    }
  } catch { storageProblem = true; }
  let editingId = null;
  let returnId = 'shopping-add';
  let removed = null;
  let scrollPosition = 0;
  const list = el('shopping-items');
  const tab = el('tab-shopping');
  const form = el('shopping-form');

  function commit(next) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch {
      const message = 'Could not save. Free browser storage and try again.';
      el('shopping-status').textContent = message;
      el('shopping-form-status').textContent = message;
      return false;
    }
    items = next;
    return true;
  }

  function updateSummary(message) {
    const count = items.filter(item => item.purchased).length;
    el('shopping-count').textContent = `${count} of ${items.length} purchased`;
    el('shopping-finish').textContent = `Finish shopping (${count})`;
    el('shopping-finish').disabled = !count;
    el('shopping-status').textContent = message || (count ? 'Tap an item name to edit.' : 'Check a purchased item to finish shopping.');
    el('shopping-undo').hidden = !removed;
  }

  function render(message) {
    const top = list.scrollTop;
    list.replaceChildren();
    items.forEach(item => {
      const row = document.createElement('li');
      row.className = 'shopping-item shopping-item-label';
      row.classList.toggle('is-purchased', item.purchased);
      const checkLabel = document.createElement('label');
      checkLabel.className = 'shopping-check-target';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.purchased;
      checkbox.setAttribute('aria-label', `Purchased: ${item.name}`);
      checkLabel.append(checkbox);
      const details = document.createElement('button');
      details.type = 'button';
      details.id = `shopping-edit-${item.id}`;
      details.className = 'shopping-item-details shopping-edit';
      details.setAttribute('aria-label', `Edit ${item.name}`);
      const name = document.createElement('span');
      name.className = 'shopping-item-name';
      name.textContent = item.name;
      details.append(name);
      if (item.note) {
        const note = document.createElement('span');
        note.className = 'shopping-item-note';
        note.textContent = item.note;
        details.append(note);
      }
      const quantity = document.createElement('span');
      quantity.className = 'shopping-item-quantity';
      quantity.textContent = `${item.quantity} ${item.unit}`;
      row.append(checkLabel, details, quantity);
      list.append(row);
      details.addEventListener('click', () => openEditor(item.id));
      checkbox.addEventListener('change', () => {
        const next = items.map(entry => entry.id === item.id ? { ...entry, purchased: checkbox.checked } : entry);
        if (!commit(next)) { checkbox.checked = !checkbox.checked; return; }
        row.classList.toggle('is-purchased', checkbox.checked);
        updateSummary();
      });
    });
    if (!items.length) {
      const empty = document.createElement('li');
      empty.className = 'shopping-empty';
      empty.textContent = 'Your list is empty. Add an item to get started.';
      list.append(empty);
    }
    list.scrollTop = top;
    updateSummary(message);
  }

  function openEditor(id = null) {
    const item = items.find(entry => entry.id === id);
    editingId = id;
    returnId = item ? `shopping-edit-${id}` : 'shopping-add';
    scrollPosition = list.scrollTop;
    form.reset();
    el('shopping-name').setCustomValidity('');
    el('shopping-name').value = item?.name || '';
    el('shopping-quantity').value = item?.quantity ?? 1;
    el('shopping-unit').value = item?.unit || 'count';
    el('shopping-note').value = item?.note || '';
    el('shopping-editor-title').textContent = item ? 'Edit item' : 'Add item';
    el('shopping-save').textContent = item ? 'Save changes' : 'Add item';
    el('shopping-remove').hidden = !item;
    el('shopping-form-status').textContent = '';
    tab.classList.add('is-editing');
    el('shopping-editor').hidden = false;
    el('shopping-name').focus();
  }

  function closeEditor(message) {
    tab.classList.remove('is-editing');
    el('shopping-editor').hidden = true;
    el('shopping-editor').querySelector('.shopping-keyboard').hidden = true;
    form.reset();
    editingId = null;
    render(message);
    list.scrollTop = scrollPosition;
    (el(returnId) || el('shopping-add')).focus({ preventScroll: true });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = el('shopping-name');
    name.setCustomValidity(name.value.trim() ? '' : 'Enter an item name.');
    if (!form.reportValidity()) return;
    const old = items.find(item => item.id === editingId);
    const item = {
      id: old?.id || `s-${crypto.randomUUID()}`,
      name: name.value.trim(), quantity: Number(el('shopping-quantity').value),
      unit: el('shopping-unit').value, note: el('shopping-note').value.trim(), purchased: old?.purchased || false
    };
    const next = old ? items.map(entry => entry.id === old.id ? item : entry) : [...items, item];
    if (commit(next)) closeEditor(old ? 'Item updated.' : 'Item added.');
  });
  el('shopping-name').addEventListener('input', () => el('shopping-name').setCustomValidity(''));
  el('shopping-add').addEventListener('click', () => openEditor());
  el('shopping-cancel').addEventListener('click', () => closeEditor());
  el('shopping-editor').addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeEditor(); }
  });
  el('shopping-remove').addEventListener('click', () => {
    const index = items.findIndex(item => item.id === editingId);
    if (index < 0) return;
    const candidate = { item: items[index], index };
    if (!commit(items.filter(item => item.id !== editingId))) return;
    removed = candidate;
    closeEditor('Item removed.');
    el('shopping-undo').focus();
  });
  el('shopping-undo').addEventListener('click', () => {
    if (!removed) return;
    const next = [...items];
    next.splice(Math.min(removed.index, next.length), 0, removed.item);
    if (!commit(next)) return;
    const id = removed.item.id;
    removed = null;
    render('Item restored.');
    el(`shopping-edit-${id}`).focus();
  });
  // Noninteractive soft-keyboard stand-in reserves real device space during entry.
  form.addEventListener('focusin', event => {
    if (event.target.matches('input')) el('shopping-editor').querySelector('.shopping-keyboard').hidden = false;
  });
  window.shoppingList = {
    getItems: () => items,
    persist: () => commit(items),
    addItems: entries => {
      if (!commit([...items, ...entries])) return false;
      removed = null;
      render();
      return true;
    },
    refresh: () => {
      items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      removed = null;
      render();
    },
    show: (message, focusId = 'shopping-finish') => {
      tab.classList.remove('is-reviewing', 'is-saved-lists');
      el('shopping-review').hidden = true;
      if (el('shopping-saved')) el('shopping-saved').hidden = true;
      render(message);
      el(focusId).focus();
    }
  };
  render(storageProblem ? 'Saved list could not be read. Sample items are shown.' : undefined);
})();
