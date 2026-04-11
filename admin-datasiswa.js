// Ambil referensi ke Firestore
const studentsCollection = db.collection("students");

// State
let currentPage = 1;
const rowsPerPage = 10;
let filterKelas = '';
let searchQuery = '';
let allSiswa = []; // array of { id, nisn, nama, kelas, nama_wali, no_hp, status }

// ======================== LOAD DATA ========================
async function loadSiswa() {
  try {
    const snapshot = await studentsCollection.orderBy("nisn").get();
    allSiswa = [];
    snapshot.forEach(docSnap => {
      allSiswa.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderTable();
  } catch (err) {
    console.error(err);
    alert("Gagal memuat data: " + err.message);
  }
}

// ======================== CRUD ========================
async function addSiswa(data) {
  try {
    await studentsCollection.add(data);
    await loadSiswa();
  } catch (err) { alert("Gagal tambah: " + err.message); }
}

async function updateSiswa(id, data) {
  try {
    await db.collection("students").doc(id).update(data);
    await loadSiswa();
  } catch (err) { alert("Gagal update: " + err.message); }
}

async function deleteSiswa(id, nisn) {
  if (confirm(`Hapus siswa dengan NISN ${nisn}?`)) {
    try {
      await db.collection("students").doc(id).delete();
      await loadSiswa();
    } catch (err) { alert("Gagal hapus: " + err.message); }
  }
}

// ======================== RENDER TABEL ========================
function renderTable() {
  let filtered = [...allSiswa];
  if (filterKelas) filtered = filtered.filter(s => s.kelas === filterKelas);
  if (searchQuery) filtered = filtered.filter(s => s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery));
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start = (currentPage - 1) * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);
  
  const tbody = document.getElementById('siswaTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  paginated.forEach(s => {
    const row = tbody.insertRow();
    row.className = 'hover:bg-slate-50/80 transition-colors';
    row.innerHTML = `
      <td class="py-4 px-6 text-center font-bold text-slate-500 text-sm">${escapeHtml(s.nisn)}</td>
      <td class="py-4 px-6"><div class="font-bold text-slate-800 capitalize">${escapeHtml(s.nama)}</div></td>
      <td class="py-4 px-6 text-center"><span class="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg text-xs border border-blue-100">${escapeHtml(s.kelas)}</span></td>
      <td class="py-4 px-6 text-slate-600 text-sm">${escapeHtml(s.nama_wali)}</td>
      <td class="py-4 px-6 text-slate-600 text-sm">${escapeHtml(s.no_hp || '-')}</td>
      <td class="py-4 px-6 text-center"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${s.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}"><span class="w-1.5 h-1.5 rounded-full ${s.status === 'aktif' ? 'bg-emerald-500' : 'bg-red-500'} mr-1.5"></span>${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
      <td class="py-4 px-6"><div class="flex justify-center space-x-2">
        <button class="edit-btn w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center border border-amber-100" data-id="${s.id}" data-nisn="${escapeHtml(s.nisn)}"><i class="fas fa-pen text-[10px]"></i></button>
        <button class="delete-btn w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center border border-red-100" data-id="${s.id}" data-nisn="${escapeHtml(s.nisn)}"><i class="fas fa-trash-alt text-[10px]"></i></button>
      </div></td>
    `;
  });
  
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editSiswa(btn.dataset.id));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteSiswa(btn.dataset.id, btn.dataset.nisn));
  });
  
  const infoJumlah = document.getElementById('infoJumlah');
  if (infoJumlah) infoJumlah.innerText = `Menampilkan ${total} Siswa`;
  
  const paginationDiv = document.getElementById('pagination');
  if (paginationDiv) {
    paginationDiv.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.innerText = i;
      btn.className = `w-8 h-8 rounded-lg ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'} flex items-center justify-center transition`;
      btn.addEventListener('click', () => { currentPage = i; renderTable(); });
      paginationDiv.appendChild(btn);
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

// ======================== EDIT SISWA ========================
let editingId = null;
function editSiswa(id) {
  const siswa = allSiswa.find(s => s.id === id);
  if (!siswa) return;
  editingId = id;
  document.getElementById('manualNisn').value = siswa.nisn;
  document.getElementById('manualNama').value = siswa.nama;
  document.getElementById('manualKelas').value = siswa.kelas;
  document.getElementById('manualWali').value = siswa.nama_wali;
  document.getElementById('manualNoHp').value = siswa.no_hp || '';
  document.getElementById('manualStatus').value = siswa.status;
  openManualModal();
  const submitBtn = document.querySelector('#manualForm button[type="submit"]');
  if (submitBtn) submitBtn.innerText = 'Update';
}

// ======================== MODAL MANUAL ========================
function openManualModal() { document.getElementById('modalManual').classList.remove('hidden'); }
function closeManualModal() {
  document.getElementById('modalManual').classList.add('hidden');
  document.getElementById('manualForm').reset();
  editingId = null;
  const submitBtn = document.querySelector('#manualForm button[type="submit"]');
  if (submitBtn) submitBtn.innerText = 'Simpan';
}

document.getElementById('btnManualAdd')?.addEventListener('click', () => { editingId = null; openManualModal(); });
document.getElementById('closeManualModalBtn')?.addEventListener('click', closeManualModal);
document.getElementById('cancelManualBtn')?.addEventListener('click', closeManualModal);
document.getElementById('manualForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nisn = document.getElementById('manualNisn').value.trim();
  const nama = document.getElementById('manualNama').value.trim();
  const kelas = document.getElementById('manualKelas').value.trim();
  const wali = document.getElementById('manualWali').value.trim();
  const nohp = document.getElementById('manualNoHp').value.trim();
  const status = document.getElementById('manualStatus').value;
  if (!nisn || !nama || !kelas || !wali) { alert('Isi semua field wajib!'); return; }
  const duplicate = allSiswa.some(s => s.nisn === nisn && s.id !== editingId);
  if (duplicate) { alert(`NISN ${nisn} sudah ada!`); return; }
  const data = { nisn, nama, kelas, nama_wali: wali, no_hp: nohp, status };
  if (editingId) {
    await updateSiswa(editingId, data);
  } else {
    await addSiswa(data);
  }
  closeManualModal();
});

