// ==================== DATA GURU DARI LOCALSTORAGE ====================
let guruData = {
    nama: localStorage.getItem("userName") || "Guru",
    role: localStorage.getItem("userRole") || "guru",
    waliKelas: localStorage.getItem("waliKelas") || "",
    userId: localStorage.getItem("userId") || "",
    mapel: localStorage.getItem("userMapel") || "",
    email: localStorage.getItem("userEmail") || ""
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function normalizeKelas(kelas) {
    if (!kelas) return "";
    return kelas.replace(/[-\s]/g, "").toUpperCase();
}

function updateProfileUI() {
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
    const roleDropdown = document.querySelector("#profileDropdown p");
    if (roleDropdown) {
        if (guruData.waliKelas) roleDropdown.innerText = `Wali Kelas ${guruData.waliKelas}`;
        else roleDropdown.innerText = guruData.mapel || "Guru Mata Pelajaran";
    }
}

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
            <button onclick="window.submitChangePassword()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition uppercase">Simpan Password Baru</button>
        </div>`;
};

window.togglePasswordField = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector('i');
    if (input.type === "password") { input.type = "text"; icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
    else { input.type = "password"; icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
};

window.submitChangePassword = async function() {
    const oldPass = document.getElementById("oldPass").value;
    const newPass = document.getElementById("newPass").value;
    const confirmPass = document.getElementById("confirmPass").value;
    if (!oldPass || !newPass || !confirmPass) { Swal.fire("Error", "Semua field harus diisi", "error"); return; }
    if (newPass.length < 6) { Swal.fire("Error", "Password baru minimal 6 karakter", "error"); return; }
    if (newPass !== confirmPass) { Swal.fire("Error", "Password baru dan konfirmasi tidak cocok", "error"); return; }
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

// ==================== WARNA PER MAPEL ====================
function getWarnaMapel(mapel) {
    const petaWarna = {
        'bahasa indonesia': 'bg-blue-200 text-blue-800',
        'matematika': 'bg-red-200 text-red-800',
        'ipa': 'bg-green-200 text-green-800',
        'ips': 'bg-yellow-200 text-yellow-800',
        'pkn': 'bg-purple-200 text-purple-800',
        'pai': 'bg-indigo-200 text-indigo-800',
        'pjok': 'bg-orange-200 text-orange-800',
        'sbdp': 'bg-pink-200 text-pink-800',
        'bahasa inggris': 'bg-cyan-200 text-cyan-800',
        'bahasa jawa': 'bg-amber-200 text-amber-800',
        'jawa': 'bg-amber-200 text-amber-800',
        'tik': 'bg-teal-200 text-teal-800',
        'informatika': 'bg-lime-200 text-lime-800',
        'seni budaya': 'bg-rose-200 text-rose-800',
        'penjaskes': 'bg-orange-200 text-orange-800',
        'agama': 'bg-emerald-200 text-emerald-800',
        'mulok': 'bg-violet-200 text-violet-800',
        'ipas': 'bg-sky-200 text-sky-800'
    };
    const kunci = mapel.toLowerCase();
    return petaWarna[kunci] || 'bg-gray-200 text-gray-800';
}

// ==================== RENDER JADWAL HARI INI (LIST) & KALENDER (SEMUA) ====================
let currentView = 'list';      // 'list' (harian) atau 'calendar'
let currentJadwalRows = [];    // semua jadwal (mentah)

function getHariIni() {
    const hariIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const today = new Date();
    return hariIndo[today.getDay()];
}

function renderTodayView(allRows) {
    const tbody = document.getElementById("jadwal-body");
    if (!tbody) return;

    // Hapus tombol kembali dari tampilan sebelumnya
    const existingBack = document.getElementById("backButtonContainer");
    if (existingBack) existingBack.remove();

    const hariIni = getHariIni();
    const filteredRows = allRows.filter(row => row.hari === hariIni);

    if (filteredRows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-10 text-slate-400">
                    <i class="fas fa-calendar-day text-3xl mb-2 block"></i>
                    Tidak ada jadwal untuk hari <strong>${hariIni}</strong>.
                    <div class="mt-3">
                        <button id="gotoCalendarBtn" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
                            <i class="fas fa-calendar-week mr-1"></i> Lihat semua jadwal mingguan
                        </button>
                    </div>
                </td>
            </tr>
        `;
        const gotoBtn = document.getElementById("gotoCalendarBtn");
        if (gotoBtn) {
            gotoBtn.addEventListener("click", () => {
                currentView = 'calendar';
                renderCalendarView(currentJadwalRows);
            });
        }
        return;
    }

    filteredRows.sort((a,b) => a.jam.localeCompare(b.jam));
    tbody.innerHTML = '';
    filteredRows.forEach(row => {
        let badgeClass = "bg-slate-100 text-slate-700";
        if (row.hari === "Senin") badgeClass = "bg-blue-100 text-blue-700";
        else if (row.hari === "Selasa") badgeClass = "bg-emerald-100 text-emerald-700";
        else if (row.hari === "Rabu") badgeClass = "bg-orange-100 text-orange-700";
        else if (row.hari === "Kamis") badgeClass = "bg-purple-100 text-purple-700";
        else if (row.hari === "Jumat") badgeClass = "bg-rose-100 text-rose-700";

        const warnaMapel = getWarnaMapel(row.mapel);
        const tr = tbody.insertRow();
        tr.className = "hover:bg-slate-50/50 transition";
        tr.innerHTML = `
            <td class="px-8 py-5"><span class="${badgeClass} px-3 py-1 rounded-full text-[10px] font-black uppercase">${row.hari}</span></td>
            <td class="px-8 py-5 font-bold text-sm">${escapeHtml(row.jam)}</td>
            <td class="px-8 py-5">
                <span class="${warnaMapel} px-3 py-1 rounded-full text-xs font-bold">${escapeHtml(row.mapel)}</span>
            </td>
            <td class="px-8 py-5 text-center font-bold text-blue-600">${escapeHtml(row.kelas)}</td>
            <td class="px-8 py-5 text-center font-medium text-slate-500">${escapeHtml(row.ruang)}</td>
        `;
    });
}

