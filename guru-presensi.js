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

// ==================== EVENT PROFILE BUTTON ====================
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

// Inisialisasi profile
updateHeaderProfile();
renderProfileDropdown();

// ==================== GURU PRESENSI - FUNGSI UTAMA ====================
const userName = localStorage.getItem("userName");
const guruwaliKelas = localStorage.getItem("waliKelas");

const searchInput = document.getElementById("search-input");
const dateInput = document.querySelector('input[type="date"]');
const filterKelasSelect = document.getElementById("filter-kelas-presensi");

let allSiswa = [];
let currentKelasFilter = "all";
let selectedDate = new Date().toISOString().slice(0, 10);

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m]);
}

// ==================== LOAD SISWA (DENGAN FILTER KELAS) ====================
async function loadSiswaForPresensi() {
  try {
    let query = db.collection("students").orderBy("nama", "asc");
    
    // Jika wali kelas, hanya tampilkan kelas wali (abaikan filter dropdown)
    if (guruwaliKelas && guruwaliKelas !== "null") {
      query = query.where("kelas", "==", guruwaliKelas);
      // Nonaktifkan dropdown untuk wali kelas
      if (filterKelasSelect) {
        filterKelasSelect.disabled = true;
        filterKelasSelect.value = guruwaliKelas;
      }
      currentKelasFilter = guruwaliKelas;
    } else {
      // Guru mapel: gunakan filter dari dropdown
      if (filterKelasSelect) {
        filterKelasSelect.disabled = false;
        currentKelasFilter = filterKelasSelect.value;
      }
      if (currentKelasFilter !== "all") {
        query = query.where("kelas", "==", currentKelasFilter);
      }
    }

    const snapshot = await query.get();
    allSiswa = [];
    snapshot.forEach((doc) => allSiswa.push({ id: doc.id, ...doc.data() }));
    renderDaftarSiswa(searchInput ? searchInput.value : "");
    
    // Jika tab rekap sedang aktif, refresh rekap juga
    const rekapTab = document.getElementById("content-rekap");
    if (rekapTab && !rekapTab.classList.contains("hidden")) {
      loadRekapPresensi();
    }
  } catch (error) {
    console.error("Gagal ambil data:", error);
  }
}

// ==================== LOAD REKAP (BERDASARKAN allSiswa YANG SUDAH DIFILTER) ====================
window.loadRekapPresensi = async function () {
  const tbody = document.querySelector("#rekap-table-body");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-400 font-medium italic"><i class="fas fa-spinner fa-spin mr-2"></i> Menghitung kehadiran...</td></tr>`;

  try {
    const presensiSnapshot = await db.collection("presensi").get();
    const rekapData = {};

    // Inisialisasi hanya untuk siswa yang sedang ditampilkan (berdasarkan filter)
    allSiswa.forEach((s) => {
      rekapData[s.id] = {
        id: s.id,
        nama: s.nama,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alfa: 0,
      };
    });

    presensiSnapshot.forEach((doc) => {
      const p = doc.data();
      if (rekapData[p.siswaId]) {
        const status = p.status ? p.status.toLowerCase() : "";
        if (rekapData[p.siswaId][status] !== undefined) {
          rekapData[p.siswaId][status]++;
        }
      }
    });

    tbody.innerHTML = "";
    let no = 1;

    for (let id in rekapData) {
      const r = rekapData[id];
      const totalHadir = r.hadir;

      tbody.innerHTML += `
        <tr class="bg-white border-b border-slate-50 hover:bg-slate-50 transition" data-id="${r.id}">
            <td class="px-6 py-4 text-center font-bold text-slate-400 w-16">${no++}</td>
            <td class="px-6 py-4 font-bold text-slate-800 uppercase text-xs">${escapeHtml(r.nama)}</td>
            <td class="px-6 py-4 text-center text-emerald-600 font-bold">${r.hadir}</td>
            <td class="px-6 py-4 text-center text-amber-600 font-bold">${r.izin}</td>
            <td class="px-6 py-4 text-center text-blue-600 font-bold">${r.sakit}</td>
            <td class="px-6 py-4 text-center text-red-600 font-bold">${r.alfa}</td>
            <td class="px-6 py-4 text-center bg-emerald-50/50 font-black text-emerald-700 border-l border-slate-100">${totalHadir}</td>
            <td class="px-6 py-4 text-center no-print">
              <div class="flex justify-center space-x-2">
                <button onclick="editData('${r.id}')" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-blue-100">
                  <i class="fas fa-pencil-alt text-[10px]"></i>
                </button>
                <button onclick="deleteData('${r.id}')" class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-rose-100">
                  <i class="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>
            </td>
         </tr>`;
    }
  } catch (error) {
    console.error("Gagal load rekap:", error);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-red-400">Gagal memuat data.</td></tr>`;
  }
};