// ======================== IMPORT EXCEL (sama seperti sebelumnya, tapi tanpa import) ========================
let parsedExcelData = [];
const modalImport = document.getElementById('modalImport');
const fileInputExcel = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const confirmImportBtn = document.getElementById('confirmImportBtn');

document.getElementById('btnImportBulk')?.addEventListener('click', () => modalImport?.classList.remove('hidden'));
document.getElementById('closeModalBtn')?.addEventListener('click', () => modalImport?.classList.add('hidden'));
document.getElementById('cancelImportBtn')?.addEventListener('click', () => { previewContainer.classList.add('hidden'); fileInputExcel.value = ''; parsedExcelData = []; });
uploadArea?.addEventListener('click', () => fileInputExcel.click());
fileInputExcel?.addEventListener('change', (e) => { if (e.target.files.length) processExcelFile(e.target.files[0]); });

function processExcelFile(file) {
  const reader = new FileReader();
  reader.onload = function(ev) {
    const data = new Uint8Array(ev.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!rows || rows.length < 2) { alert('File kosong'); return; }
    const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
    const required = ['nisn', 'nama', 'kelas', 'nama_wali'];
    const missing = required.filter(f => !headers.includes(f));
    if (missing.length) { alert(`Header kurang: ${missing.join(', ')}`); return; }
    const idx = { nisn: headers.indexOf('nisn'), nama: headers.indexOf('nama'), kelas: headers.indexOf('kelas'), nama_wali: headers.indexOf('nama_wali'), no_hp: headers.indexOf('no_hp'), status: headers.indexOf('status') };
    parsedExcelData = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const nisn = row[idx.nisn] ? String(row[idx.nisn]).trim() : '';
      if (!nisn) continue;
      parsedExcelData.push({
        nisn, nama: row[idx.nama]?.trim() || '', kelas: row[idx.kelas]?.trim() || '',
        nama_wali: row[idx.nama_wali]?.trim() || '', no_hp: row[idx.no_hp]?.trim() || '',
        status: row[idx.status] ? String(row[idx.status]).trim().toLowerCase() : 'aktif'
      });
    }
    if (parsedExcelData.length) showExcelPreview(parsedExcelData.slice(0,10));
    else alert('Tidak ada data valid');
  };
  reader.readAsArrayBuffer(file);
}

