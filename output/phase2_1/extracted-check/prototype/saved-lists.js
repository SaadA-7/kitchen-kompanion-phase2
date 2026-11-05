// Saved lists are independent snapshots, never references to active entries.
(() => {
  const key = 'kk_saved_lists';
  const el = id => document.getElementById(id);
  const normalize = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
  const copyItem = item => ({ name: item.name, quantity: item.quantity, unit: item.unit, note: item.note || '' });
  let savedLists = [];
  let readError = false;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(parsed) || !parsed.every(list => list && typeof list.id === 'string' && typeof list.name === 'string' && Array.isArray(list.items) && list.items.every(item => item && typeof item.name === 'string' && Number.isFinite(item.quantity) && item.quantity > 0 && typeof item.unit === 'string'))) throw Error('Invalid saved lists');
    savedLists = parsed;
  } catch { readError = true; }
  const panel = document.createElement('section');
  panel.id = 'shopping-saved';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'saved-title');
  panel.innerHTML = `
    <header class="shopping-header"><h1 id="saved-title" tabindex="-1">Saved lists</h1></header>
    <p id="saved-intro" class="purchase-copy"></p>
    <button type="button" id="saved-create" class="shopping-button shopping-primary">Save current list</button>
    <ul id="saved-entries" class="saved-entries" aria-label="Saved lists"></ul>
    <form id="saved-name-form" hidden>
      <div class="shopping-fields"><label for="saved-name">List name</label><input id="saved-name" maxlength="60" placeholder="e.g., Weekly groceries" required autocomplete="off"></div>
      <div class="shopping-form-actions"><button type="button" id="saved-name-cancel" class="shopping-button">Cancel</button><button type="submit" class="shopping-button shopping-primary">Save list</button></div>
    </form>
    <p id="saved-status" class="purchase-copy" role="status"></p>
    <div id="saved-actions" class="purchase-actions"><button type="button" id="saved-back" class="shopping-button">Back to Shopping</button><button type="button" id="saved-add" class="shopping-button shopping-primary" hidden>Add selected items</button></div>`;
  el('tab-shopping').append(panel);
  const keyboard = el('shopping-editor').querySelector('.shopping-keyboard').cloneNode(true);
  panel.append(keyboard);
  let mode = 'lists';
  let snapshot = [];
  let selectedList = null;
  let choices = [];

  function activate() {
    el('tab-shopping').classList.add('is-saved-lists');
    panel.hidden = false;
    el('saved-title').focus();
  }

  function showLists(message = '') {
    mode = 'lists';
    selectedList = null;
    keyboard.hidden = true;
    el('saved-title').textContent = 'Saved lists';
    el('saved-intro').textContent = 'Keep a routine list to use again.';
    el('saved-name-form').hidden = true;
    el('saved-create').hidden = false;
    el('saved-create').disabled = !shoppingList.getItems().length || readError;
    el('saved-entries').hidden = false;
    el('saved-entries').setAttribute('aria-label', 'Saved lists');
    el('saved-actions').hidden = false;
    el('saved-back').textContent = 'Back to Shopping';
    el('saved-add').hidden = true;
    el('saved-status').textContent = readError ? 'Saved lists could not be read. Your saved data has not been changed.' : message;
    if (!shoppingList.getItems().length && !message) el('saved-status').textContent = 'Add shopping items before saving a list.';
    el('saved-entries').replaceChildren();
    savedLists.forEach(list => {
      const row = document.createElement('li');
      const text = document.createElement('div');
      text.className = 'purchase-item-text';
      const name = document.createElement('strong');
      name.textContent = list.name;
      const count = document.createElement('span');
      count.textContent = `${list.items.length} item${list.items.length === 1 ? '' : 's'}`;
      text.append(name, count);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shopping-button';
      button.textContent = 'Preview';
      button.setAttribute('aria-label', `Preview ${list.name}`);
      button.addEventListener('click', () => showPreview(list));
      row.append(text, button);
      el('saved-entries').append(row);
    });
    if (!savedLists.length) {
      const empty = document.createElement('li');
      empty.className = 'shopping-empty';
      empty.textContent = 'No saved lists yet. Save your current list to reuse it later.';
      el('saved-entries').append(empty);
    }
    activate();
  }

  function startSave() {
    snapshot = shoppingList.getItems().map(copyItem);
    if (!snapshot.length || readError) return;
    mode = 'save';
    el('saved-title').textContent = 'Save current list';
    el('saved-intro').textContent = `Save a copy of all ${snapshot.length} items, including purchased items. Purchase checkmarks are not saved.`;
    el('saved-create').hidden = true;
    el('saved-entries').hidden = true;
    el('saved-actions').hidden = true;
    el('saved-status').textContent = '';
    el('saved-name-form').hidden = false;
    el('saved-name-form').reset();
    el('saved-name').setCustomValidity('');
    keyboard.hidden = false;
    el('saved-name').focus();
  }

  function overlaps(item) {
    return shoppingList.getItems().some(entry => normalize(entry.name) === normalize(item.name));
  }

  function updateSelection() {
    const count = choices.filter(choice => choice.checkbox.checked && !choice.checkbox.disabled).length;
    el('saved-add').textContent = `Add selected (${count})`;
    el('saved-add').disabled = count === 0;
    el('saved-status').textContent = count ? `${count} item${count === 1 ? '' : 's'} will be added unchecked.` : 'No items selected. Items already on your list cannot be added again.';
  }

  function showPreview(list) {
    mode = 'preview';
    selectedList = list;
    choices = [];
    el('saved-title').textContent = list.name;
    el('saved-intro').textContent = 'Select items to add. Items already on your list cannot be added again.';
    el('saved-create').hidden = true;
    el('saved-name-form').hidden = true;
    el('saved-entries').hidden = false;
    el('saved-entries').setAttribute('aria-label', 'Items to reuse');
    el('saved-actions').hidden = false;
    el('saved-back').textContent = 'Back to saved lists';
    el('saved-add').hidden = false;
    el('saved-entries').replaceChildren();
    keyboard.hidden = true;
    const seen = new Set();
    list.items.forEach(item => {
      const overlap = overlaps(item);
      const row = document.createElement('li');
      row.className = 'saved-preview-item';
      const label = document.createElement('label');
      label.className = 'saved-select-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      const repeated = seen.has(normalize(item.name));
      seen.add(normalize(item.name));
      checkbox.disabled = overlap || repeated;
      checkbox.checked = !checkbox.disabled;
      checkbox.setAttribute('aria-label', `Add ${item.name}`);
      const text = document.createElement('div');
      text.className = 'purchase-item-text';
      const name = document.createElement('strong');
      name.textContent = `${item.name} · ${item.quantity} ${item.unit}`;
      text.append(name);
      if (item.note) {
        const note = document.createElement('span');
        note.textContent = item.note;
        text.append(note);
      }
      label.append(checkbox, text);
      row.append(label);
      if (overlap || repeated) {
        const info = document.createElement('p');
        info.className = 'purchase-copy saved-overlap';
        info.textContent = overlap ? 'Already on your list' : 'Repeated item in this saved list';
        row.append(info);
      }
      checkbox.addEventListener('change', updateSelection);
      choices.push({ item, checkbox, overlap });
      el('saved-entries').append(row);
    });
    updateSelection();
    activate();
  }

  el('saved-name-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = el('saved-name');
    const name = input.value.trim();
    input.setCustomValidity(!name ? 'Enter a list name.' : savedLists.some(list => normalize(list.name) === normalize(name)) ? 'A saved list already has that name. Choose another name.' : '');
    if (!event.target.reportValidity()) return;
    const next = [...savedLists, { id: crypto.randomUUID(), name, items: snapshot.map(copyItem) }];
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { el('saved-status').textContent = 'Could not save the list. Try again.'; return; }
    savedLists = next;
    snapshot = [];
    showLists('List saved. Changes to Shopping will not change this copy.');
  });
  el('saved-name').addEventListener('input', () => el('saved-name').setCustomValidity(''));
  el('shopping-saved-open').addEventListener('click', () => showLists());
  el('saved-create').addEventListener('click', startSave);
  el('saved-name-cancel').addEventListener('click', () => { snapshot = []; showLists(); });
  el('saved-back').addEventListener('click', () => {
    if (mode === 'preview') showLists();
    else shoppingList.show(undefined, 'shopping-saved-open');
  });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mode === 'save') { event.preventDefault(); snapshot = []; showLists(); }
  });
  el('saved-add').addEventListener('click', () => {
    if (mode !== 'preview' || el('saved-add').disabled) return;
    // Recheck availability if the active list changed while previewing.
    if (choices.some(choice => overlaps(choice.item) !== choice.overlap)) {
      showPreview(selectedList);
      el('saved-status').textContent = 'Your shopping list changed. Check your selections again.';
      return;
    }
    const entries = choices.filter(choice => choice.checkbox.checked && !choice.checkbox.disabled)
      .map(choice => ({ ...copyItem(choice.item), id: `s-${crypto.randomUUID()}`, purchased: false }));
    if (!entries.length) return;
    if (!shoppingList.addItems(entries)) {
      el('saved-status').textContent = 'Could not add these items. Try again.';
      return;
    }
    mode = 'lists'; // Guard against a second activation of the same add button.
    shoppingList.show(`${entries.length} item${entries.length === 1 ? '' : 's'} added from ${selectedList.name}.`, 'shopping-saved-open');
  });
})();
