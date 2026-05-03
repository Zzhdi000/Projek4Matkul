// ==================== DAFTAR MATA PELAJARAN (SAMA DENGAN ADMIN) ====================
const DAFTAR_MAPEL = [
    "PAI",
    "PPKN",
    "BAHASA INDONESIA",
    "MATEMATIKA",
    "IPA",
    "IPS",
    "SBDP",
    "PJOK",
    "BAHASA INGGRIS",
    "BAHASA JAWA / MULOK",
    "TIK",
    "BK",
    "SENI BUDAYA",
    "INFORMATIKA",
    "KEWIRAUSAHAAN",
    "BAHASA ARAB"
];

// Fungsi untuk mencocokkan mapel yang tersimpan (terima nama pendek atau panjang, ubah ke panjang)
function cocokkanMapel(mapelDariStorage) {
    if (!mapelDariStorage) return DAFTAR_MAPEL[0];
    // Mapping singkatan ke nama lengkap
    const mapping = {
        "indo": "BAHASA INDONESIA",
        "ing": "BAHASA INGGRIS",
        "jawa": "BAHASA JAWA / MULOK",
        "matematika": "MATEMATIKA",
        "pkn": "PPKN",
        "sbk": "SBDP",
        "ipas": "IPA",
        "pjok": "PJOK",
        "pai": "PAI"
    };
    const lower = mapelDariStorage.toLowerCase();
    if (mapping[lower]) return mapping[lower];
    const ditemukan = DAFTAR_MAPEL.find(m => m.toLowerCase() === lower);
    return ditemukan || DAFTAR_MAPEL[0];
}

// ==================== DATA GURU DARI LOCALSTORAGE ====================
let guruData = {
    nama: localStorage.getItem("userName") || "Guru",
    role: localStorage.getItem("userRole") || "guru",
    waliKelas: localStorage.getItem("waliKelas") || "",
    userId: localStorage.getItem("userId") || "",
    mapel: cocokkanMapel(localStorage.getItem("userMapel") || "MATEMATIKA"),
    email: localStorage.getItem("userEmail") || ""
};

// ==================== AUTO-LOAD JSPDF & AUTOTABLE ====================
window.loadPDFLibraries = function() {
    return new Promise((resolve, reject) => {
        if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF && window.jspdf.jsPDF.prototype.autoTable) {
            resolve();
            return;
        }
        const scriptJSPDF = document.createElement('script');
        scriptJSPDF.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        scriptJSPDF.onload = () => {
            const scriptAutoTable = document.createElement('script');
            scriptAutoTable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
            scriptAutoTable.onload = () => resolve();
            scriptAutoTable.onerror = (err) => reject(new Error('Gagal memuat jspdf-autotable'));
            document.head.appendChild(scriptAutoTable);
        };
        scriptJSPDF.onerror = (err) => reject(new Error('Gagal memuat jsPDF'));
        document.head.appendChild(scriptJSPDF);
    });
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
const btnExportPDF = document.getElementById("btn-export-pdf");

let allSiswa = [];
let allNilai = [];
let currentKelas = "all";
let currentSemester = "";
let currentMapel = "";
let currentUserRole = guruwaliKelas ? "walas" : "mapel";

if (currentUserRole === "mapel") {
    currentMapel = guruData.mapel;
} else {
    currentMapel = "";
}

// ==================== GROQ API ====================
let GROQ_API_KEY = localStorage.getItem("groq_api_key");
console.log("Groq API Key tersedia?", !!GROQ_API_KEY);

