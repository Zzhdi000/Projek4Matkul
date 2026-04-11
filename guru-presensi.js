// ==================== GURU PRESENSI - SEMUA FUNGSI ====================
// Data dari localStorage (di-set saat login)
const userName = localStorage.getItem("userName");
const guruwaliKelas = localStorage.getItem("waliKelas"); // null jika bukan wali kelas

// Elemen DOM
const bodyDaftar = document.getElementById("body-daftar");
const bodyRekap = document.getElementById("body-rekap");
const searchInput = document.getElementById("search-input");
const dateInput = document.querySelector('input[type="date"]');

// State
let currentTab = "daftar";
let allSiswa = [];
let currentKelasFilter = guruwaliKelas ? guruwaliKelas : "all";
let selectedDate = dateInput ? dateInput.value : new Date().toISOString().slice(0,10);


// ==================== HELPER ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

// ==================== PROFILE DROPDOWN ====================
function resetDropdown() {
    const dropdownContent = document.getElementById("dropdownContent"); 
    if (!dropdownContent) return;
    dropdownContent.innerHTML = `
        <div class="animate-fadeIn">
            <label class="text-[10px] font-bold text-slate-400 uppercase ml-2">Mata Pelajaran</label>
            <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 mb-3 cursor-not-allowed">Bahasa Indonesia</div>
            <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Password Guru</label>
            <div class="relative w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex items-center justify-between mb-3">
                <span id="passText" class="text-sm font-bold text-slate-500 select-none">••••••••</span>
                <button onclick="window.toggleViewPassword(event, 'passText', 'eyeIconFront')" class="text-slate-300 hover:text-blue-500 transition"><i id="eyeIconFront" class="fas fa-eye text-xs"></i></button>
            </div>
            <button onclick="window.ubahKeFormPassword(event)" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-200 mt-2">Update Password</button>
            <hr class="border-slate-50 my-2">
            <a href="login.html" class="flex items-center justify-center text-red-500 text-[11px] font-bold hover:bg-red-50 py-2 rounded-lg transition uppercase"><i class="fas fa-sign-out-alt mr-2"></i> KELUAR SISTEM</a>
        </div>`;
}

window.ubahKeFormPassword = function(e) {
    if (e) e.stopPropagation();
    const dropdownContent = document.getElementById("dropdownContent");
    if (!dropdownContent) return;
    dropdownContent.innerHTML = `
        <div class="animate-fadeIn">
            <div class="flex items-center mb-4"><button onclick="window.resetDropdown(event)" class="text-slate-400 hover:text-slate-800 mr-2"><i class="fas fa-arrow-left text-xs"></i></button><h4 class="text-xs font-black text-slate-800 uppercase">Ganti Password</h4></div>
            <input type="password" id="oldPass" placeholder="Password Lama" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500">
            <input type="password" id="newPass" placeholder="Password Baru" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="window.simpanDanReset(event)" class="w-full bg-slate-800 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold transition uppercase">Simpan</button>
        </div>`;
};

window.simpanDanReset = function(e) {
    if (e) e.stopPropagation();
    Swal.fire({ title: "Berhasil!", text: "Password diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
    resetDropdown();
    const profileDropdown = document.getElementById("profileDropdown");
    if (profileDropdown) profileDropdown.classList.add("hidden");
};

window.toggleViewPassword = function(event, targetId, iconId) {
    if (event) event.stopPropagation();
    const target = document.getElementById(targetId);
    const icon = document.getElementById(iconId);
    if (target && icon) {
        if (target.innerText === "••••••••") {
            target.innerText = "admin123";
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            target.innerText = "••••••••";
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
};

// Event profile button
const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");
if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("hidden");
        if (!profileDropdown.classList.contains("hidden")) resetDropdown();
    });
    window.addEventListener("click", (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.add("hidden");
        }
    });
}

// Update nama guru di header
if (userName) {
    const namaElem = document.querySelector("#profileBtn .text-right p:last-child");
    if (namaElem) namaElem.innerText = userName;
    const inisial = userName.split(" ").map(n => n[0]).join("").substring(0,2);
    const avatarElem = document.querySelector("#profileBtn .rounded-full");
    if (avatarElem) avatarElem.innerText = inisial;
}

// ==================== LOAD SISWA (untuk tab daftar) ====================
async function loadSiswaForPresensi() {
    let query = db.collection("students").orderBy("nama", "asc");
    if (guruwaliKelas) {
        query = query.where("kelas", "==", guruwaliKelas);
    } else {
        if (currentKelasFilter !== "all") {
            query = query.where("kelas", "==", currentKelasFilter);
        }
    }
    const snapshot = await query.get();
    allSiswa = [];
    snapshot.forEach(doc => allSiswa.push({ id: doc.id, ...doc.data() }));
    renderDaftarSiswa();
}

