// ==================== GURU PRESENSI - FINAL OPTIMIZED ====================
const userName = localStorage.getItem("userName");
const guruwaliKelas = localStorage.getItem("waliKelas");

const searchInput = document.getElementById("search-input");
const dateInput = document.querySelector('input[type="date"]');

let allSiswa = [];
let currentKelasFilter = guruwaliKelas ? guruwaliKelas : "all";
let selectedDate = new Date().toISOString().slice(0, 10);

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m],
  );
}

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

// ==================== LOAD REKAP (TOTAL = HADIR SAJA) ====================
window.loadRekapPresensi = async function () {
  const tbody = document.querySelector("#rekap-table-body");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-400 font-medium italic"><i class="fas fa-spinner fa-spin mr-2"></i> Menghitung kehadiran...</td></tr>`;

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

// ==================== EDIT DATA (HEADER DIBALIK & TOMBOL WARNA) ====================
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

window.printPDF = function () {
  // 1. Ambil semua elemen h2 dan p yang ada di halaman
  const elements = document.querySelectorAll("h2, p");

  // 2. Cari yang teksnya mengandung "Laporan Kehadiran Siswa" atau "Total akumulasi"
  const targets = Array.from(elements).filter(
    (el) =>
      el.innerText.includes("Laporan Kehadiran Siswa") ||
      el.innerText.includes("Total akumulasi kehadiran"),
  );

  // 3. Sembunyikan semua yang ditemukan
  targets.forEach((el) => el.style.setProperty("display", "none", "important"));

  // 4. Jalankan perintah print
  window.print();

  // 5. Kembalikan lagi tampilannya di layar setelah dialog print tutup
  setTimeout(() => {
    targets.forEach((el) => (el.style.display = ""));
  }, 1000);
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

// ==================== SEARCH & RENDER ====================
function renderDaftarSiswa(keyword = "") {
  const tbody = document.querySelector("#siswa-table-body");
  if (!tbody) return;
  const lowKeyword = keyword.toLowerCase().trim();
  const filtered = allSiswa.filter(
    (s) =>
      s.nama.toLowerCase().includes(lowKeyword) ||
      (s.nisn && s.nisn.toString().includes(lowKeyword)),
  );

  tbody.innerHTML =
    filtered.length === 0
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

if (searchInput) {
  searchInput.addEventListener("input", (e) =>
    renderDaftarSiswa(e.target.value),
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (dateInput) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
    selectedDate = today;
    dateInput.addEventListener("change", (e) => {
      selectedDate = e.target.value;
      // Tambahkan baris di bawah ini agar tabel langsung refresh/kosong lagi
      renderDaftarSiswa(searchInput ? searchInput.value : "");

      console.log(
        "Tanggal diganti ke: " + selectedDate + ". Tabel di-refresh.",
      );
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

window.exportExcel = function () {
  const table = document.getElementById("rekap-table");
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: "Rekap" });
  XLSX.writeFile(wb, `Rekap_Presensi_${selectedDate}.xlsx`);
};
