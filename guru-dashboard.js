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

// ==================== FUNGSI UPDATE HEADER PROFILE ====================
function updateHeaderProfile() {
    // Nama di header (sebelah kanan tombol profile)
    const namaHeader = document.querySelector("#profileBtn .text-right p:last-child");
    if (namaHeader && guruData.nama) {
        namaHeader.innerText = guruData.nama;
    }
    // Inisial avatar header
    const avatarHeader = document.querySelector("#profileBtn .rounded-full");
    if (avatarHeader && guruData.nama) {
        const inisial = guruData.nama.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
        avatarHeader.innerText = inisial;
    }
    // Avatar besar di dropdown
    const avatarDropdown = document.querySelector("#profileDropdown .w-16.h-16");
    if (avatarDropdown && guruData.nama) {
        const inisial = guruData.nama.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
        avatarDropdown.innerText = inisial;
    }
    // Nama di dropdown
    const namaDropdown = document.querySelector("#profileDropdown h4");
    if (namaDropdown && guruData.nama) {
        namaDropdown.innerText = guruData.nama;
    }
    // NIP di dropdown
    /*const nipDropdown = document.querySelector("#profileDropdown .text-slate-400.font-bold");
    if (nipDropdown) {
        if (guruData.nip && guruData.nip !== "-") {
            nipDropdown.innerText = `NIP: ${guruData.nip}`;
        } else {
            nipDropdown.innerText = "";
        }
    }*/
}

// ==================== PROFILE DROPDOWN CONTENT (DINAMIS) ====================
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

// ==================== FORM GANTI PASSWORD ====================
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

// Toggle show/hide password field
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

// Proses ganti password ke Firebase Auth
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
        // Kembali ke tampilan profile
        renderProfileDropdown();
        const profileDropdown = document.getElementById("profileDropdown");
        if (profileDropdown) profileDropdown.classList.add("hidden");
    } catch (error) {
        let pesan = "Gagal mengganti password. Periksa password lama.";
        if (error.code === 'auth/wrong-password') pesan = "Password lama salah.";
        Swal.fire("Error", pesan, "error");
    }
};
// ==================== PROSES FORGOT PASSWORD (KIRIM EMAIL RESET) ====================
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
        // Optional: kembali ke tampilan profile setelah 2 detik
        setTimeout(() => {
            renderProfileDropdown();
        }, 2000);
    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Gagal mengirim email reset. " + error.message, "error");
    }
};

// Reset dropdown (panggil renderProfileDropdown)
window.resetDropdown = function() {
    renderProfileDropdown();
};

// Form ganti password
window.ubahKeFormPassword = function(e) {
    if (e) e.stopPropagation();
    const dropdownContent = document.getElementById("dropdownContent");
    if (!dropdownContent) return;
    dropdownContent.innerHTML = `
        <div class="animate-fadeIn">
            <div class="flex items-center mb-4"><button onclick="window.resetDropdown()" class="text-slate-400 hover:text-slate-800 mr-2"><i class="fas fa-arrow-left text-xs"></i></button><h4 class="text-xs font-black text-slate-800 uppercase">Ganti Password</h4></div>
            <input type="password" id="oldPass" placeholder="Password Lama" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500">
            <input type="password" id="newPass" placeholder="Password Baru" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="window.simpanDanReset(event)" class="w-full bg-slate-800 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold transition uppercase">Simpan</button>
        </div>`;
};

window.simpanDanReset = async function(e) {
    if (e) e.stopPropagation();
    const oldPass = document.getElementById("oldPass").value;
    const newPass = document.getElementById("newPass").value;
    if (!oldPass || !newPass) {
        Swal.fire("Error", "Password lama dan baru harus diisi", "error");
        return;
    }
    if (newPass.length < 6) {
        Swal.fire("Error", "Password baru minimal 6 karakter", "error");
        return;
    }
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error("User tidak terautentikasi");
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPass);
        Swal.fire({ title: "Berhasil!", text: "Password diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
        renderProfileDropdown();
        const profileDropdown = document.getElementById("profileDropdown");
        if (profileDropdown) profileDropdown.classList.add("hidden");
    } catch (error) {
        let pesan = "Gagal mengganti password. Periksa password lama.";
        if (error.code === 'auth/wrong-password') pesan = "Password lama salah.";
        Swal.fire("Error", pesan, "error");
    }
};