function renderCalendarView(allRows) {
    const tbody = document.getElementById("jadwal-body");
    if (!tbody) return;
    const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const jamSet = new Set();
    allRows.forEach(row => jamSet.add(row.jam));
    const jamList = Array.from(jamSet).sort((a,b) => {
        const getMinutes = (jam) => {
            let start = jam.split("-")[0].trim();
            let [h,m] = start.split(":").map(Number);
            return h*60 + m;
        };
        return getMinutes(a) - getMinutes(b);
    });
    let html = '<thead class="bg-slate-50/50 border-b border-slate-100">';
    html += '<tr class="text-slate-400 text-[10px] uppercase font-black tracking-[0.15em]">';
    html += '<th class="px-4 py-3">Jam / Hari</th>';
    hariList.forEach(hari => html += `<th class="px-4 py-3 text-center">${hari}</th>`);
    html += '</tr></thead><tbody>';
    for (let jam of jamList) {
        html += '<tr class="border-b border-slate-100">';
        html += `<td class="px-4 py-3 font-bold text-sm">${jam}</td>`;
        for (let hari of hariList) {
            const event = allRows.find(r => r.hari === hari && r.jam === jam);
            if (event) {
                const warnaMapel = getWarnaMapel(event.mapel);
                html += `<td class="px-4 py-3 text-center">
                            <div class="${warnaMapel} p-2 rounded-lg text-xs font-bold">
                                ${escapeHtml(event.mapel)}<br>
                                <span class="text-[10px] opacity-75">${escapeHtml(event.kelas)}</span>
                            </div>
                         </td>`;
            } else {
                html += `<td class="px-4 py-3 text-center text-slate-300">-</td>`;
            }
        }
        html += '</tr>';
    }
    html += '</tbody>';
    tbody.innerHTML = html;

    // Hapus container tombol kembali yang mungkin sudah ada
    let backDiv = document.getElementById('backButtonContainer');
    if (backDiv) backDiv.remove();
    // Tambahkan tombol kembali di bawah tabel
    backDiv = document.createElement('div');
    backDiv.id = 'backButtonContainer';
    backDiv.className = 'flex justify-center mt-6';
    const tableContainer = tbody.closest('.overflow-x-auto');
    if (tableContainer && tableContainer.parentNode) {
        tableContainer.parentNode.insertBefore(backDiv, tableContainer.nextSibling);
    } else {
        tbody.parentNode.insertBefore(backDiv, tbody.parentNode.nextSibling);
    }
    backDiv.innerHTML = `
        <button id="dynamicBackBtn" class="bg-gray-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition shadow-sm flex items-center">
            <i class="fas fa-arrow-left mr-2"></i> Kembali ke Jadwal Hari Ini
        </button>
    `;
    const backBtn = document.getElementById('dynamicBackBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            currentView = 'list';
            renderTodayView(currentJadwalRows);
            const cont = document.getElementById('backButtonContainer');
            if (cont) cont.remove();
        };
    }
}

