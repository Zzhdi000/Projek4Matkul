// ==================== DATA GURU DARI LOCALSTORAGE ====================
let guruData = {
    nama: localStorage.getItem("userName") || "Guru",
    role: localStorage.getItem("userRole") || "guru",
    waliKelas: localStorage.getItem("waliKelas") || "",
    userId: localStorage.getItem("userId") || "",
    nip: localStorage.getItem("userNip") || "-",
    mapel: localStorage.getItem("userMapel") || "-",
    email: localStorage.getItem("userEmail") || ""
};

// ==================== PAGING STATE ====================
let pageSize = 10;
let currentPage = 1;
let lastDoc = null;
let firstDoc = null;
let currentFilterKelas = "all";
let isLoading = false;
let allStudentsCache = []; // cache untuk tombol prev/next (simpan cursor)
let cursorHistory = [];    // menyimpan lastDoc per halaman (forward)

// ==================== HELPER ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

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

// ==================== PROFILE DROPDOWN ====================
function renderProfileDropdown() {
    const dropdownContent = document.getElementById("dropdownContent");
    if (!dropdownContent) return;
    const isWaliKelas = (guruData.waliKelas && guruData.waliKelas !== "");
    const tugasText = isWaliKelas ? `Wali Kelas ${guruData.waliKelas}` : (guruData.mapel !== "-" ? guruData.mapel : "Guru Mata Pelajaran");
    const emailText = guruData.email || "email@sekolah.com";
    const nipText = (guruData.nip && guruData.nip !== "-") ? guruData.nip : "-";
    dropdownContent.innerHTML = `
        <div class="animate-fadeIn">
            <div class="mb-3">
                <label class="text-[10px] font-bold text-slate-400 uppercase ml-2">Tugas</label>
                <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 cursor-not-allowed">${escapeHtml(tugasText)}</div>
            </div>
            <div class="mb-3">
                <label class="text-[10px] font-bold text-slate-400 uppercase ml-2">NIP</label>
                <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 cursor-not-allowed">${escapeHtml(nipText)}</div>
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

// ==================== FUNGSI GANTI PASSWORD ====================
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
                <input type="password" id="oldPass" placeholder="Password Lama" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm">
            </div>
            <div class="mb-3 relative">
                <input type="password" id="newPass" placeholder="Password Baru" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm">
            </div>
            <div class="mb-3 relative">
                <input type="password" id="confirmPass" placeholder="Konfirmasi Password Baru" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm">
            </div>
            <button onclick="window.submitChangePassword()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition uppercase">Simpan Password Baru</button>
        </div>`;
};

