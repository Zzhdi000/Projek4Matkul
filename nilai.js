// 1. Inisialisasi Referensi DOM
const nilaiBody = document.getElementById("table-body-nilai");
const selectKelas = document.getElementById("filter-kelas");
const selectSemester = document.getElementById("filter-semester");
const selectMapel = document.getElementById("filter-mapel");
const btnSimpan = document.getElementById("btn-simpan-nilai");
const searchInput = document.getElementById("search-siswa");
const btnExport = document.querySelector("button.bg-slate-800");

// 2. Fungsi Load Data Siswa & Nilai
async function loadDataNilai() {
    const kelasTerpilih = selectKelas.value;
    const mapelTerpilih = selectMapel.value;
    const semesterTerpilih = selectSemester.value;

    nilaiBody.innerHTML = '<tr><td colspan="8" class="text-center py-10 text-slate-400">Memuat data...</td></tr>';

    let query = db.collection("students");
    
    if (kelasTerpilih !== "Pilih Kelas" && kelasTerpilih !== "all" && kelasTerpilih !== "") {
        query = query.where("kelas", "==", kelasTerpilih);
    }
    
    query.orderBy("nama", "asc").onSnapshot(async (snapshot) => {
        if (snapshot.empty) {
            nilaiBody.innerHTML = '<tr><td colspan="8" class="text-center py-10 text-slate-400">Tidak ada data siswa.</td></tr>';
            return;
        }

        const rowsPromises = snapshot.docs.map(async (doc) => {
            const student = doc.data();
            const studentId = doc.id;
            const docId = `${studentId}_${mapelTerpilih}_${semesterTerpilih}`;
            
            const gradeDoc = await db.collection("grades").doc(docId).get();
            const dataNilai = gradeDoc.exists ? gradeDoc.data() : { uh1: "", uh2: "", uts: "" };
            
            return { id: studentId, student, dataNilai };
        });

        const allData = await Promise.all(rowsPromises);
        
        nilaiBody.innerHTML = "";
        allData.forEach(item => {
            renderRowNilai(item.id, item.student, item.dataNilai);
        });
    });
}

// 3. Helper untuk Render Baris Tabel (Ditambah Rata-rata)
function renderRowNilai(id, student, nilai) {
    const n1 = parseFloat(nilai.uh1) || 0;
    const n2 = parseFloat(nilai.uh2) || 0;
    const n3 = parseFloat(nilai.uts) || 0;
    const rataRata = ((n1 + n2 + n3) / 3).toFixed(1);

    const row = `
    <tr class="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-all">
        <td class="px-6 py-4 font-mono text-[11px] text-slate-400">${student.nisn || '---'}</td>
        <td class="px-6 py-4">
            <div class="font-bold text-slate-700">${student.nama}</div>
        </td>
        <td class="px-6 py-4 text-center font-semibold text-slate-500">${student.kelas}</td>
        <td class="px-6 py-4 text-center">
            <input type="number" value="${nilai.uh1 || ''}" data-id="${id}" data-type="uh1" oninput="updateLiveRata(this)"
                class="input-nilai w-16 p-2 bg-slate-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
        </td>
        <td class="px-6 py-4 text-center">
            <input type="number" value="${nilai.uh2 || ''}" data-id="${id}" data-type="uh2" oninput="updateLiveRata(this)"
                class="input-nilai w-16 p-2 bg-slate-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
        </td>
        <td class="px-6 py-4 text-center">
            <input type="number" value="${nilai.uts || ''}" data-id="${id}" data-type="uts" oninput="updateLiveRata(this)"
                class="input-nilai w-16 p-2 bg-slate-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
        </td>
        <td class="px-6 py-4 text-center font-bold text-blue-600" id="rata-${id}">${rataRata}</td>
        <td class="px-6 py-4 text-center">
            <button onclick="resetNilai('${id}')" class="p-2 text-red-400 hover:text-red-600 rounded-lg transition">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    </tr>`;
    nilaiBody.insertAdjacentHTML("beforeend", row);
}

// 4. Update Nilai Rata-rata secara Live
function updateLiveRata(el) {
    const id = el.getAttribute("data-id");
    const row = el.closest("tr");
    const inputs = row.querySelectorAll(".input-nilai");
    let total = 0;
    inputs.forEach(input => total += (parseFloat(input.value) || 0));
    document.getElementById(`rata-${id}`).innerText = (total / 3).toFixed(1);
}