async function askGroq(prompt) {
    const apiKey = localStorage.getItem("groq_api_key");
    if (!apiKey) return null;
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 600
            })
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Groq error:", data);
            if (data.error?.message?.includes("model")) {
                const retry = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "mixtral-8x7b-32768", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 600 })
                });
                const retryData = await retry.json();
                if (retry.ok) return retryData.choices[0]?.message?.content?.trim() || null;
            }
            return null;
        }
        return data.choices[0]?.message?.content?.trim() || null;
    } catch (err) {
        console.error("Groq error:", err);
        return null;
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

async function generateNaratifWithAI(siswa, nilai) {
    const { nama, kelas } = siswa;
    const uh1 = nilai.uh1 || 0, uh2 = nilai.uh2 || 0, uts = nilai.uts || 0;
    const rata = (uh1 + uh2 + uts) / 3;
    const prompt = `Kamu adalah guru yang baik dan ramah. Buatlah evaluasi rapor singkat (maks 50 kata) untuk siswa SD.
Nama: ${nama}, Kelas: ${kelas}
Nilai: UH1=${uh1}, UH2=${uh2}, UTS=${uts}, Rata-rata=${rata.toFixed(1)}
Aturan: Bahasa mudah dimengerti anak SD, beri semangat, jangan kata "berdasarkan data" atau "AI".
Di akhir kalimat sertakan: "Tetap semangat belajar, ya! - AI Mas Gani"`;
    const result = await askGroq(prompt);
    if (result && result.length > 20) return result;
    if (rata >= 85) return `Hore! Nilai ${nama} sangat bagus. Pertahankan ya! ${nama} pasti bisa lebih hebat lagi! Tetap semangat belajar, ya! - AI Mas Gani`;
    if (rata >= 70) return `Bagus, ${nama}! Nilaimu sudah baik. Coba lebih fokus dan banyak latihan. Kamu pasti bisa meningkat. Tetap semangat belajar, ya! - AI Mas Gani`;
    if (rata >= 60) return `${nama}, nilai kamu cukup. Ayo belajar lebih giat. Tetap semangat belajar, ya! - AI Mas Gani`;
    return `${nama}, yuk semangat belajar! Masih ada waktu untuk memperbaiki nilai. Tetap semangat belajar, ya! - AI Mas Gani`;
}
function fallbackNaratif(siswa, nilai) {
    const rata = (nilai.uh1 + nilai.uh2 + nilai.uts) / 3;
    if (rata >= 85) return "Sangat baik, pertahankan prestasinya! Terus tingkatkan latihan soal.";
    if (rata >= 70) return "Baik, masih ada ruang peningkatan. Fokus pada materi yang kurang dikuasai.";
    if (rata >= 60) return "Cukup, perlu bimbingan lebih intensif.";
    return "Perlu perhatian khusus, konsultasikan dengan guru dan orang tua.";
}

// ==================== LOAD DATA ====================
async function loadSiswa() {
    try {
        let query = db.collection("students").orderBy("nama", "asc");
        if (currentUserRole === "walas") query = query.where("kelas", "==", guruwaliKelas);
        else if (currentKelas !== "all") query = query.where("kelas", "==", currentKelas);
        const snapshot = await query.get();
        allSiswa = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        await loadNilai();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal mengambil data siswa", "error");
    }
}

async function loadNilai() {
    if (!currentSemester || !currentMapel) {
        allNilai = [];
        renderTable();
        return;
    }
    if (!allSiswa.length) { renderTable(); return; }
    const siswaIds = allSiswa.map(s => s.id);
    allNilai = [];
    const chunks = chunkArray(siswaIds, 30);
    for (const chunk of chunks) {
        const snapshot = await db.collection("nilai")
            .where("siswaId", "in", chunk)
            .where("semester", "==", currentSemester)
            .where("mapel", "==", currentMapel)
            .get();
        snapshot.forEach(doc => allNilai.push({ id: doc.id, ...doc.data() }));
    }
    renderTable();
}

function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    let filtered = [...allSiswa];
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) filtered = filtered.filter(s => s.nama.toLowerCase().includes(searchTerm) || (s.nisn && s.nisn.includes(searchTerm)));
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">Tidak ada data siswa</td></td>`;
        return;
    }
    filtered.forEach(siswa => {
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1:0, uh2:0, uts:0 };
        const rata = ((nilai.uh1||0)+(nilai.uh2||0)+(nilai.uts||0))/3;
        const rataBulat = Math.round(rata*10)/10;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td class="px-6 py-3 w-[150px] whitespace-nowrap">${siswa.nisn || '-'}</td>
            <td class="px-6 py-3 font-bold min-w-[200px]">${escapeHtml(siswa.nama)}</td>
            <td class="px-6 py-3 text-center w-[100px]">${siswa.kelas}</td>
            <td class="px-6 py-3 text-center w-[100px]"><input type="number" class="nilai-input w-16 text-center border border-slate-200 rounded-lg px-1 py-1 focus:ring-2 focus:ring-blue-500 outline-none" data-siswa="${siswa.id}" data-field="uh1" value="${nilai.uh1||0}" min="0" max="100" step="0.1"></td>
            <td class="px-6 py-3 text-center w-[100px]"><input type="number" class="nilai-input w-16 text-center border border-slate-200 rounded-lg px-1 py-1 focus:ring-2 focus:ring-blue-500 outline-none" data-siswa="${siswa.id}" data-field="uh2" value="${nilai.uh2||0}" min="0" max="100" step="0.1"></td>
            <td class="px-6 py-3 text-center w-[100px]"><input type="number" class="nilai-input w-16 text-center border border-slate-200 rounded-lg px-1 py-1 focus:ring-2 focus:ring-blue-500 outline-none" data-siswa="${siswa.id}" data-field="uts" value="${nilai.uts||0}" min="0" max="100" step="0.1"></td>
            <td class="px-6 py-3 text-center font-bold rata-rata w-[100px] text-blue-600">${rataBulat}</td>
        `;
    });
    document.querySelectorAll('.nilai-input').forEach(inp => {
        inp.removeEventListener('input', handleNilaiInput);
        inp.addEventListener('input', handleNilaiInput);
        inp.disabled = !isFormReady;
        inp.removeEventListener('focus', warnIfNotReady);
        inp.addEventListener('focus', warnIfNotReady);
    });
}

function handleNilaiInput(e) {
    const row = e.currentTarget.closest('tr');
    const uh1 = parseFloat(row.querySelector('input[data-field="uh1"]').value) || 0;
    const uh2 = parseFloat(row.querySelector('input[data-field="uh2"]').value) || 0;
    const uts = parseFloat(row.querySelector('input[data-field="uts"]').value) || 0;
    const rata = (uh1 + uh2 + uts) / 3;
    row.querySelector('.rata-rata').innerText = Math.round(rata*10)/10;
}

// ==================== SIMPAN NILAI (DENGAN MENYIMPAN NISN & NAMA) ====================
async function simpanNilai() {
    if (!isFormReady) {
        Swal.fire("Peringatan", "Pilih semester dan mata pelajaran terlebih dahulu sebelum menyimpan nilai.", "warning");
        return;
    }
    const rows = document.querySelectorAll('#table-body-nilai tr');
    const batch = db.batch();
    for (let row of rows) {
        const siswaId = row.querySelector('.nilai-input')?.dataset.siswa;
        if (!siswaId) continue;
        const uh1 = parseFloat(row.querySelector('input[data-field="uh1"]').value) || 0;
        const uh2 = parseFloat(row.querySelector('input[data-field="uh2"]').value) || 0;
        const uts = parseFloat(row.querySelector('input[data-field="uts"]').value) || 0;
        const rataRata = (uh1+uh2+uts)/3;
        const existing = allNilai.find(n => n.siswaId === siswaId);
        
        // Ambil data siswa lengkap
        const siswa = allSiswa.find(s => s.id === siswaId);
        if (!siswa) continue;
        const nisn = siswa.nisn || '';
        const nama = siswa.nama || '';
        const kelas = siswa.kelas || '';
        
        if (existing) {
            batch.update(db.collection("nilai").doc(existing.id), { 
                uh1, uh2, uts, rataRata, 
                nisn, nama, kelas,
                updatedAt: new Date() 
            });
        } else {
            const newRef = db.collection("nilai").doc();
            batch.set(newRef, { 
                siswaId, 
                nisn, 
                nama, 
                kelas, 
                semester: currentSemester, 
                mapel: currentMapel, 
                uh1, uh2, uts, 
                rataRata, 
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }
    await batch.commit();
    Swal.fire("Berhasil!", "Data nilai telah disimpan.", "success");
    await loadNilai();
}

// ==================== INDIKATOR STATUS FORM (MIRIP CETAK PDF) ====================
let isFormReady = false;
let statusIndicator = null;

function createStatusIndicator() {
    const container = document.querySelector('.flex.flex-wrap.gap-4.items-end');
    if (!container) return;
    if (document.getElementById('form-status-indicator')) return;
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'form-status-indicator';
    statusIndicator.className = 'text-xs font-bold mt-2 flex items-center gap-1';
    container.parentNode.insertBefore(statusIndicator, container.nextSibling);
}

function updateFormStatus() {
    if (!statusIndicator) return;
    if (isFormReady) {
        statusIndicator.innerHTML = '<i class="fas fa-check-circle text-green-600"></i> <span class="text-green-700">✅ Siap mengisi nilai. Semester dan mata pelajaran sudah lengkap.</span>';
        statusIndicator.className = 'text-xs font-bold mt-2 flex items-center gap-1 text-green-600';
    } else {
        statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle text-amber-500"></i> <span class="text-amber-700">⚠️ Pilih semester dan mata pelajaran terlebih dahulu untuk mengisi nilai.</span>';
        statusIndicator.className = 'text-xs font-bold mt-2 flex items-center gap-1 text-amber-600';
    }
}

function warnIfNotReady(e) {
    if (!isFormReady) {
        e.preventDefault();
        e.target.blur();
        Swal.fire({
            title: "Belum Siap",
            text: "Pilih semester dan mata pelajaran terlebih dahulu untuk mengisi nilai.",
            icon: "warning",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000
        });
    }
}

function updateFormReady() {
    const semesterValid = filterSemesterSelect && (filterSemesterSelect.value === "Ganjil" || filterSemesterSelect.value === "Genap");
    const mapelValid = filterMapelSelect && filterMapelSelect.value && filterMapelSelect.value !== "";
    const newReady = semesterValid && mapelValid;
    if (newReady !== isFormReady) {
        isFormReady = newReady;
        document.querySelectorAll('.nilai-input').forEach(inp => inp.disabled = !isFormReady);
        updateFormStatus();
    }
}

// ==================== FUNGSI EKSPORT DENGAN GROQ (LENGKAP) ====================
function showToast(message, type = 'info') {
    Swal.fire({ title: message, icon: type, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true });
}

async function ensureGroqApiKey(useAI) {
    if (!useAI) return true;
    if (GROQ_API_KEY) return true;
    const { value: key } = await Swal.fire({ title: "🔑 Masukkan API Key Groq", input: "text", inputPlaceholder: "Masukkan Groq API Key (gsk_...)", showCancelButton: true, confirmButtonText: "Gunakan", cancelButtonText: "Batal" });
    if (key && key.trim()) {
        GROQ_API_KEY = key.trim();
        localStorage.setItem("groq_api_key", GROQ_API_KEY);
        return true;
    }
    showToast("AI tidak digunakan, pakai naratif statis.", "warning");
    return false;
}

async function getNaratif(siswa, nilai, useAI) {
    if (useAI && GROQ_API_KEY) {
        const naratif = await generateNaratifWithAI(siswa, nilai);
        if (naratif) return naratif;
    }
    return fallbackNaratif(siswa, nilai);
}

async function exportRekapKelas(useAI = false) {
    await window.loadPDFLibraries();
    if (!allSiswa.length) {
        showToast("Tidak ada data siswa.", "error");
        return;
    }
    if (!currentMapel || !currentSemester) {
        showToast("Pilih semester dan mata pelajaran terlebih dahulu", "warning");
        return;
    }
    const aiAvailable = await ensureGroqApiKey(useAI);
    const finalUseAI = useAI && aiAvailable;
    let results = [];
    let loadingSwal = null;
    if (finalUseAI) {
        loadingSwal = Swal.fire({ title: '🤖 Membuat naratif AI (Groq)', text: 'Memproses 0 dari ' + allSiswa.length + ' siswa', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    }
    for (let i = 0; i < allSiswa.length; i++) {
        const siswa = allSiswa[i];
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1:0, uh2:0, uts:0 };
        if (finalUseAI && loadingSwal) loadingSwal.update({ text: `Memproses ${siswa.nama} (${i+1}/${allSiswa.length})` });
        const naratif = await getNaratif(siswa, nilai, finalUseAI);
        results.push({ siswa, nilai, naratif });
        if (finalUseAI && i < allSiswa.length-1) await sleep(1500);
    }
    if (loadingSwal) loadingSwal.close();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const headers = [['NISN','Nama','Kelas','UH1','UH2','UTS','Rata','Evaluasi']];
    const body = results.map(r => {
        const rata = (r.nilai.uh1 + r.nilai.uh2 + r.nilai.uts) / 3;
        return [r.siswa.nisn||'-', r.siswa.nama, r.siswa.kelas, r.nilai.uh1, r.nilai.uh2, r.nilai.uts, rata.toFixed(1), r.naratif];
    });
    doc.setFontSize(16);
    doc.text(`Rekap Nilai Semester ${currentSemester} - ${currentMapel}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')} | Guru: ${guruData.nama}`, 14, 30);
    doc.autoTable({ head: headers, body: body, startY: 35, theme: 'striped', headStyles: { fillColor: [37,99,235], textColor:255, fontSize:8 }, bodyStyles: { fontSize:8 }, columnStyles: { 7: { cellWidth: 50 } } });
    doc.save(`Rekap_Kelas_${currentMapel}_${currentSemester}.pdf`);
    showToast("PDF Rekap Kelas selesai!", "success");
}

