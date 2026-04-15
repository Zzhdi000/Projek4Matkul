// ==================== GURU PRESENSI - VERSI FORMAL & OPTIMIZED ====================
const userName = localStorage.getItem("userName");
const guruwaliKelas = localStorage.getItem("waliKelas");

// Elemen DOM
const searchInput = document.getElementById("search-input");
const dateInput = document.querySelector('input[type="date"]');

// State
let allSiswa = [];
let currentKelasFilter = guruwaliKelas ? guruwaliKelas : "all";
let selectedDate = new Date().toISOString().slice(0, 10);

// ==================== HELPER ====================
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m],
  );
}

// ==================== LOAD DATA SISWA (TAB DAFTAR) ====================
async function loadSiswaForPresensi() {
  try {
    let query = db.collection("students").orderBy("nama", "asc");
    if (guruwaliKelas && guruwaliKelas !== "null") {
      query = query.where("kelas", "==", guruwaliKelas);
    } else if (currentKelasFilter !== "all") {
      query = query.where("kelas", "==", currentKelasFilter);
    }

    const snapshot = await query.get();
    allSiswa = [];
    snapshot.forEach((doc) => allSiswa.push({ id: doc.id, ...doc.data() }));
    renderDaftarSiswa("");
  } catch (error) {
    console.error("Gagal ambil data:", error);
  }
}

// ==================== LOAD REKAP ====================
window.loadRekapPresensi = async function () {
  const tbody = document.querySelector("#rekap-table-body");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-400 font-medium italic"><i class="fas fa-spinner fa-spin mr-2"></i> Menghitung akumulasi kehadiran...</td></tr>`;

  try {
    const presensiSnapshot = await db.collection("presensi").get();
    const rekapData = {};

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
      tbody.innerHTML += `
            <tr class="bg-white border-b border-slate-50 hover:bg-slate-50 transition" data-id="${r.id}">
                <td class="px-6 py-4 text-center font-bold text-slate-400 w-16">${no++}</td>
                <td class="px-6 py-4 font-bold text-slate-800 uppercase">${escapeHtml(r.nama)}</td>
                <td class="px-6 py-4 text-center text-emerald-600 font-bold val-hadir">${r.hadir}</td>
                <td class="px-6 py-4 text-center text-amber-600 font-bold val-izin">${r.izin}</td>
                <td class="px-6 py-4 text-center text-blue-600 font-bold val-sakit">${r.sakit}</td>
                <td class="px-6 py-4 text-center text-red-600 font-bold val-alfa">${r.alfa}</td>
                <td class="px-6 py-4 text-center bg-blue-50/30 font-black text-blue-700 border-l border-slate-100 val-total">${r.hadir}</td>
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
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-red-400">Gagal memuat data rekap.</td></tr>`;
  }
};

