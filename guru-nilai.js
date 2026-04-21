// ==================== GURU NILAI - FINAL (SEMUA FITUR) ====================

// ==================== DATA GURU DARI LOCALSTORAGE ====================
let guruData = {
    nama: localStorage.getItem("userName") || "Guru",
    role: localStorage.getItem("userRole") || "guru",
    waliKelas: localStorage.getItem("waliKelas") || "",
    userId: localStorage.getItem("userId") || "",
    mapel: localStorage.getItem("userMapel") || "Matematika",
    email: ""
};

// ==================== UPDATE HEADER PROFILE ====================
function updateHeaderProfile() {
    const namaHeader = document.querySelector("#profileBtn .text-right p:last-child");
    if (namaHeader && guruData.nama) namaHeader.innerText = guruData.nama;
    const avatarHeader = document.querySelector("#profileBtn .rounded-full");
    if (avatarHeader && guruData.nama) {
        const inisial = guruData.nama.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
        avatarHeader.innerText = inisial;
    }
    const avatarDropdown = document.querySelector("#profileDropdown .w-16.h-16");
    if (avatarDropdown && guruData.nama) {
        const inisial = guruData.nama.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
        avatarDropdown.innerText = inisial;
    }
    const namaDropdown = document.querySelector("#profileDropdown h4");
    if (namaDropdown && guruData.nama) namaDropdown.innerText = guruData.nama;
}

// ==================== RENDER DROPDOWN PROFILE ====================
function renderProfileDropdown() {
    const dropdownContent = document.getElementById("dropdownContent");
    if (!dropdownContent) return;
    const isWaliKelas = (guruData.waliKelas && guruData.waliKelas !== "");
    const tugasText = isWaliKelas ? `Wali Kelas ${guruData.waliKelas}` : (guruData.mapel !== "-" ? guruData.mapel : "Guru Mata Pelajaran");
    const emailText = guruData.email || "email@sekolah.com";
    dropdownContent.innerHTML = `
        <div class="animate-fadeIn">
            <div class="mb-3">
                <label class="text-[10px] font-bold text-slate-400 uppercase ml-2">Tugas</label>
                <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 cursor-not-allowed">${escapeHtml(tugasText)}</div>
            </div>
            <div class="mb-3">
                <label class="text-[10px] font-bold text-slate-400 uppercase ml-2">Email</label>
                <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 cursor-not-allowed">${escapeHtml(emailText)}</div>
            </div>
            <button onclick="window.openChangePasswordForm(event)" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-200 mt-2">Ganti Password</button>
            <hr class="border-slate-50 my-2">
            <a href="login.html" class="flex items-center justify-center text-red-500 text-[11px] font-bold hover:bg-red-50 py-2 rounded-lg transition uppercase"><i class="fas fa-sign-out-alt mr-2"></i> KELUAR SISTEM</a>
        </div>`;
}

// ==================== FORM GANTI PASSWORD & LUPA PASSWORD ====================
window.openChangePasswordForm = function(e) {
    if (e) e.stopPropagation();
    const dropdownContent = document.getElementById("dropdownContent");
    if (!dropdownContent) return;
    dropdownContent.innerHTML = `
        <div class="animate-fadeIn">
            <div class="flex items-center mb-4">
                <button onclick="window.renderProfileDropdown(); event.stopPropagation();" class="text-slate-400 hover:text-slate-800 mr-2"><i class="fas fa-arrow-left text-xs"></i></button>
                <h4 class="text-xs font-black text-slate-800 uppercase">Ganti Password</h4>
            </div>
            <div class="mb-3 relative">
                <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Password Lama</label>
                <div class="relative">
                    <input type="password" id="oldPass" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm pr-10 outline-none focus:ring-2 focus:ring-blue-500">
                    <button type="button" onclick="window.togglePasswordField('oldPass', this)" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"><i class="fas fa-eye text-xs"></i></button>
                </div>
            </div>
            <div class="mb-3 relative">
                <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Password Baru</label>
                <div class="relative">
                    <input type="password" id="newPass" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm pr-10 outline-none focus:ring-2 focus:ring-blue-500">
                    <button type="button" onclick="window.togglePasswordField('newPass', this)" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"><i class="fas fa-eye text-xs"></i></button>
                </div>
            </div>
            <div class="mb-2 relative">
                <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Konfirmasi Password Baru</label>
                <div class="relative">
                    <input type="password" id="confirmPass" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm pr-10 outline-none focus:ring-2 focus:ring-blue-500">
                    <button type="button" onclick="window.togglePasswordField('confirmPass', this)" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"><i class="fas fa-eye text-xs"></i></button>
                </div>
            </div>
            <div class="text-right mb-3">
                <a href="#" onclick="window.forgotPassword(event)" class="text-[10px] text-blue-500 hover:underline">Lupa password?</a>
            </div>
            <button onclick="window.submitChangePassword(); event.stopPropagation();" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition uppercase">Simpan Password Baru</button>
        </div>`;
};