async function exportRaporIndividu(useAI = false) {
    await window.loadPDFLibraries();
    if (!allSiswa.length) {
        showToast("Tidak ada data siswa.", "error");
        return;
    }
    if (!currentMapel || !currentSemester) {
        showToast("Pilih semester dan mata pelajaran terlebih dahulu", "warning");
        return;
    }
    const aiAvailable = await ensureGroqApiKey(useAI);
    const finalUseAI = useAI && aiAvailable;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let firstPage = true;
    let loadingSwal = null;
    if (finalUseAI) {
        loadingSwal = Swal.fire({ title: '📚 Membuat rapor dengan AI (Groq)', text: 'Memproses 0 dari ' + allSiswa.length + ' siswa', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    }
    for (let i = 0; i < allSiswa.length; i++) {
        const siswa = allSiswa[i];
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1:0, uh2:0, uts:0 };
        if (finalUseAI && loadingSwal) loadingSwal.update({ text: `Memproses ${siswa.nama} (${i+1}/${allSiswa.length})` });
        const naratif = await getNaratif(siswa, nilai, finalUseAI);
        if (!firstPage) doc.addPage();
        firstPage = false;
        const uh1 = nilai.uh1, uh2 = nilai.uh2, uts = nilai.uts;
        const rata = ((uh1+uh2+uts)/3).toFixed(1);
        doc.setFontSize(16); doc.setFont("helvetica","bold");
        doc.text("LAPORAN HASIL BELAJAR (RAPOR)", 105, 20, { align:"center" });
        doc.setFontSize(12); doc.setFont("helvetica","normal");
        doc.text("SD NEGERI GANTING - SIDOARJO", 105, 30, { align:"center" });
        doc.text(`Tahun Ajaran 2025/2026 - Semester ${currentSemester}`, 105, 38, { align:"center" });
        doc.setFontSize(10); doc.setFont("helvetica","bold");
        doc.text("IDENTITAS SISWA", 20, 55);
        doc.setFont("helvetica","normal");
        doc.text(`Nama : ${siswa.nama}`, 20, 63);
        doc.text(`NISN : ${siswa.nisn||'-'}`, 20, 71);
        doc.text(`Kelas : ${siswa.kelas}`, 20, 79);
        doc.text(`Mata Pelajaran : ${currentMapel}`, 20, 87);
        doc.autoTable({ startY: 95, head: [["Komponen","Nilai"]], body: [["Nilai Harian 1 (UH1)",uh1],["Nilai Harian 2 (UH2)",uh2],["Nilai Tengah Semester (UTS)",uts],["Rata-rata",rata]], theme: 'striped', headStyles: { fillColor: [37,99,235], textColor:255, fontSize:10 }, margin: { left:20, right:20 } });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica","bold");
        doc.text("Evaluasi Perkembangan Siswa", 20, finalY);
        doc.setFont("helvetica","normal");
        const splitNaratif = doc.splitTextToSize(naratif, 170);
        doc.text(splitNaratif, 20, finalY+8);
        const tgl = new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
        doc.setFont("helvetica","italic");
        doc.text(`Sidoarjo, ${tgl}`, 150, 270, { align:"right" });
        doc.text("Guru Pengampu", 150, 285, { align:"right" });
        doc.setFont("helvetica","bold");
        doc.text(`${guruData.nama}`, 150, 295, { align:"right" });
        if (finalUseAI && i < allSiswa.length-1) await sleep(1500);
    }
    if (loadingSwal) loadingSwal.close();
    doc.save(`Rapor_Individu_${currentMapel}_${currentSemester}.pdf`);
    showToast("PDF Rapor Individu selesai!", "success");
}

async function exportPerSiswaBanyakFile(useAI = false) {
    await window.loadPDFLibraries();
    if (!allSiswa.length) {
        showToast("Tidak ada data siswa.", "error");
        return;
    }
    if (!currentMapel || !currentSemester) {
        showToast("Pilih semester dan mata pelajaran terlebih dahulu", "warning");
        return;
    }
    const aiAvailable = await ensureGroqApiKey(useAI);
    const finalUseAI = useAI && aiAvailable;
    showToast(`Menyiapkan PDF untuk ${allSiswa.length} siswa...`, "info");
    let loadingSwal = null;
    if (finalUseAI) {
        loadingSwal = Swal.fire({ title: '📄 Membuat rapor per siswa dengan AI (Groq)', text: 'Memproses 0 dari ' + allSiswa.length + ' siswa', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    }
    for (let i = 0; i < allSiswa.length; i++) {
        const siswa = allSiswa[i];
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1:0, uh2:0, uts:0 };
        if (finalUseAI && loadingSwal) loadingSwal.update({ text: `Memproses ${siswa.nama} (${i+1}/${allSiswa.length})` });
        const naratif = await getNaratif(siswa, nilai, finalUseAI);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const uh1 = nilai.uh1, uh2 = nilai.uh2, uts = nilai.uts;
        const rata = ((uh1+uh2+uts)/3).toFixed(1);
        doc.setFontSize(16); doc.setFont("helvetica","bold");
        doc.text("LAPORAN HASIL BELAJAR (RAPOR)", 105, 20, { align:"center" });
        doc.setFontSize(12); doc.setFont("helvetica","normal");
        doc.text("SD NEGERI GANTING - SIDOARJO", 105, 30, { align:"center" });
        doc.text(`Tahun Ajaran 2025/2026 - Semester ${currentSemester}`, 105, 38, { align:"center" });
        doc.setFontSize(10); doc.setFont("helvetica","bold");
        doc.text("IDENTITAS SISWA", 20, 55);
        doc.setFont("helvetica","normal");
        doc.text(`Nama : ${siswa.nama}`, 20, 63);
        doc.text(`NISN : ${siswa.nisn||'-'}`, 20, 71);
        doc.text(`Kelas : ${siswa.kelas}`, 20, 79);
        doc.text(`Mata Pelajaran : ${currentMapel}`, 20, 87);
        doc.autoTable({ startY: 95, head: [["Komponen","Nilai"]], body: [["Nilai Harian 1 (UH1)",uh1],["Nilai Harian 2 (UH2)",uh2],["Nilai Tengah Semester (UTS)",uts],["Rata-rata",rata]], theme: 'striped', headStyles: { fillColor: [37,99,235], textColor:255, fontSize:10 }, margin: { left:20, right:20 } });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica","bold");
        doc.text("Evaluasi Perkembangan Siswa", 20, finalY);
        doc.setFont("helvetica","normal");
        const splitNaratif = doc.splitTextToSize(naratif, 170);
        doc.text(splitNaratif, 20, finalY+8);
        const tgl = new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
        doc.setFont("helvetica","italic");
        doc.text(`Sidoarjo, ${tgl}`, 150, 270, { align:"right" });
        doc.text("Guru Pengampu", 150, 285, { align:"right" });
        doc.setFont("helvetica","bold");
        doc.text(`${guruData.nama}`, 150, 295, { align:"right" });
        doc.save(`Rapor_${siswa.nama}_${currentMapel}_${currentSemester}.pdf`);
        if (finalUseAI) await sleep(500);
    }
    if (loadingSwal) loadingSwal.close();
    showToast(`Selesai! ${allSiswa.length} file PDF telah diunduh.`, "success");
}

async function exportToPDF() {
    if (btnExportPDF.disabled) return;
    await window.loadPDFLibraries();
    await Swal.fire({
        title: "Export / Cetak Rapor",
        html: `
            <div class="grid grid-cols-1 gap-3 mt-2">
                <button id="btn-rekap" class="swal2-confirm bg-blue-600 text-white px-4 py-2 rounded-lg">📊 Rekap Kelas</button>
                <button id="btn-individu" class="swal2-confirm bg-indigo-600 text-white px-4 py-2 rounded-lg">📚 Rapor Individu (Satu File)</button>
                <button id="btn-per-siswa" class="swal2-confirm bg-orange-600 text-white px-4 py-2 rounded-lg">📄 Per Siswa (Banyak File)</button>
            </div>
            <div class="mt-4 text-left">
                <label class="flex items-center justify-center gap-2 cursor-pointer">
                    <input type="checkbox" id="useAI" class="w-4 h-4"> 
                    <span class="text-sm">🤖 Gunakan AI untuk naratif (butuh API Key Groq)</span>
                </label>
                <p class="text-xs text-slate-400 mt-1 text-center">*Jika tidak dicentang, menggunakan naratif statis.</p>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: "Batal",
        didOpen: () => {
            document.getElementById('btn-rekap').onclick = () => { const useAI = document.getElementById('useAI').checked; Swal.close(); exportRekapKelas(useAI); };
            document.getElementById('btn-individu').onclick = () => { const useAI = document.getElementById('useAI').checked; Swal.close(); exportRaporIndividu(useAI); };
            document.getElementById('btn-per-siswa').onclick = () => { const useAI = document.getElementById('useAI').checked; Swal.close(); exportPerSiswaBanyakFile(useAI); };
        }
    });
}

// ==================== DROPDOWN MAPEL DINAMIS (MENGAMBIL DARI JADWAL_GURU DENGAN PEMETAAN KE NAMA LENGKAP) ====================
async function loadDynamicMapelOptions() {
    if (!filterMapelSelect) return;

    if (currentUserRole === "mapel") {
        filterMapelSelect.innerHTML = '';
        const option = document.createElement('option');
        option.value = guruData.mapel;
        option.textContent = guruData.mapel;
        filterMapelSelect.appendChild(option);
        filterMapelSelect.disabled = true;
        currentMapel = guruData.mapel;
        return;
    }

    if (!guruwaliKelas) return;

    filterMapelSelect.disabled = false;
    filterMapelSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = "";
    placeholder.textContent = "📚 Pilih Mata Pelajaran";
    placeholder.disabled = true;
    placeholder.selected = true;
    filterMapelSelect.appendChild(placeholder);

    const mapping = {
        "INDO": "BAHASA INDONESIA",
        "ING": "BAHASA INGGRIS",
        "JAWA": "BAHASA JAWA / MULOK",
        "MATEMATIKA": "MATEMATIKA",
        "PKN": "PPKN",
        "SBK": "SBDP",
        "IPAS": "IPA",
        "PJOK": "PJOK",
        "PAI": "PAI"
    };

    try {
        let normalizedKelas = guruwaliKelas.replace(/[-\s]/g, "").toUpperCase();
        const snapshot = await db.collection("jadwal_guru").where("kelaswalas", "==", normalizedKelas).get();
        const mapelSet = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.jadwal && typeof data.jadwal === 'object') {
                for (let hari in data.jadwal) {
                    if (Array.isArray(data.jadwal[hari])) {
                        data.jadwal[hari].forEach(ev => {
                            if (ev.mapel) {
                                let singkatan = ev.mapel;
                                let namaLengkap = mapping[singkatan] || singkatan;
                                mapelSet.add(namaLengkap);
                            }
                        });
                    }
                }
            }
        });

        if (mapelSet.size === 0) {
            DAFTAR_MAPEL.forEach(m => { const opt = document.createElement('option'); opt.value=m; opt.textContent=m; filterMapelSelect.appendChild(opt); });
        } else {
            Array.from(mapelSet).sort().forEach(m => { const opt = document.createElement('option'); opt.value=m; opt.textContent=m; filterMapelSelect.appendChild(opt); });
        }
    } catch (err) {
        console.error(err);
        DAFTAR_MAPEL.forEach(m => { const opt = document.createElement('option'); opt.value=m; opt.textContent=m; filterMapelSelect.appendChild(opt); });
    }
}

// ==================== SETUP FILTERS ====================
function setupFilters() {
    if (filterKelasSelect) {
        if (currentUserRole === "walas") { filterKelasSelect.value = guruwaliKelas; filterKelasSelect.disabled = true; }
        else { filterKelasSelect.disabled = false; filterKelasSelect.addEventListener("change", async (e)=>{ currentKelas=e.target.value; await loadSiswa(); }); }
    }
    if (filterSemesterSelect) {
        filterSemesterSelect.innerHTML = '';
        const ph = document.createElement('option'); ph.value=""; ph.textContent="📚 Pilih Semester"; ph.disabled=true; ph.selected=true; filterSemesterSelect.appendChild(ph);
        ["Ganjil","Genap"].forEach(sem=>{ const opt=document.createElement('option'); opt.value=sem; opt.textContent=sem; filterSemesterSelect.appendChild(opt); });
        currentSemester = "";
        filterSemesterSelect.addEventListener("change", async (e)=>{ currentSemester = e.target.value; await loadNilai(); updateFormReady(); });
    }
    if (filterMapelSelect) {
        loadDynamicMapelOptions().then(() => {
            if (currentUserRole !== "mapel") {
                filterMapelSelect.addEventListener("change", async (e)=>{ currentMapel = e.target.value; await loadNilai(); updateFormReady(); });
            }
        });
    }
    function updateExportButtonState() {
        if (!btnExportPDF) return;
        const semesterValid = filterSemesterSelect && (filterSemesterSelect.value === "Ganjil" || filterSemesterSelect.value === "Genap");
        const mapelValid = filterMapelSelect && filterMapelSelect.value && filterMapelSelect.value !== "";
        const enabled = semesterValid && mapelValid;
        btnExportPDF.disabled = !enabled;
        if (btnExportPDF.parentElement) {
            btnExportPDF.parentElement.style.position = "relative";
            btnExportPDF.parentElement.style.display = "inline-flex";
            btnExportPDF.parentElement.style.flexDirection = "column";
        }
        if (!enabled) btnExportPDF.classList.add("opacity-50","cursor-not-allowed");
        else btnExportPDF.classList.remove("opacity-50","cursor-not-allowed");
        let statusMsg = document.getElementById("export-status-msg");
        if (!statusMsg && btnExportPDF.parentNode) {
            statusMsg = document.createElement("div");
            statusMsg.id = "export-status-msg";
            statusMsg.className = "absolute left-0 top-full mt-1 text-[10px] whitespace-nowrap flex items-center gap-1 z-50";
            btnExportPDF.parentNode.appendChild(statusMsg);
        }
        if (statusMsg) {
            if (enabled) statusMsg.innerHTML = '<i class="fas fa-check-circle text-green-500"></i> <span class="text-green-600 font-bold">Siap cetak</span>';
            else statusMsg.innerHTML = '<i class="fas fa-exclamation-triangle text-amber-500"></i> <span class="text-amber-600 font-bold">Pilih Semester dan Mata Pelajaran</span>';
        }
        updateFormReady();
    }
    if (filterSemesterSelect) filterSemesterSelect.addEventListener("change", updateExportButtonState);
    if (filterMapelSelect) filterMapelSelect.addEventListener("change", updateExportButtonState);
    if (btnExportPDF) { btnExportPDF.disabled = true; updateExportButtonState(); }
    if (searchInput) searchInput.addEventListener("input", ()=>renderTable());
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
        kelasList.forEach(k => { const opt = document.createElement('option'); opt.value=k; opt.innerText=k; filterKelasSelect.appendChild(opt); });
    }
    setupFilters();
    createStatusIndicator();
    updateFormStatus();
    loadSiswa();
});