// ==================== LOAD JADWAL DARI FIRESTORE ====================
let isLoadingJadwal = false;
let jadwalLoaded = false;

async function loadJadwal() {
    if (isLoadingJadwal || jadwalLoaded) return;
    isLoadingJadwal = true;

    guruData.waliKelas = localStorage.getItem("waliKelas") || "";
    guruData.mapel = localStorage.getItem("userMapel") || "";
    guruData.nama = localStorage.getItem("userName") || "Guru";

    const tbody = document.getElementById("jadwal-body");
    if (!tbody) { isLoadingJadwal = false; return; }
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin"></i> Memuat jadwal...您</tr>';

    try {
        let query;
        if (guruData.waliKelas && guruData.waliKelas !== "") {
            let normalized = normalizeKelas(guruData.waliKelas);
            query = db.collection("jadwal_guru").where("kelaswalas", "==", normalized);
        } else if (guruData.mapel && guruData.mapel !== "") {
            query = db.collection("jadwal_guru").where("mapel", "==", guruData.mapel);
        } else {
            if (guruData.nama) {
                query = db.collection("jadwal_guru").where("nama", "==", guruData.nama);
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Data guru tidak lengkap (tidak ada nama/waliKelas/mapel).</td></tr>';
                isLoadingJadwal = false;
                return;
            }
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Tidak ada jadwal ditemukan untuk guru ini.</td></tr>';
            isLoadingJadwal = false;
            return;
        }

        let data = null;
        snapshot.forEach(doc => { data = doc.data(); });
        if (!data || !data.jadwal) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Struktur jadwal tidak valid.</td></tr>';
            isLoadingJadwal = false;
            return;
        }

        const jadwalObj = data.jadwal;
        const hariList = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
        const hariIndonesia = { senin:"Senin", selasa:"Selasa", rabu:"Rabu", kamis:"Kamis", jumat:"Jumat", sabtu:"Sabtu" };

        const allJam = new Set();
        for (let hari of hariList) {
            (jadwalObj[hari] || []).forEach(ev => { if (ev.jam) allJam.add(ev.jam); });
        }
        const sortedJam = Array.from(allJam).sort((a,b) => {
            const getMin = (jam) => { let start = jam.split("-")[0].trim(), [h,m] = start.split(":").map(Number); return h*60 + m; };
            return getMin(a) - getMin(b);
        });

        let rows = [];
        for (let jam of sortedJam) {
            for (let hari of hariList) {
                const events = jadwalObj[hari] || [];
                const event = events.find(ev => ev.jam === jam);
                if (event) {
                    rows.push({
                        hari: hariIndonesia[hari],
                        jam: jam,
                        mapel: event.mapel || data.mapel || "-",
                        kelas: event.kelas || (guruData.waliKelas ? guruData.waliKelas : "-"),
                        ruang: "-"
                    });
                }
            }
        }
        rows.sort((a,b) => {
            const urutan = { Senin:1, Selasa:2, Rabu:3, Kamis:4, Jumat:5, Sabtu:6 };
            return (urutan[a.hari] - urutan[b.hari]) || a.jam.localeCompare(b.jam);
        });

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Tidak ada jadwal untuk guru ini.</td></tr>';
            isLoadingJadwal = false;
            return;
        }

        currentJadwalRows = rows;
        if (currentView === 'list') renderTodayView(rows);
        else renderCalendarView(rows);

        jadwalLoaded = true;
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-500">Error: ${err.message}</td></tr>`;
    } finally {
        isLoadingJadwal = false;
    }
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.getElementById("profileBtn");
    const dropdown = document.getElementById("profileDropdown");
    if (profileBtn && dropdown) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("hidden");
            if (!dropdown.classList.contains("hidden")) renderProfileDropdown();
        });
        window.addEventListener("click", () => dropdown.classList.add("hidden"));
    }
    updateProfileUI();
});

let authTriggered = false;
firebase.auth().onAuthStateChanged((user) => {
    if (authTriggered) return;
    authTriggered = true;
    if (user && user.email) {
        guruData.email = user.email;
        localStorage.setItem("userEmail", user.email);
    } else {
        guruData.email = localStorage.getItem("userEmail") || "";
    }
    updateProfileUI();
    renderProfileDropdown();
    loadJadwal();
});