window.togglePasswordField = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector('i');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

window.submitChangePassword = async function(e) {
    if (e) e.stopPropagation();
    const oldPass = document.getElementById("oldPass").value;
    const newPass = document.getElementById("newPass").value;
    const confirmPass = document.getElementById("confirmPass").value;
    if (!oldPass || !newPass || !confirmPass) {
        Swal.fire("Error", "Semua field harus diisi", "error");
        return;
    }
    if (newPass.length < 6) {
        Swal.fire("Error", "Password baru minimal 6 karakter", "error");
        return;
    }
    if (newPass !== confirmPass) {
        Swal.fire("Error", "Password baru dan konfirmasi tidak cocok", "error");
        return;
    }
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error("User tidak terautentikasi");
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPass);
        Swal.fire({ title: "Berhasil!", text: "Password telah diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
        renderProfileDropdown();
        const profileDropdown = document.getElementById("profileDropdown");
        if (profileDropdown) profileDropdown.classList.add("hidden");
    } catch (error) {
        let pesan = "Gagal mengganti password. Periksa password lama.";
        if (error.code === 'auth/wrong-password') pesan = "Password lama salah.";
        Swal.fire("Error", pesan, "error");
    }
};

window.forgotPassword = async function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    try {
        const user = firebase.auth().currentUser;
        if (!user || !user.email) {
            Swal.fire("Error", "Email user tidak ditemukan.", "error");
            return;
        }
        await firebase.auth().sendPasswordResetEmail(user.email);
        Swal.fire({
            title: "Email Terkirim!",
            text: `Link reset password telah dikirim ke ${user.email}. Cek inbox atau folder spam.`,
            icon: "success",
            confirmButtonText: "OK"
        });
        setTimeout(() => { renderProfileDropdown(); }, 2000);
    } catch (error) {
        Swal.fire("Error", "Gagal mengirim email reset. " + error.message, "error");
    }
};

// Event profile button
const profileBtn = document.getElementById("profileBtn");
const profileDropdownElem = document.getElementById("profileDropdown");
if (profileBtn && profileDropdownElem) {
    profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdownElem.classList.toggle("hidden");
        if (!profileDropdownElem.classList.contains("hidden")) renderProfileDropdown();
    });
    window.addEventListener("click", (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdownElem.contains(e.target)) {
            profileDropdownElem.classList.add("hidden");
        }
    });
}

// ==================== SEMUA FUNGSI NILAI ====================
const userName = localStorage.getItem("userName");
const guruwaliKelas = localStorage.getItem("waliKelas");

const searchInput = document.getElementById("search-siswa");
const filterKelasSelect = document.getElementById("filter-kelas");
const filterSemesterSelect = document.getElementById("filter-semester");
const filterMapelSelect = document.getElementById("filter-mapel");
const tableBody = document.getElementById("table-body-nilai");
const btnSimpan = document.getElementById("btn-simpan-nilai");
const btnExportPDF = document.getElementById("export-pdf-btn");

let allSiswa = [];
let allNilai = [];
let currentKelas = "all";
let currentSemester = "Ganjil";
let currentMapel = guruData.mapel !== "-" ? guruData.mapel : "Matematika";
let currentUserRole = guruwaliKelas ? "walas" : "mapel";

let GEMINI_API_KEY = localStorage.getItem("gemini_api_key");
const GEMINI_MODEL = "gemini-2.5-flash";

function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

async function askGemini(prompt) {
    if (!GEMINI_API_KEY) return null;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    try {
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 150 } }) });
        if (response.status === 429) {
            const errorData = await response.json();
            console.warn("Quota exceeded:", errorData);
            Swal.fire({ title: "Kuota API Habis", text: "Coba lagi setelah beberapa menit, atau gunakan API Key lain.", icon: "warning", confirmButtonText: "Ganti API Key", showCancelButton: true, cancelButtonText: "Tutup" }).then((result) => { if (result.isConfirmed) { localStorage.removeItem("gemini_api_key"); GEMINI_API_KEY = null; location.reload(); } });
            return null;
        }
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (err) {
        console.error("Gemini error:", err);
        return null;
    }
}

