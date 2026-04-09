const guruwaliKelas = localStorage.getItem("guruwaliKelas");

if (!guruwaliKelas) {
    console.warn("Guru ini bukan wali kelas. Akses ke semua siswa? (perlu penanganan khusus)");
}

// 1. FUNGSI UNTUK MENAMPILKAN DATA SECARA REAL-TIME (Sesuai Filter)
function loadStudents() {
    const bodyDaftar = document.getElementById("body-daftar");
    const bodyDataDiri = document.getElementById("body-data-diri");

    let query = db.collection("students").orderBy("nama", "asc");

    // Terapkan filter jika bukan "all"
     if (guruKelasWali) {
        query = query.where("kelas", "==", guruKelasWali);
    } else {
        // Jika bukan wali kelas, gunakan filter dari dropdown
        if (filterKelas !== "all") {
            query = query.where("kelas", "==", filterKelas);
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

            // Baris untuk Tab Daftar
            const rowD = `
                <tr class="hover:bg-slate-50/80 transition animate-fadeIn border-b border-slate-100">
                    <td class="px-6 py-5 font-bold text-slate-700 uppercase tracking-tight">${v.nama}</td>
                    <td class="px-6 py-5 font-mono text-slate-400">${v.nisn}</td>
                    <td class="px-6 py-5">
                        <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">${v.status || 'Aktif'}</span>
                    </td>
                    <td class="px-6 py-5 text-center">
                        <button onclick="editSiswa('${id}')" class="text-blue-500 mx-2 hover:scale-110 transition"><i class="fas fa-edit"></i></button>
                        <button onclick="hapusSiswa('${id}')" class="text-red-500 mx-2 hover:scale-110 transition"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;

            // Baris untuk Tab Data Diri
            const rowDD = `
                <tr class="bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-all animate-fadeIn">
                    <td class="px-6 py-5 font-mono text-slate-400 rounded-l-2xl">${v.nisn}</td>
                    <td class="px-6 py-5 font-bold text-slate-700 uppercase tracking-tight">${v.nama}</td>
                    <td class="px-6 py-5 text-slate-600 font-medium">${v.nama_wali || v.wali || '-'}</td>
                    <td class="px-6 py-5 font-mono text-slate-500">${v.no_wali || v.kontak || '-'}</td>
                    <td class="px-6 py-5 text-slate-400 italic text-sm">${v.alamat || '-'}</td>
                    <td class="px-6 py-5 text-center rounded-r-2xl">
                        <button onclick="editSiswa('${id}')" class="text-blue-500 mx-2"><i class="fas fa-edit"></i></button>
                        <button onclick="hapusSiswa('${id}')" class="text-red-500 mx-2"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;

            bodyDaftar.insertAdjacentHTML("beforeend", rowD);
            bodyDataDiri.insertAdjacentHTML("beforeend", rowDD);
        });
    });
}

// 2. FUNGSI TAMBAH SISWA KE FIRESTORE
async function tambahSiswa() {
    // Mengambil nilai filter kelas yang sedang aktif saat ini
    const currentKelas = document.getElementById('filter-kelas-global').value;
    // Jika filter di set "Semua Kelas", defaultkan ke "1-A" agar data tidak error
    const kelasDefault = guruwaliKelas ? guruwaliKelas : (document.getElementById('filter-kelas-global').value !== 'all' ? document.getElementById('filter-kelas-global').value : '1-A');
    const { value: v } = await Swal.fire({
        title: "Tambah Siswa Baru",
        html: `
        <div class="text-left px-1 pb-4">
            <div class="mb-4">
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Nama Lengkap</label>
                <input id="n" class="swal2-input !m-0 w-full !text-sm !h-11 border-slate-200 focus:border-emerald-500" placeholder="Masukkan nama lengkap siswa">
            </div>
            <div class="mb-4">
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">NISN</label>
                <input id="ni" class="swal2-input !m-0 w-full !text-sm !h-11 border-slate-200" placeholder="Masukkan 10 digit NISN">
            </div>
            <div class="flex gap-4 mb-4">
                <div class="flex-1">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Nama Wali</label>
                    <input id="w" class="swal2-input !m-0 w-full !text-sm !h-11 border-slate-200" placeholder="Nama ayah/ibu">
                </div>
                <div class="flex-1">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">No. Wali</label>
                    <input id="t" class="swal2-input !m-0 w-full !text-sm !h-11 border-slate-200" placeholder="08xxxxxx">
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Alamat</label>
                <textarea id="a" class="swal2-textarea !m-0 w-full !text-sm border-slate-200" placeholder="Alamat lengkap rumah..."></textarea>
            </div>
            <div class="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p class="text-[10px] text-blue-600 font-bold uppercase">Otomatis Terdaftar di:</p>
                <p class="text-sm font-bold text-blue-800">Kelas ${kelasDefault}</p>
            </div>
        </div>`,
        showCancelButton: true,
        confirmButtonText: "Tambahkan Siswa",
        confirmButtonColor: "#059669",
        cancelButtonText: "Batal",
        customClass: {
            popup: "rounded-[2rem]",
            confirmButton: "rounded-xl px-6 py-2 font-bold",
            cancelButton: "rounded-xl px-6 py-2",
        },
        preConfirm: () => {
            const nama = document.getElementById("n").value;
            const nisn = document.getElementById("ni").value;
            if (!nama || !nisn) {
                Swal.showValidationMessage("Nama dan NISN wajib diisi!");
                return false;
            }
            return {
                nama,
                nisn,
                wali: document.getElementById("w").value || "-",
                telp: document.getElementById("t").value || "-",
                alamat: document.getElementById("a").value || "-",
            };
        },
    });

    if (v) {
        try {
            await db.collection("students").add({
                nama: v.nama.toUpperCase(),
                nisn: v.nisn,
                nama_wali: v.wali.toUpperCase(),
                no_wali: v.telp,
                alamat: v.alamat,
                status: "Aktif",
                kelas: kelasDefault // Menggunakan kelas yang didapat dari filter
            });
            
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: `Siswa baru telah terdaftar di Kelas ${kelasDefault}.`,
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: "rounded-[2rem]" }
            });
        } catch (error) {
            Swal.fire("Error", "Gagal menyimpan ke database: " + error.message, "error");
        }
    }
}


