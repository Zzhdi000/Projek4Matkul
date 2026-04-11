// ==================== GURU NILAI - ALL FUNCTIONS ====================
// Data dari localStorage
const userName = localStorage.getItem("userName");
const guruwaliKelas = localStorage.getItem("waliKelas");

// Elemen DOM
const searchInput = document.getElementById("search-siswa");
const filterKelasSelect = document.getElementById("filter-kelas");
const filterSemesterSelect = document.getElementById("filter-semester");
const filterMapelSelect = document.getElementById("filter-mapel");
const tableBody = document.getElementById("table-body-nilai");
const btnSimpan = document.getElementById("btn-simpan-nilai");
const btnExportPDF = document.querySelector(".bg-slate-800");

// State
let allSiswa = [];
let allNilai = [];
let currentKelas = "all";
let currentSemester = "Ganjil";
let currentMapel = "Matematika";
let currentUserRole = guruwaliKelas ? "walas" : "mapel";

let GEMINI_API_KEY = localStorage.getItem("gemini_api_key");
const GEMINI_MODEL = "gemini-2.5-flash";

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
    // fallback statis jika AI gagal
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
            <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 mb-3 cursor-not-allowed">${currentMapel}</div>
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

// ==================== LOAD SISWA & NILAI ====================
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
    const nilaiSnapshot = await db.collection("nilai")
        .where("siswaId", "in", siswaIds)
        .where("semester", "==", currentSemester)
        .where("mapel", "==", currentMapel)
        .get();
    allNilai = [];
    nilaiSnapshot.forEach(doc => allNilai.push({ id: doc.id, ...doc.data() }));
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
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0, rataRata: 0 };
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
            <td class="px-6 py-3 text-center"><button class="text-blue-500 hover:text-blue-700 btn-detail" data-siswa="${siswa.id}"><i class="fas fa-chart-line"></i> Detail</button></td>
        `;
    });
    document.querySelectorAll('.nilai-input').forEach(inp => {
        inp.addEventListener('input', function() {
            const siswaId = this.dataset.siswa;
            const row = this.closest('tr');
            const uh1 = parseFloat(row.querySelector('input[data-field="uh1"]').value) || 0;
            const uh2 = parseFloat(row.querySelector('input[data-field="uh2"]').value) || 0;
            const uts = parseFloat(row.querySelector('input[data-field="uts"]').value) || 0;
            const rata = (uh1 + uh2 + uts) / 3;
            row.querySelector('.rata-rata').innerText = Math.round(rata * 10) / 10;
        });
    });
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', () => {
            const siswaId = btn.dataset.siswa;
            showDetailSiswa(siswaId);
        });
    });
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

// ==================== FUNGSI EDITOR MODAL & PDF ====================
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
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const headers = [['NISN', 'Nama Siswa', 'Kelas', 'UH1', 'UH2', 'UTS', 'Rata-rata', 'Evaluasi']];
    const body = results.map(r => {
        const rata = (r.nilai.uh1 + r.nilai.uh2 + r.nilai.uts) / 3;
        return [r.siswa.nisn || '-', r.siswa.nama, r.siswa.kelas, r.nilai.uh1, r.nilai.uh2, r.nilai.uts, rata.toFixed(1), r.naratif];
    });
    doc.setFontSize(16);
    doc.text(`Laporan Nilai Semester ${currentSemester} - ${currentMapel}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')} | Guru: ${userName || 'Guru'}`, 14, 30);
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