async function generateNaratifWithAI(siswa, nilai) {
    const { nama, nisn, kelas } = siswa;
    const uh1 = nilai.uh1 || 0;
    const uh2 = nilai.uh2 || 0;
    const uts = nilai.uts || 0;
    const rata = (uh1 + uh2 + uts) / 3;
    let tren = "";
    if (uh2 > uh1 && uts > uh2) tren = "meningkat pesat";
    else if (uh2 > uh1) tren = "meningkat, perlu konsistensi di UTS";
    else if (uh2 < uh1 && uts < uh2) tren = "menurun drastis";
    else if (uh2 < uh1) tren = "menurun, perlu perhatian";
    else tren = "stagnan, belum ada peningkatan signifikan";

    const prompt = `Anda adalah guru yang memberikan evaluasi singkat untuk rapor siswa.
Nama: ${nama} (NISN: ${nisn}), Kelas: ${kelas}
Nilai: UH1=${uh1}, UH2=${uh2}, UTS=${uts}, Rata-rata=${rata.toFixed(1)}
Tren: ${tren}
Buat evaluasi maksimal 50 kata yang mencakup:
- Apresiasi jika ada peningkatan
- Catatan jika nilai kurang atau menurun
- Saran belajar yang spesifik (misal: lebih giat latihan soal, bimbingan orang tua, dll)
Jangan gunakan kata "berdasarkan data" atau "AI". Tulis seperti guru asli.`;

    const result = await askGemini(prompt);
    if (result) return result;
    if (rata >= 85) return "Sangat baik, pertahankan prestasinya! Terus tingkatkan latihan soal.";
    if (rata >= 70) return "Baik, masih ada ruang peningkatan. Fokus pada materi yang kurang dikuasai.";
    if (rata >= 60) return "Cukup, perlu bimbingan lebih intensif dan mengulang materi.";
    return "Perlu perhatian khusus, konsultasikan dengan guru dan orang tua.";
}

function fallbackNaratif(siswa, nilai) {
    const rata = (nilai.uh1 + nilai.uh2 + nilai.uts) / 3;
    if (rata >= 85) return "Sangat baik, pertahankan prestasinya! Terus tingkatkan latihan soal.";
    if (rata >= 70) return "Baik, masih ada ruang peningkatan. Fokus pada materi yang kurang dikuasai.";
    if (rata >= 60) return "Cukup, perlu bimbingan lebih intensif dan mengulang materi.";
    return "Perlu perhatian khusus, konsultasikan dengan guru dan orang tua.";
}

async function loadSiswa() {
    let query = db.collection("students").orderBy("nama", "asc");
    if (currentUserRole === "walas") {
        query = query.where("kelas", "==", guruwaliKelas);
    } else if (currentKelas !== "all") {
        query = query.where("kelas", "==", currentKelas);
    }
    const snapshot = await query.get();
    allSiswa = [];
    snapshot.forEach(doc => allSiswa.push({ id: doc.id, ...doc.data() }));
    await loadNilai();
}

async function loadNilai() {
    if (allSiswa.length === 0) { renderTable(); return; }
    const siswaIds = allSiswa.map(s => s.id);
    allNilai = [];
    const chunks = chunkArray(siswaIds, 30);
    for (const chunk of chunks) {
        const nilaiSnapshot = await db.collection("nilai")
            .where("siswaId", "in", chunk)
            .where("semester", "==", currentSemester)
            .where("mapel", "==", currentMapel)
            .get();
        nilaiSnapshot.forEach(doc => allNilai.push({ id: doc.id, ...doc.data() }));
    }
    renderTable();
} 

