// Initialize data
let users = JSON.parse(localStorage.getItem("vz_users")) || [{username:"admin", password:"admin123", role:"Admin", name:"Administrator"}];
let inventory = JSON.parse(localStorage.getItem("vz_inventory")) || [];
let shipments = JSON.parse(localStorage.getItem("vz_shipments")) || [];
let clients = JSON.parse(localStorage.getItem("vz_clients")) || [];
let activity = JSON.parse(localStorage.getItem("vz_activity")) || [];
let currentUser = JSON.parse(localStorage.getItem("vz_currentUser"));

/* ── TOAST ─────────────────────────────────────── */
let toastTimer;
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = 'show ' + type;
  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 3000);
}

/* ── AUTH CARDS ─────────────────────────────────── */
function showCard(id) {
  ['loginCard','registerCard','forgotCard'].forEach(c => {
    const el = document.getElementById(c);
    if (el) el.classList.add('hidden');
  });
  const card = document.getElementById(id);
  if (card) card.classList.remove('hidden');
  const authMsg = document.getElementById('authMessage');
  if (authMsg) authMsg.textContent = '';
}

function login() {
  const u = document.getElementById('loginUsername')?.value.trim() || '';
  const p = document.getElementById('loginPassword')?.value || '';
  if (!u || !p) { 
    const authMsg = document.getElementById('authMessage');
    if (authMsg) authMsg.textContent = 'Please fill in all fields.'; 
    return; 
  }
  const user = users.find(x => x.username === u && x.password === p);
  if (user) {
    localStorage.setItem('vz_currentUser', JSON.stringify(user));
    location.reload();
  } else {
    const authMsg = document.getElementById('authMessage');
    if (authMsg) authMsg.textContent = 'Invalid username or password.';
  }
}

function register() {
  const name = document.getElementById('regName')?.value.trim() || '';
  const email = document.getElementById('regEmail')?.value.trim() || '';
  const username = document.getElementById('regUsername')?.value.trim() || '';
  const password = document.getElementById('regPassword')?.value || '';
  const role = document.getElementById('regRole')?.value || 'Staff';

  if (!name || !email || !username || !password) { 
    toast('All fields are required.', 'error'); 
    return; 
  }
  if (password.length < 6) { 
    toast('Password must be at least 6 characters.', 'error'); 
    return; 
  }
  if (users.find(x => x.username === username)) { 
    toast('Username already taken.', 'error'); 
    return; 
  }

  users.push({ name, email, username, password, role });
  localStorage.setItem('vz_users', JSON.stringify(users));
  toast('Account created. Please sign in.', 'success');
  showCard('loginCard');
}

function resetPassword() {
  const username = document.getElementById('forgotUsername')?.value.trim() || '';
  const newPass = document.getElementById('newPassword')?.value || '';
  if (!username || !newPass) { 
    toast('Fill in all fields.', 'error'); 
    return; 
  }
  const user = users.find(x => x.username === username);
  if (!user) { 
    toast('Username not found.', 'error'); 
    return; 
  }
  if (newPass.length < 6) { 
    toast('Password must be at least 6 characters.', 'error'); 
    return; 
  }
  user.password = newPass;
  localStorage.setItem('vz_users', JSON.stringify(users));
  toast('Password reset. Please sign in.', 'success');
  showCard('loginCard');
}

function logout() {
  localStorage.removeItem('vz_currentUser');
  location.reload();
}

/* ── INIT PORTAL ─────────────────────────────────── */
if (currentUser) {
  const authContainer = document.getElementById('authContainer');
  const portal = document.getElementById('portal');
  const userDisplay = document.getElementById('userDisplay');
  
  if (authContainer) authContainer.classList.add('hidden');
  if (portal) portal.classList.remove('hidden');
  if (userDisplay) {
    userDisplay.innerHTML = `${currentUser.name || currentUser.username} <span class="role-badge">${currentUser.role}</span>`;
  }
  renderAll();
}

/* ── NAVIGATION ─────────────────────────────────── */
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const section = document.getElementById(id);
  const navBtn = document.getElementById('nav-' + id);
  
  if (section) section.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
}