window.toggleViewPassword = function(event, targetId, iconId) {
    if (event) event.stopPropagation();
    const target = document.getElementById(targetId);
    const icon = document.getElementById(iconId);
    if (target && icon) {
        if (target.innerText === "••••••••") {
            target.innerText = "●●●●●●●●";
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            target.innerText = "••••••••";
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
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

// ==================== JADWAL & JAM ====================
const listJadwal = [
    { id: 1, mapel: "Bahasa Indonesia", kelas: "4-A", ruang: "04", mulai: "07:30", selesai: "09:00", warna: "blue" },
    { id: 2, mapel: "Bahasa Indonesia", kelas: "5-B", ruang: "12", mulai: "09:15", selesai: "10:45", warna: "indigo" },
    { id: 3, mapel: "Istirahat", kelas: "-", ruang: "Kantin", mulai: "10:45", selesai: "11:15", warna: "slate", isBreak: true },
    { id: 4, mapel: "Bahasa Indonesia", kelas: "6-A", ruang: "02", mulai: "11:15", selesai: "12:30", warna: "emerald" },
];

const filterKelasSelect = document.getElementById("filter-kelas-global");
let lastScheduleHTML = "";

function updateScheduleUI() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const clockElem = document.getElementById("live-clock");
    if (clockElem) clockElem.innerText = `${hours}:${minutes}:${seconds}`;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const container = document.getElementById("schedule-container");
    const countText = document.getElementById("schedule-count");
    if (!container || !countText) return;

    const jadwalAktif = listJadwal.filter(item => {
        const [hSelesai, mSelesai] = item.selesai.split(":").map(Number);
        return hSelesai * 60 + mSelesai > currentTime;
    });

    if (jadwalAktif.length === 0) {
        countText.innerText = "Semua tugas hari ini selesai ✨";
        const finishedHTML = `<div class="col-span-full bg-emerald-50 border-2 border-dashed border-emerald-200 p-10 rounded-[2.5rem] text-center"><i class="fas fa-check-circle text-4xl text-emerald-500 mb-3"></i><p class="text-emerald-800 font-bold uppercase text-xs tracking-widest">Kerja bagus! Jadwal mengajar Anda sudah berakhir.</p></div>`;
        if (lastScheduleHTML !== finishedHTML) {
            container.innerHTML = finishedHTML;
            lastScheduleHTML = finishedHTML;
        }
        return;
    }

    countText.innerText = `${jadwalAktif.length} Sesi tersisa`;
    const currentHTML = jadwalAktif.map((item, index) => {
        const [hMulai, mMulai] = item.mulai.split(":").map(Number);
        const isOngoing = currentTime >= hMulai * 60 + mMulai;
        const statusLabel = isOngoing ? "SEDANG BERLANGSUNG" : (item.isBreak ? "ISTIRAHAT" : "SESI " + (index + 1));
        const borderClass = isOngoing ? "border-orange-500" : `border-${item.warna}-500`;
        const bgClass = isOngoing ? "bg-white ring-4 ring-orange-50 scale-[1.02]" : (item.isBreak ? "bg-slate-200/50 opacity-80" : "bg-white");
        const textClass = isOngoing ? "text-orange-500" : `text-${item.warna}-500`;
        return `
        <div class="${bgClass} p-6 rounded-[2.5rem] border-l-[12px] ${borderClass} shadow-sm transition-all relative">
            ${isOngoing ? '<span class="absolute top-4 right-6 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>' : ""}
            <div class="flex justify-between items-start mb-4"><span class="text-[10px] font-black ${textClass} uppercase tracking-[0.2em]">${statusLabel}</span></div>
            <h4 class="text-lg font-black ${item.isBreak ? "text-slate-400" : "text-slate-800"} leading-tight mb-1">${item.mapel}</h4>
            <p class="text-sm ${item.isBreak ? "text-slate-400" : "text-slate-500"} font-bold mb-4">${item.kelas !== "-" ? "Kelas " + item.kelas : ""} <span class="mx-1 ${item.isBreak ? "hidden" : "text-slate-300"}">•</span> ${item.ruang}</p>
            <div class="flex items-center text-xs font-black ${isOngoing ? "text-orange-600 bg-orange-50" : "text-slate-400 bg-slate-50"} rounded-xl px-4 py-2 w-fit"><i class="far fa-clock mr-2"></i> ${item.mulai} - ${item.selesai} WIB</div>
        </div>`;
    }).join("");
    if (lastScheduleHTML !== currentHTML) {
        container.innerHTML = currentHTML;
        lastScheduleHTML = currentHTML;
    }
}

const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
const dateElem = document.getElementById("currentDate");
if (dateElem) dateElem.innerText = new Date().toLocaleDateString("id-ID", options);

setInterval(updateScheduleUI, 1000);
updateScheduleUI();

// ==================== FIRESTORE & CRUD SISWA ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function loadStudents() {
    const bodyDaftar = document.getElementById("body-daftar");
    const bodyDataDiri = document.getElementById("body-data-diri");
    if (!bodyDaftar || !bodyDataDiri) return;

    let query = db.collection("students").orderBy("nama", "asc");
    if (guruData.waliKelas) {
        query = query.where("kelas", "==", guruData.waliKelas);
    } else {
        const selectedKelas = filterKelasSelect ? filterKelasSelect.value : "all";
        if (selectedKelas !== "all") {
            query = query.where("kelas", "==", selectedKelas);
        }
    }

    query.onSnapshot((snapshot) => {
        bodyDaftar.innerHTML = "";
        bodyDataDiri.innerHTML = "";
        if (snapshot.empty) {
            const emptyRow = `<tr><td colspan="6" class="p-8 text-center text-slate-400 italic">Tidak ada data untuk kelas ini</td></tr>`;
            bodyDaftar.innerHTML = emptyRow;
            bodyDataDiri.innerHTML = emptyRow;
            return;
        }
        snapshot.forEach((doc) => {
            const v = doc.data();
            const id = doc.id;
            const rowDaftar = `<tr class="hover:bg-slate-50/80 transition animate-fadeIn border-b border-slate-100">
                <td class="px-6 py-5 font-bold text-slate-700 uppercase tracking-tight">${escapeHtml(v.nama)}</td>
                <td class="px-6 py-5 font-mono text-slate-400">${v.nisn || '-'}</td>
                <td class="px-6 py-5"><span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">${v.status || 'Aktif'}</span></td>
                <td class="px-6 py-5 text-center"><button onclick="window.editSiswa('${id}')" class="text-blue-500 mx-2 hover:scale-110 transition"><i class="fas fa-edit"></i></button><button onclick="window.hapusSiswa('${id}')" class="text-red-500 mx-2 hover:scale-110 transition"><i class="fas fa-trash"></i></button></td>
             </tr>`;
            const rowDataDiri = `<tr class="bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-all animate-fadeIn">
                <td class="px-6 py-5 font-mono text-slate-400 rounded-l-2xl">${v.nisn || '-'}</td>
                <td class="px-6 py-5 font-bold text-slate-700 uppercase tracking-tight">${escapeHtml(v.nama)}</td>
                <td class="px-6 py-5 text-slate-600 font-medium">${escapeHtml(v.nama_wali || v.wali || '-')}</td>
                <td class="px-6 py-5 font-mono text-slate-500">${v.no_wali || v.kontak || '-'}</td>
                <td class="px-6 py-5 text-slate-400 italic text-sm">${escapeHtml(v.alamat || '-')}</td>
                <td class="px-6 py-5 text-center rounded-r-2xl"><button onclick="window.editSiswa('${id}')" class="text-blue-500 mx-2"><i class="fas fa-edit"></i></button><button onclick="window.hapusSiswa('${id}')" class="text-red-500 mx-2"><i class="fas fa-trash"></i></button></td>
             </tr>`;
            bodyDaftar.insertAdjacentHTML("beforeend", rowDaftar);
            bodyDataDiri.insertAdjacentHTML("beforeend", rowDataDiri);
        });
    });
}

window.tambahSiswa = async function() {
    let defaultKelas = '1-A';
    if (guruData.waliKelas) defaultKelas = guruData.waliKelas;
    else if (filterKelasSelect && filterKelasSelect.value !== 'all') defaultKelas = filterKelasSelect.value;

    const { value: v } = await Swal.fire({
        title: "Tambah Siswa Baru",
        html: `
        <div class="text-left px-1 pb-4">
            <div class="mb-4"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Lengkap</label><input id="n" class="swal2-input !m-0 w-full !text-sm !h-11" placeholder="Masukkan nama lengkap siswa"></div>
            <div class="mb-4"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">NISN</label><input id="ni" class="swal2-input !m-0 w-full !text-sm !h-11" placeholder="Masukkan 10 digit NISN"></div>
            <div class="flex gap-4 mb-4"><div class="flex-1"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Wali</label><input id="w" class="swal2-input !m-0 w-full !text-sm !h-11" placeholder="Nama ayah/ibu"></div><div class="flex-1"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">No. Wali</label><input id="t" class="swal2-input !m-0 w-full !text-sm !h-11" placeholder="08xxxxxx"></div></div>
            <div><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Alamat</label><textarea id="a" class="swal2-textarea !m-0 w-full !text-sm" placeholder="Alamat lengkap rumah..."></textarea></div>
            <div class="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100"><p class="text-[10px] text-blue-600 font-bold uppercase">Otomatis Terdaftar di:</p><p class="text-sm font-bold text-blue-800">Kelas ${defaultKelas}</p></div>
        </div>`,
        showCancelButton: true,
        confirmButtonText: "Tambahkan Siswa",
        confirmButtonColor: "#059669",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-[2rem]" },
        preConfirm: () => {
            const nama = document.getElementById("n").value;
            const nisn = document.getElementById("ni").value;
            if (!nama || !nisn) { Swal.showValidationMessage("Nama dan NISN wajib diisi!"); return false; }
            return { nama: nama.toUpperCase(), nisn, wali: document.getElementById("w").value || "-", telp: document.getElementById("t").value || "-", alamat: document.getElementById("a").value || "-" };
        }
    });
    if (v) {
        try {
            await db.collection("students").add({ nama: v.nama, nisn: v.nisn, nama_wali: v.wali.toUpperCase(), no_wali: v.telp, alamat: v.alamat, status: "Aktif", kelas: defaultKelas });
            Swal.fire({ icon: "success", title: "Berhasil!", text: `Siswa baru terdaftar di Kelas ${defaultKelas}.`, timer: 1500, showConfirmButton: false });
        } catch (error) { Swal.fire("Error", "Gagal menyimpan: " + error.message, "error"); }
    }
};

window.editSiswa = async function(id) {
    try {
        const docSnap = await db.collection("students").doc(id).get();
        if (!docSnap.exists) return;
        const data = docSnap.data();
        const { value: formValues } = await Swal.fire({
            title: "Edit Data Siswa",
            html: `
            <div class="text-left space-y-3 px-1">
                <div><label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Lengkap</label><input id="swal-nama" class="swal2-input !m-0 w-full" value="${escapeHtml(data.nama)}"></div>
                <div><label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Wali</label><input id="swal-wali" class="swal2-input !m-0 w-full" value="${escapeHtml(data.nama_wali || '')}"></div>
                <div><label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">No. Wali</label><input id="swal-telp" class="swal2-input !m-0 w-full" value="${data.no_wali || ''}"></div>
                <div><label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Alamat</label><textarea id="swal-alamat" class="swal2-textarea !m-0 w-full">${escapeHtml(data.alamat || '')}</textarea></div>
            </div>`,
            showCancelButton: true,
            confirmButtonText: "Simpan Perubahan",
            confirmButtonColor: "#2563eb",
            cancelButtonText: "Batal",
            preConfirm: () => ({ nama: document.getElementById("swal-nama").value.toUpperCase(), nama_wali: document.getElementById("swal-wali").value.toUpperCase(), no_wali: document.getElementById("swal-telp").value, alamat: document.getElementById("swal-alamat").value })
        });
        if (formValues) {
            await db.collection("students").doc(id).update(formValues);
            Swal.fire({ icon: "success", title: "Berhasil!", text: "Data siswa diperbarui.", timer: 1500, showConfirmButton: false });
        }
    } catch (error) { Swal.fire("Error", "Gagal update: " + error.message, "error"); }
};

window.hapusSiswa = async function(id) {
    const result = await Swal.fire({ title: "Hapus Data?", text: "Data akan dihapus permanen!", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Hapus!", cancelButtonText: "Batal" });
    if (result.isConfirmed) {
        try {
            await db.collection("students").doc(id).delete();
            Swal.fire({ title: "Terhapus!", icon: "success", timer: 1000, showConfirmButton: false });
        } catch (error) { Swal.fire("Error", "Gagal hapus: " + error.message, "error"); }
    }
};

// Import Excel
function handleImportExcel(file) {
    let defaultKelas = '1-A';
    if (guruData.waliKelas) defaultKelas = guruData.waliKelas;
    else if (filterKelasSelect && filterKelasSelect.value !== 'all') defaultKelas = filterKelasSelect.value;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        if (jsonData.length === 0) { Swal.fire("Peringatan", "File kosong", "warning"); return; }
        const promises = jsonData.map(s => db.collection("students").add({
            nisn: s.NISN || s.nisn || '',
            nama: (s.Nama || s.nama || '').toUpperCase(),
            kelas: s.Kelas || s.kelas || defaultKelas,
            nama_wali: (s.Wali || s.wali || '-').toUpperCase(),
            no_wali: s.Kontak || s.kontak || '-',
            alamat: s.Alamat || s.alamat || '-',
            status: "Aktif"
        }));
        Promise.all(promises).then(() => Swal.fire("Berhasil!", `Data diimpor ke Kelas ${defaultKelas}`, "success")).catch(err => Swal.fire("Error", "Gagal impor", "error"));
    };
    reader.readAsArrayBuffer(file);
}

// ==================== SEARCH & TAB ====================
function setupSearch(inputId, tableBodyId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener("input", function() {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll(`#${tableBodyId} tr`);
        rows.forEach(row => row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none");
    });
}

// Tab switching - expose ke global untuk onclick di HTML
function switchToTab(tab) {
    const tabDaftarBtn = document.getElementById("tab-daftar");
    const tabDataDiriBtn = document.getElementById("tab-data-diri");
    const contentDaftarDiv = document.getElementById("content-daftar");
    const contentDataDiriDiv = document.getElementById("content-data-diri");
    if (!tabDaftarBtn || !tabDataDiriBtn || !contentDaftarDiv || !contentDataDiriDiv) return;
    if (tab === "daftar") {
        tabDaftarBtn.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white transition-all";
        tabDataDiriBtn.className = "px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all";
        contentDaftarDiv.classList.remove("hidden");
        contentDataDiriDiv.classList.add("hidden");
    } else {
        tabDataDiriBtn.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white transition-all";
        tabDaftarBtn.className = "px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all";
        contentDataDiriDiv.classList.remove("hidden");
        contentDaftarDiv.classList.add("hidden");
    }
}
window.switchTab = switchToTab; // supaya bisa dipanggil dari HTML onclick

// Filter kelas
if (filterKelasSelect && !guruData.waliKelas) {
    filterKelasSelect.addEventListener("change", () => loadStudents());
}

// Jika wali kelas, disable filter dan tambahkan label
if (guruData.waliKelas && filterKelasSelect) {
    filterKelasSelect.value = guruData.waliKelas;
    filterKelasSelect.disabled = true;
    if (!document.querySelector(".wali-label")) {
        const span = document.createElement("span");
        span.className = "ml-3 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full wali-label";
        span.innerText = `Wali Kelas ${guruData.waliKelas}`;
        filterKelasSelect.parentNode.appendChild(span);
    }
}

// Tombol import & tambah
document.getElementById("btnTambahSiswa")?.addEventListener("click", () => window.tambahSiswa());
document.getElementById("btnImportExcel")?.addEventListener("click", () => document.getElementById("upload-excel").click());
document.getElementById("upload-excel")?.addEventListener("change", (e) => {
    if (e.target.files.length) handleImportExcel(e.target.files[0]);
    e.target.value = '';
});

// ==================== INISIALISASI ====================
updateHeaderProfile();
renderProfileDropdown();
setupSearch("search-daftar", "body-daftar");
setupSearch("search-data-diri", "body-data-diri");
loadStudents();