function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    let filtered = [...allSiswa];
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(s => s.nama.toLowerCase().includes(searchTerm) || (s.nisn && s.nisn.includes(searchTerm)));
    }
    filtered.forEach(siswa => {
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 };
        const rata = ((nilai.uh1 || 0) + (nilai.uh2 || 0) + (nilai.uts || 0)) / 3;
        const rataBulat = Math.round(rata * 10) / 10;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td class="px-6 py-3">${siswa.nisn || '-'}</td>
            <td class="px-6 py-3 font-bold">${escapeHtml(siswa.nama)}</td>
            <td class="px-6 py-3 text-center">${siswa.kelas}</td>
            <td class="px-6 py-3 text-center"><input type="number" class="nilai-input w-20 text-center border rounded-lg px-2 py-1" data-siswa="${siswa.id}" data-field="uh1" value="${nilai.uh1 || 0}" min="0" max="100" step="0.1"></td>
            <td class="px-6 py-3 text-center"><input type="number" class="nilai-input w-20 text-center border rounded-lg px-2 py-1" data-siswa="${siswa.id}" data-field="uh2" value="${nilai.uh2 || 0}" min="0" max="100" step="0.1"></td>
            <td class="px-6 py-3 text-center"><input type="number" class="nilai-input w-20 text-center border rounded-lg px-2 py-1" data-siswa="${siswa.id}" data-field="uts" value="${nilai.uts || 0}" min="0" max="100" step="0.1"></td>
            <td class="px-6 py-3 text-center font-bold rata-rata" data-siswa="${siswa.id}">${rataBulat}</td>
            <td class="px-6 py-3 text-center">
                <button class="text-blue-500 hover:text-blue-700 btn-detail mr-2" data-siswa="${siswa.id}"><i class="fas fa-chart-line"></i></button>
                <button class="text-emerald-500 hover:text-emerald-700 btn-print-rapor" data-siswa="${siswa.id}"><i class="fas fa-print"></i></button>
            </td>
        `;
    });
    
    // Event listener untuk input nilai (update rata-rata)
    document.querySelectorAll('.nilai-input').forEach(inp => {
        inp.removeEventListener('input', handleNilaiInput);
        inp.addEventListener('input', handleNilaiInput);
    });
    
    // Event listener untuk tombol detail
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.removeEventListener('click', handleDetailClick);
        btn.addEventListener('click', handleDetailClick);
    });
    
    // Event listener untuk tombol print (gunakan event delegation atau langsung attach)
    document.querySelectorAll('.btn-print-rapor').forEach(btn => {
        btn.removeEventListener('click', handlePrintClick);
        btn.addEventListener('click', handlePrintClick);
    });
}

// Handler functions
function handleNilaiInput(e) {
    const input = e.currentTarget;
    const siswaId = input.dataset.siswa;
    const row = input.closest('tr');
    const uh1 = parseFloat(row.querySelector('input[data-field="uh1"]').value) || 0;
    const uh2 = parseFloat(row.querySelector('input[data-field="uh2"]').value) || 0;
    const uts = parseFloat(row.querySelector('input[data-field="uts"]').value) || 0;
    const rata = (uh1 + uh2 + uts) / 3;
    row.querySelector('.rata-rata').innerText = Math.round(rata * 10) / 10;
}

function handleDetailClick(e) {
    const btn = e.currentTarget;
    const siswaId = btn.dataset.siswa;
    showDetailSiswa(siswaId);
}

function handlePrintClick(e) {
    const btn = e.currentTarget;
    const siswaId = btn.dataset.siswa;
    if (siswaId) {
        exportSingleStudentPDF(siswaId);
    }
}

async function showDetailSiswa(siswaId) {
    const siswa = allSiswa.find(s => s.id === siswaId);
    if (!siswa) return;
    const nilai = allNilai.find(n => n.siswaId === siswaId) || { uh1: 0, uh2: 0, uts: 0 };
    Swal.fire({
        title: `Detail Nilai ${siswa.nama}`,
        html: `
            <div class="text-left">
                <p><strong>NISN:</strong> ${siswa.nisn}</p>
                <p><strong>Kelas:</strong> ${siswa.kelas}</p>
                <p><strong>Semester:</strong> ${currentSemester}</p>
                <p><strong>Mapel:</strong> ${currentMapel}</p>
                <hr class="my-2">
                <p><strong>UH1:</strong> ${nilai.uh1 || 0}</p>
                <p><strong>UH2:</strong> ${nilai.uh2 || 0}</p>
                <p><strong>UTS:</strong> ${nilai.uts || 0}</p>
                <p><strong>Rata-rata:</strong> ${((nilai.uh1||0)+(nilai.uh2||0)+(nilai.uts||0))/3}</p>
            </div>
        `,
        customClass: { popup: "rounded-2xl" }
    });
}

async function simpanNilai() {
    const rows = document.querySelectorAll('#table-body-nilai tr');
    const batch = db.batch();
    for (let row of rows) {
        const siswaId = row.querySelector('.nilai-input')?.dataset.siswa;
        if (!siswaId) continue;
        const uh1 = parseFloat(row.querySelector('input[data-field="uh1"]').value) || 0;
        const uh2 = parseFloat(row.querySelector('input[data-field="uh2"]').value) || 0;
        const uts = parseFloat(row.querySelector('input[data-field="uts"]').value) || 0;
        const rataRata = (uh1 + uh2 + uts) / 3;
        const existing = allNilai.find(n => n.siswaId === siswaId);
        if (existing) {
            batch.update(db.collection("nilai").doc(existing.id), { uh1, uh2, uts, rataRata, updatedAt: new Date() });
        } else {
            const newRef = db.collection("nilai").doc();
            batch.set(newRef, { siswaId, kelas: allSiswa.find(s => s.id === siswaId)?.kelas, semester: currentSemester, mapel: currentMapel, uh1, uh2, uts, rataRata, createdAt: new Date() });
        }
    }
    await batch.commit();
    Swal.fire("Berhasil!", "Data nilai telah disimpan.", "success");
    await loadNilai();
}

function showNaratifEditorModal(results) {
    return new Promise((resolve) => {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modalDiv.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
                <div class="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                    <h3 class="text-xl font-bold">Edit Evaluasi Sebelum Export PDF</h3>
                    <button id="closeModalEdit" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-4">
                    <table class="w-full text-sm border">
                        <thead class="bg-slate-100"><tr><th class="p-2">Nama</th><th class="p-2">NISN</th><th class="p-2 w-1/2">Evaluasi (Klik untuk edit)</th></tr></thead>
                        <tbody id="naratif-editor-body"></tbody>
                    </table>
                </div>
                <div class="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
                    <button id="cancelEditBtn" class="px-4 py-2 border rounded-xl">Batal</button>
                    <button id="generatePdfBtn" class="px-4 py-2 bg-blue-600 text-white rounded-xl">Generate PDF</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
        const tbody = document.getElementById('naratif-editor-body');
        tbody.innerHTML = '';
        const editableNaratif = {};
        results.forEach((item) => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = item.siswa.nama;
            row.insertCell(1).innerText = item.siswa.nisn;
            const cell = row.insertCell(2);
            const textarea = document.createElement('textarea');
            textarea.value = item.naratif;
            textarea.className = 'w-full p-2 border rounded-lg text-sm';
            textarea.rows = 3;
            textarea.addEventListener('input', (e) => { editableNaratif[item.siswa.id] = e.target.value; });
            cell.appendChild(textarea);
            editableNaratif[item.siswa.id] = item.naratif;
        });
        const close = () => { modalDiv.remove(); resolve(null); };
        document.getElementById('closeModalEdit').onclick = close;
        document.getElementById('cancelEditBtn').onclick = close;
        document.getElementById('generatePdfBtn').onclick = () => {
            const finalResults = results.map(item => ({ ...item, naratif: editableNaratif[item.siswa.id] || item.naratif }));
            modalDiv.remove();
            resolve(finalResults);
        };
    });
}

function generatePDFFromResults(results) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        Swal.fire("Error", "jsPDF tidak terload", "error");
        return;
    }
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const headers = [['NISN', 'Nama Siswa', 'Kelas', 'UH1', 'UH2', 'UTS', 'Rata-rata', 'Evaluasi']];
    const body = results.map(r => {
        const rata = (r.nilai.uh1 + r.nilai.uh2 + r.nilai.uts) / 3;
        return [r.siswa.nisn || '-', r.siswa.nama, r.siswa.kelas, r.nilai.uh1, r.nilai.uh2, r.nilai.uts, rata.toFixed(1), r.naratif];
    });
    doc.setFontSize(16);
    doc.text(`Laporan Nilai Semester ${currentSemester} - ${currentMapel}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')} | Guru: ${guruData.nama || 'Guru'}`, 14, 30);
    doc.autoTable({
        head: headers,
        body: body,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 7: { cellWidth: 50 } },
        margin: { left: 10, right: 10 }
    });
    doc.save(`Nilai_${currentSemester}_${currentMapel}.pdf`);
    Swal.fire("Berhasil!", "PDF dengan evaluasi yang sudah diedit telah diunduh.", "success");
}