// ==================== EXPORT PDF DENGAN BATASAN 5 SISWA AI ====================
async function exportToPDF() {
    if (!allSiswa.length) {
        Swal.fire("Info", "Tidak ada data siswa.", "info");
        return;
    }

    const totalSiswa = allSiswa.length;
    const maxAI = 2;

    const { value: useAI } = await Swal.fire({
        title: "Generate Evaluasi Rapor",
        html: `
            <p>Jumlah siswa: <strong>${totalSiswa}</strong></p>
            <p class="text-left text-sm mt-2">
                ⚠️ Karena keterbatasan kuota API Gemini, hanya <strong>${maxAI} siswa pertama</strong> yang akan menggunakan AI.<br>
                Sisanya akan menggunakan <strong>naratif statis</strong> (berdasarkan nilai rata-rata).
            </p>
            <p class="text-left text-sm text-slate-500 mt-2">Anda tetap bisa mengedit semua naratif sebelum export PDF.</p>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Lanjutkan",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-2xl" }
    });

    if (!useAI) return;

    // Cek API key
    if (!GEMINI_API_KEY) {
        const { value: key } = await Swal.fire({
            title: "🔑 Masukkan API Key Gemini",
            text: "AI naratif memerlukan API Key dari Google AI Studio (gratis).",
            input: "text",
            inputPlaceholder: "Masukkan API Key Anda",
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal",
            customClass: { popup: "rounded-2xl" }
        });
        if (key && key.trim()) {
            GEMINI_API_KEY = key.trim();
            localStorage.setItem("gemini_api_key", GEMINI_API_KEY);
        } else {
            Swal.fire("Info", "Menggunakan naratif statis.", "info");
            const statisResults = allSiswa.map(siswa => {
                const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 };
                return { siswa, nilai, naratif: fallbackNaratif(siswa, nilai) };
            });
            const finalResults = await showNaratifEditorModal(statisResults);
            if (finalResults) generatePDFFromResults(finalResults);
            return;
        }
    }

    const items = allSiswa.map(siswa => {
        const nilai = allNilai.find(n => n.siswaId === siswa.id) || { uh1: 0, uh2: 0, uts: 0 };
        return { siswa, nilai };
    });

    let results = [];
    let aiProcessed = 0;

    if (maxAI > 0 && items.length > 0) {
        await Swal.fire({
            title: "Mengenerate Evaluasi AI",
            html: `
                <p>Memproses <span id="ai-count">0</span> dari ${Math.min(maxAI, items.length)} siswa dengan AI...</p>
                <progress id="ai-progress" value="0" max="${Math.min(maxAI, items.length)}" style="width:100%; height:20px;"></progress>
                <p id="ai-status" class="text-sm text-slate-500 mt-2">Mohon tunggu, jeda antar request 12 detik.</p>
            `,
            allowOutsideClick: false,
            showConfirmButton: false
        });
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let naratif = "";

        if (i < maxAI) {
            try {
                naratif = await generateNaratifWithAI(item.siswa, item.nilai);
                aiProcessed++;
                const countSpan = document.getElementById("ai-count");
                const progressBar = document.getElementById("ai-progress");
                if (countSpan) countSpan.innerText = aiProcessed;
                if (progressBar) progressBar.value = aiProcessed;
                if (i < items.length - 1 && i < maxAI - 1) {
                    await new Promise(r => setTimeout(r, 12000));
                }
            } catch (err) {
                console.warn(`AI gagal untuk ${item.siswa.nama}:`, err);
                naratif = fallbackNaratif(item.siswa, item.nilai);
            }
        } else {
            naratif = fallbackNaratif(item.siswa, item.nilai);
        }
        results.push({ ...item, naratif });
    }

    if (maxAI > 0 && items.length > 0) {
        Swal.close();
    }

    const finalResults = await showNaratifEditorModal(results);
    if (finalResults) generatePDFFromResults(finalResults);
}

// ==================== EVENT LISTENER & FILTER ====================
function setupFilters() {
    if (filterKelasSelect) {
        if (currentUserRole === "walas") {
            filterKelasSelect.value = guruwaliKelas;
            filterKelasSelect.disabled = true;
        } else {
            filterKelasSelect.disabled = false;
            filterKelasSelect.addEventListener("change", async (e) => { currentKelas = e.target.value; await loadSiswa(); });
        }
    }
    if (filterSemesterSelect) {
        filterSemesterSelect.value = "Ganjil";
        filterSemesterSelect.addEventListener("change", async (e) => { currentSemester = e.target.value; await loadNilai(); });
    }
    if (filterMapelSelect) {
        filterMapelSelect.value = "Matematika";
        filterMapelSelect.addEventListener("change", async (e) => { currentMapel = e.target.value; await loadNilai(); });
    }
    if (searchInput) searchInput.addEventListener("input", () => renderTable());
    if (btnSimpan) btnSimpan.addEventListener("click", simpanNilai);
    if (btnExportPDF) btnExportPDF.addEventListener("click", exportToPDF);
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", async () => {
    if (filterKelasSelect && filterKelasSelect.options.length <= 1) {
        const kelasList = ['1-A','1-B','2-A','2-B','3-A','3-B','4-A','4-B','5-A','5-B','6-A','6-B'];
        kelasList.forEach(k => { const opt = document.createElement("option"); opt.value = k; opt.innerText = k; filterKelasSelect.appendChild(opt); });
    }
    setupFilters();
    await loadSiswa();
});