// Ambil referensi ke kedua table body
const tableBody = document.querySelector("#content-daftar tbody");
const rekapBody = document.querySelector("#content-rekap tbody");

// 1. Fungsi Load Data Siswa untuk Presensi & Rekap
function loadStudentsForAttendance() {
    db.collection("students").onSnapshot((snapshot) => {
        tableBody.innerHTML = ""; 
        rekapBody.innerHTML = ""; 
        let no = 1;

        snapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // 1. Render Tab Daftar (Tetap sama)
            renderRowDaftar(id, data, no);

            // 2. Render Tab Rekap (Dengan ID unik untuk angka)
            renderRowRekap(id, data, no);

            // 3. HITUNG DATA DARI KOLEKSI ATTENDANCE
            updateRecapCounts(id);

            no++;
        });
    });
}

// Fungsi untuk menghitung total presensi tiap siswa
function updateRecapCounts(studentId) {
    db.collection("attendance").where("studentId", "==", studentId)
    .onSnapshot((querySnapshot) => {
        let hadir = 0, izin = 0, sakit = 0, alfa = 0;

        querySnapshot.forEach((doc) => {
            const status = doc.data().status;
            if (status === "HADIR") hadir++;
            else if (status === "IZIN") izin++;
            else if (status === "SAKIT") sakit++;
            else if (status === "ALFA") alfa++;
        });

        // Update angka di DOM berdasarkan ID
        document.getElementById(`count-hadir-${studentId}`).innerText = hadir;
        document.getElementById(`count-izin-${studentId}`).innerText = izin;
        document.getElementById(`count-sakit-${studentId}`).innerText = sakit;
        document.getElementById(`count-alfa-${studentId}`).innerText = alfa;
        document.getElementById(`count-total-${studentId}`).innerText = `${hadir + izin + sakit + alfa} Hari`;
    });
}

// Helper untuk Render Row Rekap (Tambahkan ID pada bagian angka)
function renderRowRekap(id, data, no) {
    const rowRekap = `
    <tr class="bg-white border border-slate-100 hover:shadow-md transition-all group">
        <td class="px-6 py-4 font-mono text-slate-400">${String(no).padStart(3, '0')}</td>
        <td class="px-6 py-4 font-bold text-slate-700 group-hover:text-blue-600 transition-colors">${data.nama}</td>

        <td id="count-hadir-${id}" class="px-4 py-4 text-center font-bold text-emerald-600">0</td>
        <td id="count-izin-${id}" class="px-4 py-4 text-center font-bold text-amber-600">0</td>
        <td id="count-sakit-${id}" class="px-4 py-4 text-center font-bold text-blue-600">0</td>
        <td id="count-alfa-${id}" class="px-4 py-4 text-center font-bold text-red-600">0</td>
        <td id="count-total-${id}" class="px-6 py-4 text-center font-bold text-slate-500 bg-slate-50">0 Hari</td>

        <td class="px-6 py-4 text-center bg-slate-50 rounded-r-xl">
            <div class="flex justify-center space-x-2">
                <button 
                    onclick="editRekap('${id}', '${data.nama}')" 
                    class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                    title="Koreksi Kehadiran Siswa">
                    <i class="fas fa-edit text-xs"></i>
                </button>
            </div>
        </td>
    </tr>`;
    rekapBody.insertAdjacentHTML("beforeend", rowRekap);
}

// Helper untuk Render Row Daftar (Agar kode rapi)
function renderRowDaftar(id, data, no) {
    const rowDaftar = `
    <tr class="bg-white border border-slate-100 shadow-sm rounded-xl">
        <td class="px-6 py-4 text-center font-mono text-slate-400 rounded-l-xl">${no}</td>
        <td class="px-6 py-4">
            <div class="font-bold text-slate-700">${data.nama}</div>
            <div class="text-[10px] text-slate-400">NISN: ${data.nisn}</div>
        </td>
        <td class="px-6 py-4 rounded-r-xl">
            <div class="flex justify-end space-x-2 pr-4 attendance-options" data-id="${id}" data-nama="${data.nama}">
                ${createRadio(id, 'HADIR', 'emerald', 'checked')}
                ${createRadio(id, 'IZIN', 'amber')}
                ${createRadio(id, 'SAKIT', 'blue')}
                ${createRadio(id, 'ALFA', 'red')}
            </div>
        </td>
    </tr>`;
    tableBody.insertAdjacentHTML("beforeend", rowDaftar);
}

// Fungsi helper untuk membuat tombol radio agar rapi
function createRadio(id, status, color, checked = '') {
    return `
    <label class="group cursor-pointer">
        <input type="radio" name="abs-${id}" value="${status}" class="peer hidden" ${checked}>
        <div class="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold 
             peer-checked:bg-${color}-500 peer-checked:text-white transition-all hover:bg-slate-200 uppercase">
            ${status}
        </div>
    </label>`;
}

// 2. Fungsi Simpan Presensi
async function handleSave() {
    const attendanceData = [];
    const dateInput = document.querySelector('input[type="date"]');
    const today = dateInput.value;

    document.querySelectorAll('.attendance-options').forEach(el => {
        const studentId = el.getAttribute('data-id');
        const studentName = el.getAttribute('data-nama');
        const status = el.querySelector('input:checked').value;
        attendanceData.push({ studentId, studentName, status, date: today });
    });

    try {
        const batch = db.batch();
        attendanceData.forEach(data => {
            const ref = db.collection("attendance").doc();
            batch.set(ref, data);
        });
        
        await batch.commit();

        // --- TAMBAHKAN BARIS INI ---
        // Ini perintah agar tombol langsung berubah jadi abu-abu
        await checkTodayAttendance(); 
        // ---------------------------

        Swal.fire({
            title: "Berhasil!",
            text: `Presensi tanggal ${today} telah disimpan.`,
            icon: "success",
            confirmButtonColor: "#2563eb",
            customClass: { popup: "rounded-3xl" }
        });
    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Gagal menyimpan presensi", "error");
    }
}