// ==================== EXPORT FUNCTIONS ====================

async function exportCombinedStatis() {
    if (!allSiswa.length) { Swal.fire("Info", "Tidak ada data siswa.", "info"); return; }
    const statisResults = allSiswa.map(siswa => {
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 };
        return { siswa, nilai, naratif: fallbackNaratif(siswa, nilai) };
    });
    generatePDFFromResults(statisResults);
}

async function exportCombinedWithAI() {
    if (!allSiswa.length) return;
    const maxAI = 2;
    if (!GEMINI_API_KEY) {
        const { value: key } = await Swal.fire({
            title: "🔑 Masukkan API Key Gemini",
            input: "text",
            inputPlaceholder: "Masukkan API Key Anda",
            showCancelButton: true
        });
        if (key && key.trim()) {
            GEMINI_API_KEY = key.trim();
            localStorage.setItem("gemini_api_key", GEMINI_API_KEY);
        } else {
            Swal.fire("Info", "Menggunakan naratif statis.", "info");
            await exportCombinedStatis();
            return;
        }
    }
    const items = allSiswa.map(siswa => ({
        siswa,
        nilai: allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 }
    }));
    let allResults = [];
    let aiResults = [];
    for (let i = 0; i < items.length; i++) {
        let naratif = "";
        if (i < maxAI) {
            naratif = await generateNaratifWithAI(items[i].siswa, items[i].nilai);
            aiResults.push({ ...items[i], naratif });
        } else {
            naratif = fallbackNaratif(items[i].siswa, items[i].nilai);
        }
        allResults.push({ ...items[i], naratif });
    }
    const editedAIResults = await showNaratifEditorModal(aiResults);
    if (editedAIResults) {
        const finalResults = allResults.map(item => {
            const edited = editedAIResults.find(e => e.siswa.id === item.siswa.id);
            return edited ? { ...item, naratif: edited.naratif } : item;
        });
        generatePDFFromResults(finalResults);
    }
}

async function exportPerSiswaStatis() {
    if (!allSiswa.length) { Swal.fire("Info", "Tidak ada data siswa.", "info"); return; }
    Swal.fire({
        title: "Mengekspor PDF per siswa...",
        text: `Akan mengunduh ${allSiswa.length} file. Pastikan pop-up tidak diblokir.`,
        icon: "info",
        timer: 2000,
        showConfirmButton: false
    });
    for (let i = 0; i < allSiswa.length; i++) {
        const siswa = allSiswa[i];
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 };
        const naratif = fallbackNaratif(siswa, nilai);
        generateSingleRaporPDF(siswa, nilai, naratif);
        await new Promise(r => setTimeout(r, 300));
    }
    Swal.fire("Selesai", `PDF untuk ${allSiswa.length} siswa telah diunduh.`, "success");
}