function showExcelPreview(data) {
  const thead = document.querySelector('#previewTable thead');
  const tbody = document.querySelector('#previewTable tbody');
  thead.innerHTML = '<tr><th>NISN</th><th>Nama</th><th>Kelas</th><th>Wali</th><th>No HP</th><th>Status</th></tr>';
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="px-4 py-2">${escapeHtml(row.nisn)}</td><td class="px-4 py-2">${escapeHtml(row.nama)}</td><td class="px-4 py-2">${escapeHtml(row.kelas)}</td><td class="px-4 py-2">${escapeHtml(row.nama_wali)}</td><td class="px-4 py-2">${escapeHtml(row.no_hp)}</td><td class="px-4 py-2">${escapeHtml(row.status)}</td>`;
    tbody.appendChild(tr);
  });
  previewContainer.classList.remove('hidden');
}

confirmImportBtn?.addEventListener('click', async () => {
  if (!parsedExcelData.length) return;
  let added = 0;
  for (const s of parsedExcelData) {
    if (!allSiswa.some(ex => ex.nisn === s.nisn)) {
      await studentsCollection.add(s);
      added++;
    }
  }
  alert(`Berhasil menambah ${added} data baru.`);
  await loadSiswa();
  modalImport.classList.add('hidden');
  previewContainer.classList.add('hidden');
  parsedExcelData = [];
  fileInputExcel.value = '';
});


// ======================== TEMPEL JSON ========================
const modalPaste = document.getElementById('modalPasteJson');
const jsonPasteArea = document.getElementById('jsonPasteArea');
document.getElementById('btnPasteJson')?.addEventListener('click', () => modalPaste?.classList.remove('hidden'));
document.getElementById('closePasteModalBtn')?.addEventListener('click', () => modalPaste?.classList.add('hidden'));
document.getElementById('cancelPasteBtn')?.addEventListener('click', () => modalPaste?.classList.add('hidden'));
document.getElementById('confirmPasteBtn')?.addEventListener('click', async () => {
  try {
    const raw = jsonPasteArea.value.trim();
    if (!raw) throw new Error('Kosong');
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error('Harus array');
    let added = 0;
    for (const item of arr) {
      if (!item.nisn || !item.nama || !item.kelas || !item.nama_wali) continue;
      if (!allSiswa.some(ex => ex.nisn === item.nisn)) {
        await studentsCollection.add({ ...item, no_hp: item.no_hp || '', status: (item.status || 'aktif').toLowerCase() });
        added++;
      }
    }
    alert(`Berhasil menambah ${added} data.`);
    await loadSiswa();
    modalPaste.classList.add('hidden');
    jsonPasteArea.value = '';
  } catch(e) { alert('JSON tidak valid: ' + e.message); }
});

// ======================== FILTER & SEARCH ========================
document.getElementById('filterKelas')?.addEventListener('change', (e) => { filterKelas = e.target.value; currentPage = 1; renderTable(); });
document.getElementById('searchInput')?.addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; renderTable(); });

// ======================== PROFILE DROPDOWN ========================
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
profileBtn?.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('hidden'); });
window.addEventListener('click', (e) => { if (!profileBtn?.contains(e.target) && !profileDropdown?.contains(e.target)) profileDropdown?.classList.add('hidden'); });

// ======================== MULAI ========================
loadSiswa();