// 5. Fungsi Simpan Nilai Massal
async function handleSimpanNilai() {
    const mapel = selectMapel.value;
    const semester = selectSemester.value;

    // 1. Validasi Filter
    if (mapel === "Pilih Mapel" || semester === "Pilih Semester" || !mapel || !semester) {
        Swal.fire("Peringatan", "Pilih Mata Pelajaran dan Semester terlebih dahulu!", "warning");
        return;
    }

    const allInputs = document.querySelectorAll(".input-nilai");
    if (allInputs.length === 0) {
        Swal.fire("Info", "Tidak ada data siswa yang ditampilkan.", "info");
        return;
    }

    const batch = db.batch(); // Menggunakan Batch agar hemat kuota dan efisien
    const updateData = {};

    // 2. Kumpulkan data dari semua input di tabel
    allInputs.forEach(input => {
        const id = input.getAttribute("data-id");
        const type = input.getAttribute("data-type"); // uh1, uh2, atau uts
        const val = input.value;

        if (!updateData[id]) updateData[id] = {};
        updateData[id][type] = val;
    });

    try {
        // UI Feedback
        btnSimpan.disabled = true;
        btnSimpan.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...';

        // 3. Masukkan ke Batch
        for (const id in updateData) {
            const docId = `${id}_${mapel}_${semester}`;
            const docRef = db.collection("grades").doc(docId);
            
            batch.set(docRef, {
                studentId: id,
                mapel: mapel,
                semester: semester,
                ...updateData[id], // Memasukkan uh1, uh2, uts
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }); // Merge agar tidak menghapus data lain jika ada
        }

        // 4. Eksekusi ke Firebase
        await batch.commit();
        Swal.fire("Berhasil", "Semua nilai telah diperbarui ke database!", "success");
        
    } catch (error) {
        console.error("Error Simpan:", error);
        Swal.fire("Error", "Gagal menyimpan: " + error.message, "error");
    } finally {
        btnSimpan.disabled = false;
        btnSimpan.innerText = "Simpan Perubahan";
    }
}
// 6. Fungsi Hapus (Reset)
async function resetNilai(studentId) {
    const mapel = selectMapel.value;
    const semester = selectSemester.value;

    if (mapel === "Pilih Mapel" || semester === "Pilih Semester") {
        Swal.fire("Info", "Pilih Mapel & Semester dulu sebelum menghapus.", "info");
        return;
    }

    const result = await Swal.fire({
        title: 'Hapus Nilai?',
        text: "Data nilai siswa ini akan dikosongkan secara permanen.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
        try {
            await db.collection("grades").doc(`${studentId}_${mapel}_${semester}`).delete();
            Swal.fire("Terhapus!", "Nilai telah dikosongkan.", "success");
            loadDataNilai();
        } catch (e) {
            Swal.fire("Error", "Gagal menghapus data.", "error");
        }
    }
}

// 7. Fungsi Export ke PDF
function exportKePDF() {
    // Pastikan library jsPDF sudah terpanggil
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const kelas = selectKelas.value;
    const mapel = selectMapel.value;
    const semester = selectSemester.value;

    // Header PDF
    doc.setFontSize(18);
    doc.text("LAPORAN NILAI SISWA", 105, 15, { align: "center" });
    doc.setFontSize(11);
    doc.text(`Mapel: ${mapel} | Kelas: ${kelas} | Semester: ${semester}`, 105, 22, { align: "center" });

    // Mengambil data dari tabel HTML
    const rows = [];
    document.querySelectorAll("#table-body-nilai tr").forEach(tr => {
        const rowData = [];
        const tds = tr.querySelectorAll("td");
        if (tds.length > 0) {
            rowData.push(tds[0].innerText); // NISN
            rowData.push(tds[1].innerText); // Nama
            rowData.push(tds[2].innerText); // Kelas
            // Mengambil value dari input number
            rowData.push(tr.querySelector('input[data-type="uh1"]').value || "-");
            rowData.push(tr.querySelector('input[data-type="uh2"]').value || "-");
            rowData.push(tr.querySelector('input[data-type="uts"]').value || "-");
            rows.push(rowData);
        }
    });

    if (rows.length === 0) {
        Swal.fire("Gagal", "Tidak ada data untuk diekspor!", "error");
        return;
    }

    // Generate Tabel di PDF
    doc.autoTable({
        head: [['NISN', 'Nama Siswa', 'Kelas', 'UH1', 'UH2', 'UTS']],
        body: rows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Nilai_${mapel}_${kelas}.pdf`);
}

// 8. Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    loadDataNilai();
    [selectKelas, selectSemester, selectMapel].forEach(select => {
        select.addEventListener("change", loadDataNilai);
    });
    
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll("#table-body-nilai tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
        });
    });

    btnSimpan.addEventListener("click", handleSimpanNilai);
    if (btnExport) btnExport.addEventListener("click", exportKePDF);
});