function renderDaftarSiswa() {
    const tbody = document.querySelector("#content-daftar table tbody");
    if (!tbody) return;
    let filtered = [...allSiswa];
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(s => s.nama.toLowerCase().includes(searchTerm) || (s.nisn && s.nisn.includes(searchTerm)));
    }
    tbody.innerHTML = '';
    filtered.forEach((siswa, idx) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td class="px-6 py-3 text-center w-16">${idx+1}</td>
            <td class="px-6 py-3">
                <div class="font-bold text-slate-700">${escapeHtml(siswa.nama)}</div>
                <div class="text-[10px] text-slate-400">NISN: ${siswa.nisn || '-'}</div>
            </td>
            <td class="px-6 py-3 text-right pr-14">
                <div class="flex items-center justify-end gap-3" data-id="${siswa.id}">
                    <label class="inline-flex items-center gap-1 text-xs"><input type="radio" name="presensi_${siswa.id}" value="hadir" checked class="w-3 h-3"> <span>✅ Hadir</span></label>
                    <label class="inline-flex items-center gap-1 text-xs"><input type="radio" name="presensi_${siswa.id}" value="izin" class="w-3 h-3"> <span>📝 Izin</span></label>
                    <label class="inline-flex items-center gap-1 text-xs"><input type="radio" name="presensi_${siswa.id}" value="sakit" class="w-3 h-3"> <span>🤒 Sakit</span></label>
                    <label class="inline-flex items-center gap-1 text-xs"><input type="radio" name="presensi_${siswa.id}" value="alfa" class="w-3 h-3"> <span>❌ Alfa</span></label>
                </div>
            </td>
        `;
    });
}

// ==================== REKAPITULASI PRESENSI ====================
async function loadRekap() {
    // Ambil semua data presensi dari Firestore (collection "presensi")
    const snapshot = await db.collection("presensi").get();
    const presensiMap = new Map(); // key: siswaId, value: object { hadir, izin, sakit, alfa }
    snapshot.forEach(doc => {
        const data = doc.data();
        const siswaId = data.siswaId;
        const status = data.status;
        if (!presensiMap.has(siswaId)) {
            presensiMap.set(siswaId, { hadir: 0, izin: 0, sakit: 0, alfa: 0 });
        }
        const counts = presensiMap.get(siswaId);
        if (status === 'hadir') counts.hadir++;
        else if (status === 'izin') counts.izin++;
        else if (status === 'sakit') counts.sakit++;
        else if (status === 'alfa') counts.alfa++;
        presensiMap.set(siswaId, counts);
    });

    // Ambil data siswa (filter sesuai kelas jika perlu)
    let siswaQuery = db.collection("students").orderBy("nama", "asc");
    if (guruwaliKelas) {
        siswaQuery = siswaQuery.where("kelas", "==", guruwaliKelas);
    } else {
        if (currentKelasFilter !== "all") {
            siswaQuery = siswaQuery.where("kelas", "==", currentKelasFilter);
        }
    }
    const siswaSnapshot = await siswaQuery.get();
    const tbody = document.querySelector("#content-rekap table tbody");
    if (!tbody) return;
    tbody.innerHTML = '';
    siswaSnapshot.forEach(doc => {
        const siswa = doc.data();
        const id = doc.id;
        const counts = presensiMap.get(id) || { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
        const total = counts.hadir + counts.izin + counts.sakit + counts.alfa;
        const row = tbody.insertRow();
        row.innerHTML = `
             <td class="px-6 py-3 rounded-l-xl bg-white border border-slate-100">${siswa.nisn || '-'}</td>
            <td class="px-6 py-3 bg-white border border-slate-100 font-bold">${escapeHtml(siswa.nama)}</td>
            <td class="px-4 py-3 text-center bg-emerald-50 text-emerald-700 font-bold">${counts.hadir}</td>
            <td class="px-4 py-3 text-center bg-amber-50 text-amber-700 font-bold">${counts.izin}</td>
            <td class="px-4 py-3 text-center bg-blue-50 text-blue-700 font-bold">${counts.sakit}</td>
            <td class="px-4 py-3 text-center bg-red-50 text-red-600 font-bold">${counts.alfa}</td>
            <td class="px-6 py-3 text-center bg-slate-50 font-bold">${total}</td>
            <td class="px-6 py-3 text-center rounded-r-xl bg-slate-50">
                <button onclick="lihatDetailPresensi('${id}')" class="text-blue-500 hover:text-blue-700"><i class="fas fa-eye"></i></button>
            </td>
        `;
    });
}


// Fungsi untuk melihat detail presensi per siswa (opsional)
window.lihatDetailPresensi = async function(siswaId) {
    const siswaDoc = await db.collection("students").doc(siswaId).get();
    const siswa = siswaDoc.data();
    const snapshot = await db.collection("presensi")
        .where("siswaId", "==", siswaId)
        .orderBy("tanggal", "desc")
        .get();
    let html = `<div class="text-left font-bold mb-2">${escapeHtml(siswa.nama)} (NISN: ${siswa.nisn})</div><ul class="text-left">`;
    snapshot.forEach(doc => {
        const data = doc.data();
        html += `<li><strong>${data.tanggal}</strong>: ${data.status}</li>`;
    });
    html += '</ul>';
    Swal.fire({
        title: "Detail Presensi",
        html: html,
        customClass: { popup: "rounded-2xl" }
    });
};
    

// ==================== SIMPAN PRESENSI ====================
window.handleSave = async function() {
    const selects = document.querySelectorAll('.presensi-select');
    const today = selectedDate;
    const batch = db.batch();
    for (let select of selects) {
        const siswaId = select.dataset.id;
        const status = select.value;
        // Cek apakah sudah ada presensi hari ini untuk siswa ini
        const existing = await db.collection("presensi")
            .where("siswaId", "==", siswaId)
            .where("tanggal", "==", today)
            .get();
        if (!existing.empty) {
            // Update dokumen yang ada
            const docRef = existing.docs[0].ref;
            batch.update(docRef, { status: status, updatedAt: new Date() });
        } else {
            // Tambah baru
            const newRef = db.collection("presensi").doc();
            batch.set(newRef, {
                siswaId: siswaId,
                tanggal: today,
                status: status,
                createdAt: new Date()
            });
        }
    }
    await batch.commit();
    Swal.fire("Berhasil!", "Presensi hari ini telah disimpan.", "success");
    // Refresh rekap jika tab rekap aktif
    if (currentTab === "rekap") loadRekap();
};

// ==================== TAB SWITCHING ====================
window.switchTab = function(tab) {
    currentTab = tab;
    const dTab = document.getElementById("tab-daftar");
    const rTab = document.getElementById("tab-rekap");
    const dCont = document.getElementById("content-daftar");
    const rCont = document.getElementById("content-rekap");
    if (tab === "daftar") {
        dTab.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white transition-all";
        rTab.className = "px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all";
        dCont.classList.remove("hidden");
        rCont.classList.add("hidden");
        loadSiswaForPresensi();
    } else {
        rTab.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white transition-all";
        dTab.className = "px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all";
        rCont.classList.remove("hidden");
        dCont.classList.add("hidden");
        loadRekap();
    }
};

// ==================== FILTER KELAS UNTUK GURU MAPEL ====================
function addKelasFilter() {
    if (guruwaliKelas) return; // wali kelas tidak perlu filter
    const headerDiv = document.querySelector("header .flex.items-center.gap-4");
    if (!headerDiv) return;
    const select = document.createElement("select");
    select.id = "filter-kelas-global";
    select.className = "p-2 bg-slate-100 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";
    select.innerHTML = `
        <option value="all">Semua Kelas</option>
        <option value="1-A">Kelas 1-A</option><option value="1-B">1-B</option>
        <option value="2-A">2-A</option><option value="2-B">2-B</option>
        <option value="3-A">3-A</option><option value="3-B">3-B</option>
        <option value="4-A">4-A</option><option value="4-B">4-B</option>
        <option value="5-A">5-A</option><option value="5-B">5-B</option>
        <option value="6-A">6-A</option><option value="6-B">6-B</option>
    `;
    select.addEventListener("change", (e) => {
        currentKelasFilter = e.target.value;
        if (currentTab === "daftar") loadSiswaForPresensi();
        else loadRekap();
    });
    headerDiv.appendChild(select);
}

// ==================== SEARCH EVENT ====================
if (searchInput) {
    searchInput.addEventListener("input", () => {
        if (currentTab === "daftar") renderDaftarSiswa();
    });
}

// ==================== DATE CHANGE ====================
if (dateInput) {
    dateInput.addEventListener("change", (e) => {
        selectedDate = e.target.value;
        // Tidak perlu reload data, hanya simpan untuk saat simpan
    });
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", () => {
    addKelasFilter();
    // Set tanggal default hari ini
    if (dateInput) {
        const today = new Date().toISOString().slice(0,10);
        dateInput.value = today;
        selectedDate = today;
    }
    loadSiswaForPresensi();
    // Pastikan tab daftar aktif
    switchTab("daftar");
});