// 3. Fungsi Navigasi Tab
function switchTab(tab) {
    const btnDaftar = document.getElementById("tab-daftar");
    const btnRekap = document.getElementById("tab-rekap");
    const contentDaftar = document.getElementById("content-daftar");
    const contentRekap = document.getElementById("content-rekap");

    if (tab === "daftar") {
        btnDaftar.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white transition-all";
        btnRekap.className = "px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all";
        contentDaftar.classList.remove("hidden");
        contentRekap.classList.add("hidden");
    } else {
        btnRekap.className = "px-8 py-4 text-sm font-bold border-b-2 border-blue-600 text-blue-600 bg-white transition-all";
        btnDaftar.className = "px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all";
        contentRekap.classList.remove("hidden");
        contentDaftar.classList.add("hidden");
    }
}

// Jalankan load data saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
    loadStudentsForAttendance();
    
    document.getElementById("search-input").addEventListener("input", function(e) {
        const term = e.target.value.toLowerCase();
        // Mencari di kedua tabel
        document.querySelectorAll("tbody tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
        });
    });
});

async function checkTodayAttendance() {
    // Ambil tanggal dari input HTML (biar sinkron dengan yang mau diinput guru)
    const dateInput = document.querySelector('input[type="date"]');
    const selectedDate = dateInput.value;

    const snapshot = await db.collection("attendance")
        .where("date", "==", selectedDate)
        .limit(1)
        .get();

    const btnSave = document.querySelector("button[onclick='handleSave()']");
    
    if (!snapshot.empty) {
        // Jika sudah ada data di tanggal tersebut
        btnSave.disabled = true;
        btnSave.classList.replace('bg-[#2563eb]', 'bg-slate-400');
        btnSave.classList.remove('hover:bg-blue-700'); // Hapus hover agar tidak membingungkan
        btnSave.innerHTML = `<i class="fas fa-check-circle mr-2"></i> PRESENSI SELESAI`;
    } else {
        // Jika belum ada data (tombol aktif kembali)
        btnSave.disabled = false;
        btnSave.classList.replace('bg-slate-400', 'bg-[#2563eb]');
        btnSave.classList.add('hover:bg-blue-700');
        btnSave.innerHTML = `<i class="fas fa-save mr-2"></i> SIMPAN PRESENSI`;
    }
}

// TAMBAHKAN INI: Agar saat guru ganti tanggal di input, tombol otomatis ngecek lagi
document.querySelector('input[type="date"]').addEventListener('change', checkTodayAttendance);

// Jalankan load data saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
    loadStudentsForAttendance();
    
    // TAMBAHKAN INI: Jalankan pengecekan saat halaman dimuat
    checkTodayAttendance(); 
    
    document.getElementById("search-input").addEventListener("input", function(e) {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll("tbody tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
        });
    });
});

async function editRekap(studentId, studentName) {
    const todayDate = new Date().toISOString().split('T')[0];
    
    // 1. CEK KUOTA EDIT HARIAN (Max 3 kali)
    let editCount = localStorage.getItem(`edit_count_${todayDate}`) || 0;
    if (parseInt(editCount) >= 3) {
        Swal.fire("Kuota Habis", "Anda sudah mencapai batas maksimal (3x) edit hari ini.", "warning");
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: `Koreksi: ${studentName}`,
        html:
            `<label class="text-xs text-slate-400">Pilih Tanggal yang Akan Diperbaiki:</label>` +
            `<input id="swal-date" type="date" class="swal2-input" value="${todayDate}">` +
            `<select id="swal-status" class="swal2-input">
                <option value="HADIR">HADIR</option>
                <option value="IZIN">IZIN</option>
                <option value="SAKIT">SAKIT</option>
                <option value="ALFA">ALFA</option>
            </select>`,
        showCancelButton: true,
        confirmButtonText: 'Update Data',
        preConfirm: () => {
            const selectedDate = document.getElementById('swal-date').value;
            
            // 2. CEK BATAS MINGGUAN (Hanya boleh edit data 7 hari terakhir)
            const diffTime = Math.abs(new Date(todayDate) - new Date(selectedDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 7) {
                Swal.showValidationMessage("Hanya bisa mengedit data maksimal 7 hari yang lalu!");
                return false;
            }
            
            return [selectedDate, document.getElementById('swal-status').value];
        }
    });

    if (formValues) {
        const [date, newStatus] = formValues;
        
        try {
            const query = await db.collection("attendance")
                .where("studentId", "==", studentId)
                .where("date", "==", date)
                .get();

            if (!query.empty) {
                const docId = query.docs[0].id;
                await db.collection("attendance").doc(docId).update({ status: newStatus });
                
                // 3. TAMBAH HITUNGAN EDIT JIKA BERHASIL
                editCount++;
                localStorage.setItem(`edit_count_${todayDate}`, editCount);

                Swal.fire("Berhasil", `Data diperbarui. Sisa kuota edit hari ini: ${3 - editCount}`, "success");
            } else {
                Swal.fire("Data Tidak Ditemukan", "Tidak ada data absen di tanggal tersebut.", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Gagal update data", "error");
        }
    }
}