// ==================== FUNGSI EDIT FULL COLOR & ICONIC (MANUAL SAVE) ====================
window.editData = async function (id) {
  const siswa = allSiswa.find((s) => s.id === id);
  if (!siswa) return;

  const { value: newStatus } = await Swal.fire({
    padding: "2rem",
    background: "#ffffff",
    showConfirmButton: false,
    html: `
      <div class="text-left" id="edit-modal-container">
        <div class="mb-6 border-b border-slate-100 pb-4">
          <h2 class="text-xl font-black text-slate-800 tracking-tight">${siswa.nama}</h2>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ubah Status Presensi</p>
          <div class="inline-block px-2 py-1 bg-blue-50 rounded mt-2">
             <p class="text-[10px] text-blue-600 font-bold italic">📅 Tanggal: ${selectedDate}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 mb-8" id="status-options">
          <button type="button" data-val="hadir" class="opt-btn flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-100 transition-all group">
            <span class="font-bold text-emerald-700 uppercase">Hadir</span>
            <i class="fas fa-check-circle text-emerald-500 text-xl group-hover:scale-110 transition"></i>
          </button>
          
          <button type="button" data-val="izin" class="opt-btn flex items-center justify-between p-4 rounded-2xl bg-amber-50 border-2 border-amber-100 transition-all group">
            <span class="font-bold text-amber-700 uppercase">Izin</span>
            <i class="fas fa-envelope text-amber-500 text-xl group-hover:scale-110 transition"></i>
          </button>

          <button type="button" data-val="sakit" class="opt-btn flex items-center justify-between p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 transition-all group">
            <span class="font-bold text-blue-700 uppercase">Sakit</span>
            <i class="fas fa-medkit text-blue-500 text-xl group-hover:scale-110 transition"></i>
          </button>

          <button type="button" data-val="alfa" class="opt-btn flex items-center justify-between p-4 rounded-2xl bg-rose-50 border-2 border-rose-100 transition-all group">
            <span class="font-bold text-rose-700 uppercase">Alfa</span>
            <i class="fas fa-times-circle text-rose-500 text-xl group-hover:scale-110 transition"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-2">
          <button type="button" id="final-save-btn" class="w-full py-4 rounded-2xl text-xs font-bold text-white bg-slate-300 cursor-not-allowed transition-all uppercase tracking-widest disabled:opacity-50" disabled>Simpan Perubahan</button>
          <button type="button" onclick="Swal.close()" class="w-full py-3 rounded-2xl text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest">Batalkan</button>
        </div>
      </div>

      <style>
        /* Highlight saat dipilih agar makin kontras */
        .opt-btn.active { 
          transform: scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .opt-btn.active[data-val="hadir"] { border-color: #10b981 !important; background: #d1fae5 !important; }
        .opt-btn.active[data-val="izin"] { border-color: #f59e0b !important; background: #fef3c7 !important; }
        .opt-btn.active[data-val="sakit"] { border-color: #3b82f6 !important; background: #dbeafe !important; }
        .opt-btn.active[data-val="alfa"] { border-color: #ef4444 !important; background: #fee2e2 !important; }
        
        .save-ready { 
          background: #0f172a !important; 
          cursor: pointer !important; 
          box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.3); 
        }
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
          Swal.getPopup().dataset.finalValue = selectedVal;
          Swal.clickConfirm();
        }
      };
    },
    preConfirm: () => {
      return Swal.getPopup().dataset.finalValue;
    },
  });

  if (newStatus) {
    Swal.fire({
      title: "Memperbarui...",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const snapshot = await db
        .collection("presensi")
        .where("siswaId", "==", id)
        .where("tanggal", "==", selectedDate)
        .get();
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          status: newStatus,
          updatedAt: new Date(),
        });
      } else {
        await db
          .collection("presensi")
          .add({
            siswaId: id,
            tanggal: selectedDate,
            status: newStatus,
            createdAt: new Date(),
          });
      }
      Swal.fire({
        icon: "success",
        title: "Berhasil Diubah",
        timer: 1000,
        showConfirmButton: false,
      });
      loadRekapPresensi();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Database error!", "error");
    }
  }
};
// ==================== FUNGSI HAPUS ====================
window.deleteData = function (id) {
  Swal.fire({
    title: "Hapus Riwayat?",
    text: "Semua riwayat kehadiran siswa ini akan dihapus dari awal!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const snapshot = await db
          .collection("presensi")
          .where("siswaId", "==", id)
          .get();
        const batch = db.batch();
        snapshot.forEach((doc) => batch.delete(doc.ref));
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

// ==================== RENDER DAFTAR (INPUT HARIAN) ====================
function renderDaftarSiswa(keyword = "") {
  const tbody = document.querySelector("#siswa-table-body");
  if (!tbody) return;

  const lowKeyword = keyword.toLowerCase().trim();
  const filtered = allSiswa.filter((s) => {
    const namaSiswa = s.nama.toLowerCase();
    const nisnSiswa = s.nisn ? s.nisn.toString().toLowerCase() : "";
    return namaSiswa.includes(lowKeyword) || nisnSiswa.includes(lowKeyword);
  });

  tbody.innerHTML = "";
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-400 font-medium">Siswa tidak ditemukan...</td></tr>`;
    return;
  }

  filtered.forEach((siswa, idx) => {
    tbody.innerHTML += `
    <tr class="bg-white border-b border-slate-50 hover:bg-slate-50 transition">
        <td class="px-6 py-4 text-center font-bold text-slate-400 w-16">${idx + 1}</td>
        <td class="px-6 py-4">
            <div class="font-bold text-slate-800 uppercase tracking-tight">${escapeHtml(siswa.nama)}</div>
            <div class="text-[10px] text-slate-400 font-medium">NISN: ${siswa.nisn || "-"}</div>
        </td>
        <td class="px-6 py-4" style="width: 350px;"> 
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

// ==================== EVENT SEARCH ====================
if (searchInput) {
  searchInput.addEventListener("input", (e) =>
    renderDaftarSiswa(e.target.value),
  );
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", () => {
  if (dateInput) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
    selectedDate = today;
    dateInput.addEventListener("change", (e) => {
      selectedDate = e.target.value;
    });
  }
  loadSiswaForPresensi();
  if (userName) {
    const namaElem = document.querySelector(
      ".text-xs.font-bold.text-slate-800",
    );
    if (namaElem) namaElem.innerText = userName;
  }
});

// ==================== SIMPAN DATA HARIAN ====================
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
      const selectedRadio = container.querySelector(
        `input[name="status-${siswaId}"]:checked`,
      );
      const statusValue = selectedRadio ? selectedRadio.value : "hadir";

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
        const newRef = db.collection("presensi").doc();
        batch.set(newRef, {
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
      title: "Tersimpan",
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (e) {
    Swal.fire("Gagal!", "Terjadi kesalahan.", "error");
  }
};

// ==================== EXCEL & PDF ====================
window.exportExcel = function () {
  const table = document.getElementById("rekap-table");
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: "Rekap" });
  XLSX.writeFile(wb, `Rekap_Presensi_${selectedDate}.xlsx`);
};

window.printPDF = function () {
  window.print();
};