async function hapusSiswa(id) {
    const result = await Swal.fire({
        title: "Hapus Data?",
        text: "Data akan dihapus permanen dari database!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-[2rem]" }
    });

    if (result.isConfirmed) {
        try {
            // Proses hapus di Firestore
            await db.collection("students").doc(id).delete();
            
            Swal.fire({
                title: "Terhapus!",
                icon: "success",
                timer: 1000,
                showConfirmButton: false,
                customClass: { popup: "rounded-[2rem]" }
            });
        } catch (error) {
            console.error("Gagal menghapus:", error);
            Swal.fire("Error", "Gagal menghapus data dari server.", "error");
        }
    }
}

async function editSiswa(id) {
    try {
        // 1. Ambil data terbaru dari DB untuk mengisi form
        const doc = await db.collection("students").doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();

        // 2. Tampilkan SweetAlert dengan data awal
        const { value: formValues } = await Swal.fire({
            title: "Edit Data Siswa",
            html: `
            <div class="text-left space-y-3 px-1">
                <div class="flex flex-col items-start">
                    <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Lengkap</label>
                    <input id="swal-nama" class="swal2-input !m-0 w-full" value="${data.nama}">
                </div>
                <div class="flex flex-col items-start">
                    <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Wali</label>
                    <input id="swal-wali" class="swal2-input !m-0 w-full" value="${data.nama_wali}">
                </div>
                <div class="flex flex-col items-start">
                    <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">No. Wali</label>
                    <input id="swal-telp" class="swal2-input !m-0 w-full" value="${data.no_wali}">
                </div>
                <div class="flex flex-col items-start">
                    <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Alamat</label>
                    <textarea id="swal-alamat" class="swal2-textarea !m-0 w-full">${data.alamat}</textarea>
                </div>
            </div>`,
            showCancelButton: true,
            confirmButtonText: "Simpan Perubahan",
            confirmButtonColor: "#2563eb",
            cancelButtonText: "Batal",
            customClass: { popup: "rounded-[2rem]" },
            preConfirm: () => ({
                nama: document.getElementById("swal-nama").value.toUpperCase(),
                nama_wali: document.getElementById("swal-wali").value.toUpperCase(),
                no_wali: document.getElementById("swal-telp").value,
                alamat: document.getElementById("swal-alamat").value,
            }),
        });

        // 3. Jika user klik Simpan, update ke Firestore
        if (formValues) {
            await db.collection("students").doc(id).update(formValues);
            
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Data siswa telah diperbarui.",
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: "rounded-[2rem]" }
            });
        }
    } catch (error) {
        console.error("Gagal update:", error);
        Swal.fire("Error", "Gagal memperbarui data.", "error");
    }
}

function switchTab(tab) {
    const dTab = document.getElementById("tab-daftar");
    const ddTab = document.getElementById("tab-data-diri");
    const dCont = document.getElementById("content-daftar");
    const ddCont = document.getElementById("content-data-diri");

    const active = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white transition-all";
    const inactive = "px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all";

    if (tab === "daftar") {
        dTab.className = active;
        ddTab.className = inactive;
        dCont.classList.remove("hidden");
        ddCont.classList.add("hidden");
    } else {
        ddTab.className = active;
        dTab.className = inactive;
        ddCont.classList.remove("hidden");
        dCont.classList.add("hidden");
    }
}

// 3. FUNGSI SEARCH (Diperbaiki agar mencari di semua kolom)
function setupSearch(inputId, tableBodyId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener("input", function () {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll(`#${tableBodyId} tr`);
        
        rows.forEach((row) => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(filter) ? "" : "none";
        });
    });
}

// 1. Fungsi Import Excel
function handleImportExcel(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Upload ke Firebase
        jsonData.forEach(siswa => {
            db.collection("students").add({
                nisn: siswa.NISN,
                nama: siswa.Nama,
                kelas: siswa.Kelas,
                wali: siswa.Wali,
                kontak: siswa.Kontak,
                alamat: siswa.Alamat,
                status: "Aktif"
            });
        });
        Swal.fire("Berhasil!", "Data siswa telah diimpor.", "success");
        loadDataSiswa(); // Refresh tabel
    };
    reader.readAsArrayBuffer(file);
}

// 2. Fungsi Load Data Berdasarkan Filter
function loadDataSiswa() {
    let query = db.collection("students");

     if (guruwaliKelas) {
        query = query.where("kelas", "==", guruwaliKelas);
    }

    query.onSnapshot((snapshot) => {
        // Logika untuk merender baris <tr> ke #body-daftar dan #body-data-diri
    });
}

// INISIALISASI SAAT HALAMAN DIBUKA
window.onload = () => {
    loadStudents();
    setupSearch("search-daftar", "body-daftar");
    setupSearch("search-data-diri", "body-data-diri");

    // Tambahkan event listener untuk filter kelas
    document.getElementById('filter-kelas-global').addEventListener('change', loadStudents);
};