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
            <td class="px-8 py-5 font-bold text-sm">${escapeHtml(row.jam)}</div>
            <td class="px-8 py-5">
                <span class="${warnaMapel} px-3 py-1 rounded-full text-xs font-bold">${escapeHtml(row.mapel)}</span>
            </div>
            <td class="px-8 py-5 text-center font-bold text-blue-600">${escapeHtml(row.kelas)}</div>
            <td class="px-8 py-5 text-center font-medium text-slate-500">${escapeHtml(row.ruang)}</div>
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
    html += '</td></thead><tbody>';
    for (let jam of jamList) {
        html += '<tr class="border-b border-slate-100">';
        html += `<td class="px-4 py-3 font-bold text-sm">${jam}</div>`;
        for (let hari of hariList) {
            const event = allRows.find(r => r.hari === hari && r.jam === jam);
            if (event) {
                const warnaMapel = getWarnaMapel(event.mapel);
                html += `<td class="px-4 py-3 text-center">
                            <div class="${warnaMapel} p-2 rounded-lg text-xs font-bold">
                                ${escapeHtml(event.mapel)}<br>
                                <span class="text-[10px] opacity-75">${escapeHtml(event.kelas)}</span>
                            </div>
                          </div>`;
            } else {
                html += `<td class="px-4 py-3 text-center text-slate-300">-</div>`;
            }
        }
        html += '</tr>';
    }
    html += '</tbody>';
    tbody.innerHTML = html;

    let backDiv = document.getElementById('backButtonContainer');
    if (backDiv) backDiv.remove();
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
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin"></i> Memuat jadwal...<\/td><\/tr>';

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
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Data guru tidak lengkap (tidak ada nama/waliKelas/mapel).<\/td><\/tr>';
                isLoadingJadwal = false;
                return;
            }
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
            tbody.innerHTML = '<td><td colspan="5" class="text-center py-10 text-slate-400">Tidak ada jadwal ditemukan untuk guru ini.<\/td><\/tr>';
            isLoadingJadwal = false;
            return;
        }

        let data = null;
        snapshot.forEach(doc => { data = doc.data(); });
        if (!data || !data.jadwal) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Struktur jadwal tidak valid.<\/td><\/tr>';
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
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Tidak ada jadwal untuk guru ini.<\/td><\/tr>';
            isLoadingJadwal = false;
            return;
        }

        currentJadwalRows = rows;
        if (currentView === 'list') renderTodayView(rows);
        else renderCalendarView(rows);

        jadwalLoaded = true;
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-500">Error: ${err.message}<\/td><\/tr>`;
    } finally {
        isLoadingJadwal = false;
    }
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", () => {
    initGuruProfile(); // Profile diurus oleh guru-profile.js
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
    initGuruProfile(); // pastikan profile terupdate setelah login
    loadJadwal();
});