window.submitChangePassword = async function() {
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

// ==================== JADWAL HARI INI (2 SESI TERDEKAT) ====================
async function loadTodaySchedule() {
    const container = document.getElementById("schedule-container");
    if (!container) return;

    let query;
    if (guruData.waliKelas) {
        let normalizedKelas = guruData.waliKelas.replace(/[-\s]/g, "").toUpperCase();
        query = db.collection("jadwal_guru").where("kelaswalas", "==", normalizedKelas);
    } else if (guruData.mapel && guruData.mapel !== "-") {
        query = db.collection("jadwal_guru").where("mapel", "==", guruData.mapel);
    } else {
        query = db.collection("jadwal_guru").where("nama", "==", guruData.nama);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
        container.innerHTML = `<div class="bg-slate-100 p-6 rounded-2xl text-center text-slate-500">Tidak ada jadwal mengajar.</div>`;
        return;
    }
    let data = null;
    snapshot.forEach(doc => { data = doc.data(); });
    if (!data || !data.jadwal) {
        container.innerHTML = `<div class="bg-slate-100 p-6 rounded-2xl text-center text-slate-500">Struktur jadwal tidak valid.</div>`;
        return;
    }

    const hariIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const todayName = hariIndo[new Date().getDay()];
    const hariMap = { "Senin":"senin", "Selasa":"selasa", "Rabu":"rabu", "Kamis":"kamis", "Jumat":"jumat", "Sabtu":"sabtu", "Minggu":"minggu" };
    const hariKey = hariMap[todayName];
    if (!hariKey || !data.jadwal[hariKey] || data.jadwal[hariKey].length === 0) {
        container.innerHTML = `<div class="bg-slate-100 p-6 rounded-2xl text-center text-slate-500">Tidak ada jadwal untuk hari ${todayName}.</div>`;
        return;
    }

    const events = [...data.jadwal[hariKey]];
    events.sort((a, b) => a.jam.localeCompare(b.jam));

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    // Filter jadwal yang belum lewat
    let upcoming = events.filter(ev => {
        let [h, m] = ev.jam.split("-")[0].trim().split(":").map(Number);
        return (h * 60 + m) > currentMinutes;
    });
    // Jika tidak ada upcoming, tampilkan semua (opsional, bisa tampilkan pesan khusus)
    let jadwalToShow = upcoming.length > 0 ? upcoming : events;
    // Ambil maksimal 2 sesi
    jadwalToShow = jadwalToShow.slice(0, 2);

    if (jadwalToShow.length === 0) {
        container.innerHTML = `<div class="bg-slate-100 p-6 rounded-2xl text-center text-slate-500">Tidak ada jadwal mendekati.</div>`;
        return;
    }

    let html = '';
    jadwalToShow.forEach(ev => {
        const [start, end] = ev.jam.split("-").map(t => t.trim());
        html += `
            <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 mb-3">
                <div>
                    <span class="text-[10px] font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">SESI ${ev.jam}</span>
                    <h3 class="font-bold text-slate-800 mt-2">${ev.mapel || data.mapel}</h3>
                    <p class="text-sm text-slate-500">Kelas ${ev.kelas} • Ruang ${ev.ruang || '-'}</p>
                    <p class="text-xs font-semibold text-slate-600 mt-1"><i class="far fa-clock mr-1"></i> ${start} - ${end} WIB</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

    // Tombol lihat semua jadwal (pastikan tidak duplikat)
    const scheduleSection = document.querySelector("#today-schedule");
    if (scheduleSection && !document.getElementById("btn-lihat-semua-jadwal")) {
        const btnDiv = document.createElement("div");
        btnDiv.className = "mt-4 text-center";
        btnDiv.innerHTML = `<a href="guru-jadwal.html" class="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition"><i class="fas fa-calendar-week mr-2"></i> Lihat Jadwal Lengkap</a>`;
        scheduleSection.appendChild(btnDiv);
    }
}

// ==================== PAGING SISWA (MAJU & MUNDUR) ====================
async function loadStudentsPage(reset = true, direction = 'next') {
    if (isLoading) return;
    isLoading = true;

    const bodyDaftar = document.getElementById("body-daftar");
    const bodyDataDiri = document.getElementById("body-data-diri");
    if (!bodyDaftar || !bodyDataDiri) {
        isLoading = false;
        return;
    }

    bodyDaftar.innerHTML = `<tr><td colspan="4" class="text-center py-10"><i class="fas fa-spinner fa-pulse"></i> Memuat...</td></tr>`;
    bodyDataDiri.innerHTML = `<tr><td colspan="6" class="text-center py-10"><i class="fas fa-spinner fa-pulse"></i> Memuat...</td></tr>`;

    try {
        let selectedKelas = "all";
        if (guruData.waliKelas) {
            selectedKelas = guruData.waliKelas;
        } else {
            const filterSelect = document.getElementById("filter-kelas-global");
            if (filterSelect) selectedKelas = filterSelect.value;
        }
        currentFilterKelas = selectedKelas;

        let query = db.collection("students").orderBy("nama", "asc");
        if (selectedKelas !== "all") {
            query = query.where("kelas", "==", selectedKelas);
        }

        if (reset) {
            currentPage = 1;
            lastDoc = null;
            firstDoc = null;
            cursorHistory = [];
            query = query.limit(pageSize);
        } else {
            if (direction === 'next' && lastDoc) {
                query = query.startAfter(lastDoc).limit(pageSize);
                currentPage++;
                // simpan cursor untuk memungkinkan kembali
                cursorHistory.push({ page: currentPage-1, lastDoc: lastDoc, firstDoc: firstDoc });
            } else if (direction === 'prev' && cursorHistory.length > 0) {
                const prev = cursorHistory.pop();
                currentPage = prev.page;
                // Untuk mundur, kita harus query ulang dari awal sampai halaman prev
                let baseQuery = db.collection("students").orderBy("nama", "asc");
                if (selectedKelas !== "all") baseQuery = baseQuery.where("kelas", "==", selectedKelas);
                const prevSnapshot = await baseQuery.limit(pageSize * currentPage).get();
                const docs = prevSnapshot.docs;
                const startIdx = (currentPage-1)*pageSize;
                const pageDocs = docs.slice(startIdx, startIdx+pageSize);
                if (pageDocs.length > 0) {
                    lastDoc = pageDocs[pageDocs.length-1];
                    firstDoc = pageDocs[0];
                    renderStudentTables(pageDocs);
                    updatePaginationControls(pageDocs.length, selectedKelas);
                    isLoading = false;
                    return;
                } else {
                    isLoading = false;
                    return;
                }
            } else {
                isLoading = false;
                return;
            }
        }

        const snapshot = await query.get();
        const docs = snapshot.docs;

        if (docs.length === 0 && !reset) {
            Swal.fire("Info", "Tidak ada data lagi.", "info");
            if (direction === 'next') currentPage--;
            isLoading = false;
            return;
        }

        if (docs.length > 0) {
            lastDoc = docs[docs.length-1];
            firstDoc = docs[0];
        }

        renderStudentTables(docs);
        updatePaginationControls(docs.length, selectedKelas);

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal memuat data: "+err.message, "error");
    } finally {
        isLoading = false;
    }
}

function renderStudentTables(docs) {
    const bodyDaftar = document.getElementById("body-daftar");
    const bodyDataDiri = document.getElementById("body-data-diri");
    if (!bodyDaftar || !bodyDataDiri) return;
    if (docs.length === 0) {
        bodyDaftar.innerHTML = `<tr><td colspan="4" class="text-center py-10">Tidak ada data</td></tr>`;
        bodyDataDiri.innerHTML = `<tr><td colspan="6" class="text-center py-10">Tidak ada data</td></tr>`;
        return;
    }
    let htmlDaftar = "", htmlDataDiri = "";
    docs.forEach(doc => {
        const v = doc.data();
        const id = doc.id;
        htmlDaftar += `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="px-6 py-4 font-bold">${escapeHtml(v.nama)}</td>
                <td class="px-6 py-4 font-mono">${v.nisn || '-'}</td>
                <td class="px-6 py-4"><span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">${v.status || 'Aktif'}</span></td>
                <td class="px-6 py-4 text-center"><button onclick="window.editSiswa('${id}')" class="text-blue-500 mx-1"><i class="fas fa-edit"></i></button><button onclick="window.hapusSiswa('${id}')" class="text-red-500 mx-1"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
        htmlDataDiri += `
            <tr class="border-b border-slate-100">
                <td class="px-6 py-4">${v.nisn || '-'}</td>
                <td class="px-6 py-4 font-bold">${escapeHtml(v.nama)}</td>
                <td class="px-6 py-4">${escapeHtml(v.nama_wali || '-')}</td>
                <td class="px-6 py-4">${v.no_wali || '-'}</td>
                <td class="px-6 py-4">${escapeHtml(v.alamat || '-')}</td>
                <td class="px-6 py-4 text-center"><button onclick="window.editSiswa('${id}')" class="text-blue-500 mx-1"><i class="fas fa-edit"></i></button><button onclick="window.hapusSiswa('${id}')" class="text-red-500 mx-1"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    });
    bodyDaftar.innerHTML = htmlDaftar;
    bodyDataDiri.innerHTML = htmlDataDiri;
}

function updatePaginationControls(loadedCount, kelasFilter) {
    let paginationDiv = document.getElementById("pagination-controls");
    if (!paginationDiv) {
        const mainCard = document.querySelector('.bg-white.rounded-\\[2\\.5rem\\]');
        if (mainCard) {
            paginationDiv = document.createElement("div");
            paginationDiv.id = "pagination-controls";
            paginationDiv.className = "flex justify-center items-center gap-4 mt-8 pb-4";
            const contentDiv = mainCard.querySelector('.p-8');
            if (contentDiv) contentDiv.insertAdjacentElement('afterend', paginationDiv);
            else mainCard.appendChild(paginationDiv);
        }
    }
    if (!paginationDiv) return;
    if (loadedCount < pageSize && currentPage === 1) {
        paginationDiv.style.display = "none";
        return;
    }
    paginationDiv.style.display = "flex";
    paginationDiv.innerHTML = `
        <button id="btn-prev" class="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left mr-2"></i> Sebelumnya
        </button>
        <span class="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">Halaman ${currentPage}</span>
        <button id="btn-next" class="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50" ${loadedCount < pageSize ? 'disabled' : ''}>
            Selanjutnya <i class="fas fa-chevron-right ml-2"></i>
        </button>
    `;
    document.getElementById("btn-prev")?.addEventListener("click", () => loadStudentsPage(false, 'prev'));
    document.getElementById("btn-next")?.addEventListener("click", () => loadStudentsPage(false, 'next'));
}

// ==================== CRUD SISWA ====================
window.tambahSiswa = async function() {
    let defaultKelas = guruData.waliKelas || "1-A";
    const { value: v } = await Swal.fire({
        title: "Tambah Siswa",
        html: `<div class="text-left space-y-3">
            <input id="nama" class="swal2-input w-full" placeholder="Nama Lengkap" required>
            <input id="nisn" class="swal2-input w-full" placeholder="NISN" required>
            <input id="wali" class="swal2-input w-full" placeholder="Nama Wali">
            <input id="telp" class="swal2-input w-full" placeholder="No. Telp Wali">
            <textarea id="alamat" class="swal2-textarea w-full" placeholder="Alamat"></textarea>
            <p class="text-xs text-blue-600">Kelas: ${defaultKelas}</p>
        </div>`,
        showCancelButton: true,
        confirmButtonText: "Simpan",
        preConfirm: () => ({
            nama: document.getElementById("nama").value.toUpperCase(),
            nisn: document.getElementById("nisn").value,
            wali: document.getElementById("wali").value.toUpperCase() || "-",
            telp: document.getElementById("telp").value || "-",
            alamat: document.getElementById("alamat").value || "-"
        })
    });
    if (v && v.nama && v.nisn) {
        await db.collection("students").add({
            nama: v.nama, nisn: v.nisn, nama_wali: v.wali, no_wali: v.telp,
            alamat: v.alamat, status: "Aktif", kelas: defaultKelas
        });
        Swal.fire("Berhasil", "Siswa ditambahkan", "success");
        loadStudentsPage(true);
    } else Swal.fire("Error", "Nama dan NISN wajib diisi", "error");
};

window.editSiswa = async function(id) {
    const doc = await db.collection("students").doc(id).get();
    if (!doc.exists) return;
    const data = doc.data();
    const { value: form } = await Swal.fire({
        title: "Edit Siswa",
        html: `<div class="text-left space-y-3">
            <input id="nama" class="swal2-input w-full" value="${escapeHtml(data.nama)}" required>
            <input id="wali" class="swal2-input w-full" value="${escapeHtml(data.nama_wali||'')}">
            <input id="telp" class="swal2-input w-full" value="${data.no_wali||''}">
            <textarea id="alamat" class="swal2-textarea w-full">${escapeHtml(data.alamat||'')}</textarea>
        </div>`,
        showCancelButton: true,
        confirmButtonText: "Update",
        preConfirm: () => ({
            nama: document.getElementById("nama").value.toUpperCase(),
            nama_wali: document.getElementById("wali").value.toUpperCase(),
            no_wali: document.getElementById("telp").value,
            alamat: document.getElementById("alamat").value
        })
    });
    if (form) {
        await db.collection("students").doc(id).update(form);
        Swal.fire("Berhasil", "Data diperbarui", "success");
        loadStudentsPage(true);
    }
};

window.hapusSiswa = async function(id) {
    const confirm = await Swal.fire({ title: "Hapus?", text: "Data akan dihapus permanen", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus" });
    if (confirm.isConfirmed) {
        await db.collection("students").doc(id).delete();
        Swal.fire("Terhapus", "", "success");
        loadStudentsPage(true);
    }
};

function handleImportExcel(file) {
    let defaultKelas = guruData.waliKelas || "1-A";
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        if (!json.length) { Swal.fire("Peringatan", "File kosong", "warning"); return; }
        const promises = json.map(row => db.collection("students").add({
            nisn: row.NISN || row.nisn || '',
            nama: (row.Nama || row.nama || '').toUpperCase(),
            kelas: row.Kelas || row.kelas || defaultKelas,
            nama_wali: (row.Wali || row.wali || '-').toUpperCase(),
            no_wali: row.Kontak || row.kontak || '-',
            alamat: row.Alamat || row.alamat || '-',
            status: "Aktif"
        }));
        Promise.all(promises).then(() => { Swal.fire("Sukses!", "Data diimpor", "success"); loadStudentsPage(true); }).catch(err => Swal.fire("Error", err.message, "error"));
    };
    reader.readAsArrayBuffer(file);
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", () => {
    updateHeaderProfile();
    renderProfileDropdown();
    loadTodaySchedule();
    loadStudentsPage(true);

    const profileBtn = document.getElementById("profileBtn");
    const dropdown = document.getElementById("profileDropdown");
    if (profileBtn && dropdown) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("hidden");
            if (!dropdown.classList.contains("hidden")) renderProfileDropdown();
        });
        window.addEventListener("click", (e) => {
            if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.add("hidden");
        });
    }

    const filterSelect = document.getElementById("filter-kelas-global");
    if (filterSelect && !guruData.waliKelas) {
        filterSelect.addEventListener("change", () => loadStudentsPage(true));
    }
    if (guruData.waliKelas && filterSelect) {
        filterSelect.value = guruData.waliKelas;
        filterSelect.disabled = true;
    }

    document.getElementById("btnTambahSiswa")?.addEventListener("click", () => window.tambahSiswa());
    document.getElementById("btnImportExcel")?.addEventListener("click", () => document.getElementById("upload-excel").click());
    document.getElementById("upload-excel")?.addEventListener("change", (e) => {
        if (e.target.files.length) handleImportExcel(e.target.files[0]);
        e.target.value = '';
    });

    // Tab switching
    window.switchTab = function(tab) {
        const tabDaftar = document.getElementById("tab-daftar");
        const tabData = document.getElementById("tab-data-diri");
        const contentDaftar = document.getElementById("content-daftar");
        const contentData = document.getElementById("content-data-diri");
        if (!tabDaftar || !tabData || !contentDaftar || !contentData) return;
        if (tab === "daftar") {
            tabDaftar.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white";
            tabData.className = "px-8 py-4 text-sm font-bold text-slate-400";
            contentDaftar.classList.remove("hidden");
            contentData.classList.add("hidden");
        } else {
            tabData.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white";
            tabDaftar.className = "px-8 py-4 text-sm font-bold text-slate-400";
            contentData.classList.remove("hidden");
            contentDaftar.classList.add("hidden");
        }
    };
});

// Firebase auth state
firebase.auth().onAuthStateChanged((user) => {
    if (user && user.email) guruData.email = user.email;
    updateHeaderProfile();
    renderProfileDropdown();
    loadTodaySchedule();
});