/* ── ACTIVITY LOG ────────────────────────────────── */
function logActivity(msg) {
  const now = new Date();
  const time = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  activity.unshift({ msg, time, date: now.toLocaleDateString() });
  if (activity.length > 20) activity.pop();
  localStorage.setItem('vz_activity', JSON.stringify(activity));
  renderActivity();
}

function renderActivity() {
  const el = document.getElementById('activityFeed');
  if (!el) return;
  
  if (!activity.length) { 
    el.innerHTML = '<div style="padding:16px 0;text-align:center">No recent activity.</div>'; 
    return; 
  }
  el.innerHTML = activity.slice(0,8).map(a =>
    `<div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center">
      <span style="color:var(--accent);flex-shrink:0">${a.time}</span>
      <span style="color:var(--text-muted)">${a.date}</span>
      <span style="color:var(--text)">${a.msg}</span>
    </div>`
  ).join('');
}

/* ── INVENTORY ───────────────────────────────────── */
function addInventory() {
  const name = document.getElementById('itemName')?.value.trim() || '';
  const qty = document.getElementById('itemQty')?.value || '';
  const wh = document.getElementById('itemWarehouse')?.value.trim() || '';
  
  if (!name || !qty || !wh) { 
    toast('Fill in all inventory fields.', 'error'); 
    return; 
  }
  
  const item = { 
    id: Date.now(), 
    name, 
    qty: Number(qty), 
    wh, 
    added: new Date().toLocaleDateString() 
  };
  
  inventory.push(item);
  localStorage.setItem('vz_inventory', JSON.stringify(inventory));
  logActivity(`Inventory item added: ${name} (x${qty}) → ${wh}`);
  
  const nameInput = document.getElementById('itemName');
  const qtyInput = document.getElementById('itemQty');
  const whInput = document.getElementById('itemWarehouse');
  
  if (nameInput) nameInput.value = '';
  if (qtyInput) qtyInput.value = '';
  if (whInput) whInput.value = '';
  
  renderInventory();
  updateStats();
  toast(`"${name}" added to inventory.`);
}

function deleteInventory(id) {
  const item = inventory.find(i => i.id === id);
  inventory = inventory.filter(i => i.id !== id);
  localStorage.setItem('vz_inventory', JSON.stringify(inventory));
  if (item) logActivity(`Inventory item removed: ${item.name}`);
  renderInventory();
  updateStats();
  toast('Item deleted.', 'error');
}