async function exportPerSiswaWithAI() {
    if (!allSiswa.length) return;
    if (!GEMINI_API_KEY) {
        const { value: key } = await Swal.fire({
            title: "🔑 Masukkan API Key Gemini",
            input: "text",
            inputPlaceholder: "Masukkan API Key Anda",
            showCancelButton: true
        });
        if (key && key.trim()) {
            GEMINI_API_KEY = key.trim();
            localStorage.setItem("gemini_api_key", GEMINI_API_KEY);
        } else {
            Swal.fire("Info", "Menggunakan naratif statis untuk semua siswa.", "info");
            await exportPerSiswaStatis();
            return;
        }
    }
    for (let i = 0; i < allSiswa.length; i++) {
        const siswa = allSiswa[i];
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 };
        await Swal.fire({
            title: `Memproses ${siswa.nama}...`,
            text: `Siswa ${i+1} dari ${allSiswa.length}`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        const naratif = await generateNaratifWithAI(siswa, nilai);
        Swal.close();
        generateSingleRaporPDF(siswa, nilai, naratif);
        await new Promise(r => setTimeout(r, 500));
    }
    Swal.fire("Selesai", `Semua PDF untuk ${allSiswa.length} siswa telah diunduh.`, "success");
}

// ==================== EXPORT SEMUA RAPOR DALAM SATU FILE (BANYAK HALAMAN) ====================
async function exportAllRaporsCombined() {
    if (!allSiswa.length) {
        Swal.fire("Info", "Tidak ada data siswa.", "info");
        return;
    }
    const { value: useAI } = await Swal.fire({
        title: "Pilih Metode Evaluasi",
        text: "Gunakan AI untuk evaluasi setiap siswa? (Bisa memakan waktu lama)",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Gunakan AI",
        cancelButtonText: "Tidak, Pakai Statis",
        reverseButtons: true
    });
    if (useAI === undefined) return;

    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        Swal.fire("Error", "jsPDF tidak terload", "error");
        return;
    }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let firstPage = true;

    for (let idx = 0; idx < allSiswa.length; idx++) {
        const siswa = allSiswa[idx];
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 };
        let naratif = "";
        if (useAI) {
            if (!GEMINI_API_KEY) {
                const { value: key } = await Swal.fire({
                    title: "🔑 Masukkan API Key Gemini",
                    input: "text",
                    inputPlaceholder: "Masukkan API Key Anda",
                    showCancelButton: true
                });
                if (key && key.trim()) {
                    GEMINI_API_KEY = key.trim();
                    localStorage.setItem("gemini_api_key", GEMINI_API_KEY);
                } else {
                    naratif = fallbackNaratif(siswa, nilai);
                }
            }
            if (!naratif) {
                await Swal.fire({
                    title: `Memproses ${siswa.nama}...`,
                    text: `Siswa ${idx+1} dari ${allSiswa.length}`,
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
                naratif = await generateNaratifWithAI(siswa, nilai);
                Swal.close();
            }
        } else {
            naratif = fallbackNaratif(siswa, nilai);
        }
        if (!naratif) naratif = fallbackNaratif(siswa, nilai);

        if (!firstPage) doc.addPage();
        firstPage = false;

        const uh1 = nilai.uh1 || 0;
        const uh2 = nilai.uh2 || 0;
        const uts = nilai.uts || 0;
        const rata = ((uh1 + uh2 + uts) / 3).toFixed(1);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("LAPORAN HASIL BELAJAR (RAPOR)", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("SD NEGERI GANTING - SIDOARJO", 105, 30, { align: "center" });
        doc.text(`Tahun Ajaran 2025/2026 - Semester ${currentSemester}`, 105, 38, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("IDENTITAS SISWA", 20, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`Nama : ${siswa.nama}`, 20, 63);
        doc.text(`NISN : ${siswa.nisn || '-'}`, 20, 71);
        doc.text(`Kelas : ${siswa.kelas}`, 20, 79);
        doc.text(`Mata Pelajaran : ${currentMapel}`, 20, 87);
        const headers = [["Komponen", "Nilai"]];
        const data = [
            ["Nilai Harian 1 (UH1)", uh1],
            ["Nilai Harian 2 (UH2)", uh2],
            ["Nilai Tengah Semester (UTS)", uts],
            ["Rata-rata", rata]
        ];
        doc.autoTable({
            startY: 95,
            head: headers,
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
            bodyStyles: { fontSize: 10 },
            margin: { left: 20, right: 20 }
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.text("Evaluasi Perkembangan Siswa", 20, finalY);
        doc.setFont("helvetica", "normal");
        const splitNaratif = doc.splitTextToSize(naratif, 170);
        doc.text(splitNaratif, 20, finalY + 8);
        const today = new Date();
        const tglString = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.setFont("helvetica", "italic");
        doc.text(`Sidoarjo, ${tglString}`, 150, 270, { align: "right" });
        doc.text(`Guru Pengampu`, 150, 285, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text(`${guruData.nama}`, 150, 295, { align: "right" });
    }
    doc.save(`Rapor_Semua_Siswa_${currentMapel}_${currentSemester}.pdf`);
    Swal.fire("Berhasil!", `PDF rapor untuk ${allSiswa.length} siswa telah diunduh.`, "success");
}

// ==================== TOMBOL UTAMA (5 PILIHAN) ====================
async function exportToPDF() {
    await Swal.fire({
        title: "Export PDF",
        text: "Pilih mode dan metode:",
        icon: "question",
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: "Batal",
        html: `
            <div class="grid grid-cols-2 gap-3 mt-4">
                <button id="btn-gabungan-statis" class="swal2-confirm bg-blue-600 text-white px-4 py-2 rounded-lg">Gabungan (Statis)</button>
                <button id="btn-gabungan-ai" class="swal2-confirm bg-green-600 text-white px-4 py-2 rounded-lg">Gabungan (AI)</button>
                <button id="btn-per-siswa-statis" class="swal2-confirm bg-purple-600 text-white px-4 py-2 rounded-lg">Per Siswa (Statis)</button>
                <button id="btn-per-siswa-ai" class="swal2-confirm bg-orange-600 text-white px-4 py-2 rounded-lg">Per Siswa (AI)</button>
                <button id="btn-semua-rapor" class="swal2-confirm bg-indigo-600 text-white px-4 py-2 rounded-lg col-span-2">📚 Semua Rapor (Satu File)</button>
            </div>
        `,
        didOpen: () => {
            document.getElementById('btn-gabungan-statis').onclick = () => { Swal.close(); exportCombinedStatis(); };
            document.getElementById('btn-gabungan-ai').onclick = () => { Swal.close(); exportCombinedWithAI(); };
            document.getElementById('btn-per-siswa-statis').onclick = () => { Swal.close(); exportPerSiswaStatis(); };
            document.getElementById('btn-per-siswa-ai').onclick = () => { Swal.close(); exportPerSiswaWithAI(); };
            document.getElementById('btn-semua-rapor').onclick = () => { Swal.close(); exportAllRaporsCombined(); };
        }
    });
}

// ==================== SINGLE STUDENT PDF (TOMBOL PRINTER) ====================
async function exportSingleStudentPDF(siswaId) {
    try {
        if (!allSiswa.length) {
            Swal.fire("Info", "Data siswa belum dimuat, silakan tunggu.", "info");
            return;
        }
        
        const siswa = allSiswa.find(s => s.id === siswaId);
        if (!siswa) {
            Swal.fire("Error", "Data siswa tidak ditemukan", "error");
            return;
        }
        
        const nilai = allNilai.find(n => n.siswaId === siswaId) || { uh1: 0, uh2: 0, uts: 0 };
        
        const result = await Swal.fire({
            title: "Cetak Rapor",
            text: `Pilih metode evaluasi untuk ${siswa.nama}:`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Gunakan AI",
            cancelButtonText: "Langsung Cetak (Statis)",
            reverseButtons: true
        });
        
        if (result.dismiss) return;
        
        let naratif = "";
        
        if (!result.isConfirmed) {
            // Statis
            naratif = fallbackNaratif(siswa, nilai);
        } else {
            // AI
            if (!GEMINI_API_KEY) {
                const { value: key } = await Swal.fire({
                    title: "🔑 Masukkan API Key Gemini",
                    input: "text",
                    inputPlaceholder: "Masukkan API Key Anda",
                    showCancelButton: true
                });
                if (key && key.trim()) {
                    GEMINI_API_KEY = key.trim();
                    localStorage.setItem("gemini_api_key", GEMINI_API_KEY);
                } else {
                    Swal.fire("Info", "Menggunakan naratif statis.", "info");
                    naratif = fallbackNaratif(siswa, nilai);
                }
            }
            if (!naratif) {
                Swal.fire({ title: "Mengenerate...", text: "AI sedang menulis evaluasi, mohon tunggu.", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                naratif = await generateNaratifWithAI(siswa, nilai);
                Swal.close();
            }
        }
        
        if (!naratif || naratif.trim() === "") {
            naratif = fallbackNaratif(siswa, nilai);
        }
        
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            Swal.fire("Error", "Library PDF tidak terload. Refresh halaman.", "error");
            return;
        }
        
        generateSingleRaporPDF(siswa, nilai, naratif);
    } catch (err) {
        console.error("Error di exportSingleStudentPDF:", err);
        Swal.fire("Error", "Terjadi kesalahan: " + err.message, "error");
    }
}

function generateSingleRaporPDF(siswa, nilai, naratif) {
    try {
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            Swal.fire("Error", "jsPDF tidak tersedia", "error");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const uh1 = nilai.uh1 || 0;
        const uh2 = nilai.uh2 || 0;
        const uts = nilai.uts || 0;
        const rata = ((uh1 + uh2 + uts) / 3).toFixed(1);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("LAPORAN HASIL BELAJAR (RAPOR)", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("SD NEGERI GANTING - SIDOARJO", 105, 30, { align: "center" });
        doc.text(`Tahun Ajaran 2025/2026 - Semester ${currentSemester}`, 105, 38, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("IDENTITAS SISWA", 20, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`Nama : ${siswa.nama}`, 20, 63);
        doc.text(`NISN : ${siswa.nisn || '-'}`, 20, 71);
        doc.text(`Kelas : ${siswa.kelas}`, 20, 79);
        doc.text(`Mata Pelajaran : ${currentMapel}`, 20, 87);
        const headers = [["Komponen", "Nilai"]];
        const data = [
            ["Nilai Harian 1 (UH1)", uh1],
            ["Nilai Harian 2 (UH2)", uh2],
            ["Nilai Tengah Semester (UTS)", uts],
            ["Rata-rata", rata]
        ];
        doc.autoTable({
            startY: 95,
            head: headers,
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
            bodyStyles: { fontSize: 10 },
            margin: { left: 20, right: 20 }
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.text("Evaluasi Perkembangan Siswa", 20, finalY);
        doc.setFont("helvetica", "normal");
        const splitNaratif = doc.splitTextToSize(naratif, 170);
        doc.text(splitNaratif, 20, finalY + 8);
        const today = new Date();
        const tglString = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.setFont("helvetica", "italic");
        doc.text(`Sidoarjo, ${tglString}`, 150, 270, { align: "right" });
        doc.text(`Guru Pengampu`, 150, 285, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text(`${guruData.nama}`, 150, 295, { align: "right" });
        doc.save(`Rapor_${siswa.nama}_${currentMapel}_${currentSemester}.pdf`);
        Swal.fire("Berhasil!", `Rapor untuk ${siswa.nama} telah diunduh.`, "success");
    } catch (err) {
        console.error("Error di generateSingleRaporPDF:", err);
        Swal.fire("Error", "Gagal membuat PDF: " + err.message, "error");
    }
}

// ==================== SETUP FILTERS & EVENT LISTENERS ====================
function setupFilters() {
    if (filterKelasSelect) {
        if (currentUserRole === "walas") {
            filterKelasSelect.value = guruwaliKelas;
            filterKelasSelect.disabled = true;
        } else {
            filterKelasSelect.disabled = false;
            filterKelasSelect.addEventListener("change", async (e) => {
                currentKelas = e.target.value;
                await loadSiswa();
            });
        }
    }
    if (filterSemesterSelect) {
        filterSemesterSelect.value = "Ganjil";
        filterSemesterSelect.addEventListener("change", async (e) => {
            currentSemester = e.target.value;
            await loadNilai();
        });
    }
    if (filterMapelSelect) {
        if (currentUserRole === "mapel") {
            filterMapelSelect.disabled = true;
            if (guruData.mapel && guruData.mapel !== "-") {
                filterMapelSelect.value = guruData.mapel;
                currentMapel = guruData.mapel;
            } else {
                filterMapelSelect.value = "Matematika";
                currentMapel = "Matematika";
            }
        } else {
            filterMapelSelect.disabled = false;
            filterMapelSelect.addEventListener("change", async (e) => {
                currentMapel = e.target.value;
                await loadNilai();
            });
        }
    }
    if (searchInput) searchInput.addEventListener("input", () => renderTable());
    if (btnSimpan) btnSimpan.addEventListener("click", simpanNilai);
    if (btnExportPDF) btnExportPDF.addEventListener("click", exportToPDF);
}

// ==================== INISIALISASI ====================
firebase.auth().onAuthStateChanged((user) => {
    if (user && user.email) {
        guruData.email = user.email;
        localStorage.setItem("userEmail", user.email);
    } else {
        guruData.email = localStorage.getItem("userEmail") || "";
    }
    updateHeaderProfile();
    renderProfileDropdown();
    if (filterKelasSelect && filterKelasSelect.options.length <= 1) {
        const kelasList = ['1-A','1-B','2-A','2-B','3-A','3-B','4-A','4-B','5-A','5-B','6-A','6-B'];
        kelasList.forEach(k => {
            const opt = document.createElement("option");
            opt.value = k;
            opt.innerText = k;
            filterKelasSelect.appendChild(opt);
        });
    }
    setupFilters();
    loadSiswa();
});