// ==================== EDIT DATA ====================
window.editData = async function (id) {
  const siswa = allSiswa.find((s) => s.id === id);
  if (!siswa) return;

  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  const formatDate = (date) => date.toISOString().split("T")[0];

  const { value: result } = await Swal.fire({
    width: "400px",
    padding: "1.5rem",
    showConfirmButton: false,
    showCloseButton: true,
    html: `
      <div class="text-left">
        <div class="mb-4 border-b border-slate-100 pb-3">
          <h2 class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Edit Presensi</h2>
          <p class="text-lg font-black text-slate-800 tracking-tight leading-tight">${siswa.nama}</p>
        </div>

        <div class="mb-4">
          <label class="text-[9px] font-black text-slate-500 uppercase mb-1 block ml-1">Pilih Tanggal</label>
          <input type="date" id="edit-date-input" min="${formatDate(lastWeek)}" max="${formatDate(today)}" value="${selectedDate}" class="w-full p-2.5 rounded-xl border-2 border-slate-100 font-bold text-sm text-slate-700 outline-none focus:border-blue-400 transition-all">
        </div>

        <div class="grid grid-cols-1 gap-2 mb-6">
          <button type="button" data-val="hadir" class="opt-btn flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border-2 border-emerald-100 group">
            <span class="font-bold text-emerald-700 text-sm uppercase">Hadir</span>
            <i class="fas fa-check-circle text-emerald-500 text-lg"></i>
          </button>
          <button type="button" data-val="izin" class="opt-btn flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border-2 border-amber-100 group">
            <span class="font-bold text-amber-700 text-sm uppercase">Izin</span>
            <i class="fas fa-envelope text-amber-500 text-lg"></i>
          </button>
          <button type="button" data-val="sakit" class="opt-btn flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-100 group">
            <span class="font-bold text-blue-700 text-sm uppercase">Sakit</span>
            <i class="fas fa-medkit text-blue-500 text-lg"></i>
          </button>
          <button type="button" data-val="alfa" class="opt-btn flex items-center justify-between px-4 py-3 rounded-xl bg-rose-50 border-2 border-rose-100 group">
            <span class="font-bold text-rose-700 text-sm uppercase">Alfa</span>
            <i class="fas fa-times-circle text-rose-500 text-lg"></i>
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <button type="button" id="final-save-btn" class="w-full py-3.5 rounded-xl text-xs font-black text-white bg-slate-200 cursor-not-allowed transition-all uppercase tracking-widest" disabled>Simpan Perubahan</button>
          <button type="button" onclick="Swal.close()" class="w-full py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 uppercase tracking-widest">Batalkan</button>
        </div>
      </div>
      <style>
        .opt-btn.active[data-val="hadir"] { border-color: #10b981 !important; background: #d1fae5 !important; }
        .opt-btn.active[data-val="izin"] { border-color: #f59e0b !important; background: #fef3c7 !important; }
        .opt-btn.active[data-val="sakit"] { border-color: #3b82f6 !important; background: #dbeafe !important; }
        .opt-btn.active[data-val="alfa"] { border-color: #ef4444 !important; background: #fee2e2 !important; }
        .save-ready { background: #10b981 !important; cursor: pointer !important; }
      </style>
    `,
    didOpen: () => {
      const btns = document.querySelectorAll(".opt-btn");
      const saveBtn = document.getElementById("final-save-btn");
      let selectedVal = null;
      btns.forEach((btn) => {
        btn.addEventListener("click", () => {
          btns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          selectedVal = btn.getAttribute("data-val");
          saveBtn.disabled = false;
          saveBtn.classList.add("save-ready");
        });
      });
      saveBtn.onclick = () => {
        if (selectedVal) {
          Swal.getPopup().dataset.finalValue = JSON.stringify({
            status: selectedVal,
            tanggal: document.getElementById("edit-date-input").value,
          });
          Swal.clickConfirm();
        }
      };
    },
    preConfirm: () => JSON.parse(Swal.getPopup().dataset.finalValue),
  });

  if (result) {
    Swal.fire({
      title: "Memperbarui...",
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const snap = await db
        .collection("presensi")
        .where("siswaId", "==", id)
        .where("tanggal", "==", result.tanggal)
        .get();
      if (!snap.empty) {
        await snap.docs[0].ref.update({
          status: result.status,
          updatedAt: new Date(),
        });
      } else {
        await db.collection("presensi").add({
          siswaId: id,
          tanggal: result.tanggal,
          status: result.status,
          createdAt: new Date(),
        });
      }
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        timer: 1000,
        showConfirmButton: false,
      });
      loadRekapPresensi();
    } catch (err) {
      Swal.fire("Gagal", "Database error!", "error");
    }
  }
};

// ==================== DELETE DATA ====================
window.deleteData = function (id) {
  Swal.fire({
    title: "Hapus Riwayat?",
    text: "Semua riwayat kehadiran siswa ini akan dihapus!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const snap = await db
          .collection("presensi")
          .where("siswaId", "==", id)
          .get();
        const batch = db.batch();
        snap.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        Swal.fire({
          icon: "success",
          title: "Terhapus",
          timer: 1000,
          showConfirmButton: false,
        });
        loadRekapPresensi();
      } catch (e) {
        Swal.fire("Gagal", "Gagal menghapus data.", "error");
      }
    }
  });
};