function renderInventory() {
  const el = document.getElementById('inventoryTable');
  const countEl = document.getElementById('invCount');
  
  if (!el) return;
  if (countEl) countEl.textContent = inventory.length + ' items';
  
  if (!inventory.length) { 
    el.innerHTML = '<div class="empty-state">NO INVENTORY ITEMS YET</div>'; 
    return; 
  }
  
  el.innerHTML = `<table>
    <thead><tr><th>Item Name</th><th>Quantity</th><th>Warehouse</th><th>Date Added</th><th></th></tr></thead>
    <tbody>${inventory.map(i => `<tr>
      <td>${escapeHtml(i.name)}</td>
      <td><span style="font-family:var(--mono);color:var(--accent)">${i.qty}</span></td>
      <td>${escapeHtml(i.wh)}</td>
      <td style="color:var(--text-muted);font-size:12px">${i.added || '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteInventory(${i.id})">Delete</button></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

/* ── SHIPMENTS ───────────────────────────────────── */
function addShipment() {
  const id = document.getElementById('shipID')?.value.trim() || '';
  const dest = document.getElementById('shipDestination')?.value.trim() || '';
  const status = document.getElementById('shipStatus')?.value || 'Pending';
  
  if (!id || !dest) { 
    toast('Fill in all shipment fields.', 'error'); 
    return; 
  }
  if (shipments.find(s => s.id === id)) { 
    toast('Shipment ID already exists.', 'error'); 
    return; 
  }
  
  const ship = { id, dest, status, added: new Date().toLocaleDateString() };
  shipments.push(ship);
  localStorage.setItem('vz_shipments', JSON.stringify(shipments));
  logActivity(`Shipment created: ${id} → ${dest} [${status}]`);
  
  const idInput = document.getElementById('shipID');
  const destInput = document.getElementById('shipDestination');
  
  if (idInput) idInput.value = '';
  if (destInput) destInput.value = '';
  
  renderShipments();
  updateStats();
  toast(`Shipment ${id} created.`);
}

function deleteShipment(id) {
  shipments = shipments.filter(s => s.id !== id);
  localStorage.setItem('vz_shipments', JSON.stringify(shipments));
  logActivity(`Shipment removed: ${id}`);
  renderShipments();
  updateStats();
  toast('Shipment deleted.', 'error');
}

function renderShipments() {
  const el = document.getElementById('shipmentsTable');
  const countEl = document.getElementById('shipCount');
  
  if (!el) return;
  if (countEl) countEl.textContent = shipments.length + ' shipments';
  
  if (!shipments.length) { 
    el.innerHTML = '<div class="empty-state">NO SHIPMENTS YET</div>'; 
    return; 
  }
  
  el.innerHTML = `<table>
    <thead><tr><th>Shipment ID</th><th>Destination</th><th>Status</th><th>Date Added</th><th></th></tr></thead>
    <tbody>${shipments.map(s => {
      const cls = s.status === 'Pending' ? 'badge-pending' : s.status === 'In Transit' ? 'badge-transit' : 'badge-delivered';
      return `<tr>
        <td><span style="font-family:var(--mono);color:var(--accent)">${escapeHtml(s.id)}</span></td>
        <td>${escapeHtml(s.dest)}</td>
        <td><span class="badge ${cls}">${s.status}</span></td>
        <td style="color:var(--text-muted);font-size:12px">${s.added || '—'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteShipment('${escapeHtml(s.id)}')">Delete</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

/* ── CLIENTS ─────────────────────────────────────── */
function addClient() {
  const name = document.getElementById('clientName')?.value.trim() || '';
  const email = document.getElementById('clientEmail')?.value.trim() || '';
  const phone = document.getElementById('clientPhone')?.value.trim() || '';
  
  if (!name || !email) { 
    toast('Name and email are required.', 'error'); 
    return; 
  }
  
  const client = { 
    id: Date.now(), 
    name, 
    email, 
    phone, 
    added: new Date().toLocaleDateString() 
  };
  
  clients.push(client);
  localStorage.setItem('vz_clients', JSON.stringify(clients));
  logActivity(`Client added: ${name} (${email})`);
  
  const nameInput = document.getElementById('clientName');
  const emailInput = document.getElementById('clientEmail');
  const phoneInput = document.getElementById('clientPhone');
  
  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (phoneInput) phoneInput.value = '';
  
  renderClients();
  updateStats();
  toast(`Client "${name}" added.`);
}

function deleteClient(id) {
  const c = clients.find(x => x.id === id);
  clients = clients.filter(x => x.id !== id);
  localStorage.setItem('vz_clients', JSON.stringify(clients));
  if (c) logActivity(`Client removed: ${c.name}`);
  renderClients();
  updateStats();
  toast('Client deleted.', 'error');
}

function renderClients() {
  const el = document.getElementById('clientsTable');
  const countEl = document.getElementById('clientCount');
  
  if (!el) return;
  if (countEl) countEl.textContent = clients.length + ' clients';
  
  if (!clients.length) { 
    el.innerHTML = '<div class="empty-state">NO CLIENTS YET</div>'; 
    return; 
  }
  
  el.innerHTML = `<table>
    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Date Added</th><th></th></tr></thead>
    <tbody>${clients.map(c => `<tr>
      <td>${escapeHtml(c.name)}</td>
      <td style="color:var(--text-muted)">${escapeHtml(c.email)}</td>
      <td style="color:var(--text-muted)">${c.phone || '—'}</td>
      <td style="color:var(--text-muted);font-size:12px">${c.added || '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">Delete</button></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

/* ── STATS ───────────────────────────────────────── */
function updateStats() {
  const totalInv = document.getElementById('totalInventory');
  const totalShip = document.getElementById('totalShipments');
  const totalCli = document.getElementById('totalClients');
  const pendingShip = document.getElementById('pendingShipments');
  
  if (totalInv) totalInv.textContent = inventory.length;
  if (totalShip) totalShip.textContent = shipments.length;
  if (totalCli) totalCli.textContent = clients.length;
  if (pendingShip) pendingShip.textContent = shipments.filter(s => s.status === 'Pending').length;
}

/* ── HELPERS ─────────────────────────────────────── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAll() {
  renderInventory();
  renderShipments();
  renderClients();
  renderActivity();
  updateStats();
}