// ==================== Pilih Semua Presensi ====================
window.setAllPresence = function(status) {
  const containers = document.querySelectorAll('.presence-container');
  if (containers.length === 0) return;
  containers.forEach(container => {
    const radio = container.querySelector(`input[value="${status}"]`);
    if (radio) {
      radio.checked = true;
    }
  });
  Swal.fire({
    icon: 'success',
    title: `Semua siswa diubah menjadi ${status.toUpperCase()}`,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500
  });
};

// ==================== RENDER DAFTAR SISWA ====================
function renderDaftarSiswa(keyword = "") {
  const tbody = document.querySelector("#siswa-table-body");
  if (!tbody) return;
  const lowKeyword = keyword.toLowerCase().trim();
  const filtered = allSiswa.filter(
    (s) =>
      s.nama.toLowerCase().includes(lowKeyword) ||
      (s.nisn && s.nisn.toString().includes(lowKeyword)),
  );

  tbody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="3" class="text-center py-10 text-slate-400 italic">Siswa tidak ditemukan...</td></tr>`
    : "";

  filtered.forEach((siswa, idx) => {
    tbody.innerHTML += `
    <tr class="bg-white border-b border-slate-50 hover:bg-slate-50 transition">
        <td class="px-6 py-4 text-center font-bold text-slate-400 w-16">${idx + 1}</td>
        <td class="px-6 py-4">
            <div class="font-bold text-slate-800 uppercase text-xs">${escapeHtml(siswa.nama)}</div>
            <div class="text-[9px] text-slate-400 font-medium">NISN: ${siswa.nisn || "-"}</div>
        </td>
        <td class="px-6 py-4"> 
            <div class="presence-container" data-siswa-id="${siswa.id}">
                <label class="cursor-pointer"><input type="radio" name="status-${siswa.id}" value="hadir" class="presence-input" checked><div class="presence-label lab-hadir">HADIR</div></label>
                <label class="cursor-pointer"><input type="radio" name="status-${siswa.id}" value="izin" class="presence-input"><div class="presence-label lab-izin">IZIN</div></label>
                <label class="cursor-pointer"><input type="radio" name="status-${siswa.id}" value="sakit" class="presence-input"><div class="presence-label lab-sakit">SAKIT</div></label>
                <label class="cursor-pointer"><input type="radio" name="status-${siswa.id}" value="alfa" class="presence-input"><div class="presence-label lab-alfa">ALFA</div></label>
            </div>
        </td>
    </tr>`;
  });
}

// ==================== SIMPAN PRESENSI ====================
window.handleSave = async function () {
  const containers = document.querySelectorAll(".presence-container");
  if (containers.length === 0) return;
  Swal.fire({
    title: "Menyimpan...",
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });
  try {
    const batch = db.batch();
    for (let container of containers) {
      const siswaId = container.getAttribute("data-siswa-id");
      const statusValue = container.querySelector(
        `input[name="status-${siswaId}"]:checked`,
      ).value;
      const existing = await db
        .collection("presensi")
        .where("siswaId", "==", siswaId)
        .where("tanggal", "==", selectedDate)
        .get();
      if (!existing.empty) {
        batch.update(existing.docs[0].ref, {
          status: statusValue,
          updatedAt: new Date(),
        });
      } else {
        batch.set(db.collection("presensi").doc(), {
          siswaId,
          tanggal: selectedDate,
          status: statusValue,
          createdAt: new Date(),
        });
      }
    }
    await batch.commit();
    Swal.fire({
      icon: "success",
      title: "Berhasil disimpan",
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (e) {
    Swal.fire("Gagal!", "Terjadi kesalahan.", "error");
  }
};

// ==================== EXPORT EXCEL ====================
window.exportExcel = function () {
  const table = document.getElementById("rekap-table");
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: "Rekap" });
  XLSX.writeFile(wb, `Rekap_Presensi_${selectedDate}.xlsx`);
};

// ==================== EVENT LISTENERS & INIT ====================
if (searchInput) {
  searchInput.addEventListener("input", (e) => renderDaftarSiswa(e.target.value));
}

if (filterKelasSelect) {
  filterKelasSelect.addEventListener("change", () => {
    if (!(guruwaliKelas && guruwaliKelas !== "null")) {
      loadSiswaForPresensi();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (dateInput) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
    selectedDate = today;
    dateInput.addEventListener("change", (e) => {
      selectedDate = e.target.value;
      renderDaftarSiswa(searchInput ? searchInput.value : "");
      console.log("Tanggal diganti ke: " + selectedDate + ". Tabel di-refresh.");
    });
  }
  
  // Set dropdown awal (khusus mapel) atau disable (khusus walas)
  if (guruwaliKelas && guruwaliKelas !== "null" && filterKelasSelect) {
    filterKelasSelect.disabled = true;
    filterKelasSelect.value = guruwaliKelas;
  } else if (filterKelasSelect) {
    filterKelasSelect.disabled = false;
    filterKelasSelect.value = "all";
  }
  
  loadSiswaForPresensi();
});