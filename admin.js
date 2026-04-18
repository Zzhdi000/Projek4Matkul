// 1. INISIALISASI ELEMEN
const teacherTableBody = document.getElementById("teacherTableBody");
const formGuru = document.getElementById("formGuru");
const modalGuru = document.getElementById("modalGuru");
const modalBulk = document.getElementById("modalBulk");
const btnTambahGuru = document.getElementById("btnTambahGuru");
const totalGuruLabel = document.getElementById("totalGuruLabel");
const searchGuru = document.getElementById("searchGuru"); 
const filterJabatan = document.getElementById("filterJabatan"); 

let allTeachers = []; // Variable pembantu untuk search/filter
let editMode = false;
let currentEditId = null;

// 2. LOGIKA MODAL
function toggleModal() {
    if (modalGuru) {
        modalGuru.classList.toggle("hidden");
        
        // Jika modal tertutup, bersihkan semua state edit
        if (modalGuru.classList.contains("hidden")) {
            editMode = false;
            currentEditId = null;
            formGuru.reset();
            
            // Sembunyikan kembali container password lama
            const oldPassContainer = document.getElementById("oldPassContainer");
            if (oldPassContainer) oldPassContainer.classList.add("hidden");
            
            // Kembalikan label dan placeholder ke semula
            document.getElementById("labelPass").innerHTML = `<i class="fas fa-lock mr-2 text-rose-500"></i> Password Baru`;
            document.getElementById("passGuru").placeholder = "Buat password minimal 8 karakter...";

            // Aktifkan kembali input email
            document.getElementById("emailGuru").disabled = false;
            document.getElementById("emailGuru").classList.remove("bg-slate-100", "cursor-not-allowed", "opacity-50");
            
            // Kembalikan teks tombol dan judul
            document.querySelector("#modalGuru h3").innerText = "Input Data Guru";
            document.querySelector("#formGuru button[type='submit']").innerText = "Simpan Data Baru";
        }
    }
}

function toggleBulkModal() {
    if (modalBulk) modalBulk.classList.toggle("hidden");
}

if (btnTambahGuru) btnTambahGuru.addEventListener("click", toggleModal);

// 3. RENDER TABLE
function renderTable(dataArray) {
    teacherTableBody.innerHTML = "";
    
    if (dataArray.length === 0) {
        teacherTableBody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-slate-400 italic">Data tidak ditemukan.</td></tr>`;
        totalGuruLabel.innerText = "Total: 0 Guru";
        return;
    }

    dataArray.forEach((data, index) => {
        const isWali = data.kelas && data.kelas !== "-";
        const row = `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50">
                <td class="py-4 px-6 text-center font-bold text-slate-400 text-sm">${index + 1}</td>
                <td class="py-4 px-6">
                    <div class="font-bold text-slate-800">${data.nama}</div>
                    <div class="text-[10px] text-blue-500 font-black uppercase tracking-tight">User: ${data.username}</div>
                </td>
                <td class="py-4 px-6 text-center">
                    ${isWali 
                        ? `<span class="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg text-[11px] border border-blue-100">${data.kelas}</span>` 
                        : `<span class="text-slate-300 font-bold text-[10px] uppercase italic">Guru Mapel</span>`}
                </td>
                <td class="py-4 px-6 text-slate-600 text-sm italic">${data.email}</td>
                
                <td class="py-4 px-6 text-center">
                    <span class="text-slate-300 tracking-[0.5em] text-[10px] font-black bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm inline-block">
                        ••••••••
                    </span>
                </td>

                <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="editGuru('${data.id}')" 
                                class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition inline-flex items-center justify-center border border-amber-100 shadow-sm"
                                title="Edit Data">
                            <i class="fas fa-pencil-alt text-xs"></i>
                        </button>
                        
                        <button onclick="hapusGuru('${data.id}', '${data.nama}', '${data.email}')" 
                                class="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition inline-flex items-center justify-center border border-red-100 shadow-sm"
                                title="Hapus Data">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        teacherTableBody.innerHTML += row;
    });
    
    totalGuruLabel.innerText = `Total: ${dataArray.length} Guru Terdaftar`;
}

// 4. LOAD DATA GURU
function loadTeachers() {
    db.collection("users")
        .where("role", "==", "guru")
        .orderBy("nama", "asc")
        .onSnapshot((snapshot) => {
            allTeachers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            applyFilter(); 
        }, (error) => {
            console.error("Error loading teachers: ", error);
        });
}

// 5. FUNGSI FILTER & SEARCH
function applyFilter() {
    const keyword = searchGuru.value.toLowerCase();
    const jabatan = filterJabatan.value;

    const filtered = allTeachers.filter(guru => {
        const matchNama = guru.nama.toLowerCase().includes(keyword);
        
        let matchJabatan = true;
        if (jabatan === "wali") {
            matchJabatan = guru.kelas && guru.kelas !== "-";
        } else if (jabatan === "mapel") {
            matchJabatan = !guru.kelas || guru.kelas === "-";
        }

        return matchNama && matchJabatan;
    });

    renderTable(filtered);
}

if(searchGuru) searchGuru.addEventListener("input", applyFilter);
if(filterJabatan) filterJabatan.addEventListener("change", applyFilter);

// --- BARU: FUNGSI EDIT GURU (MENGISI MODAL) ---
async function editGuru(id) {
    const guru = allTeachers.find(g => g.id === id);
    if (!guru) return;

    editMode = true;
    currentEditId = id;

    // 1. Tampilkan & Isi Password Lama (Sekedar Intip)
    const oldPassContainer = document.getElementById("oldPassContainer");
    if (oldPassContainer) {
        oldPassContainer.classList.remove("hidden");
        document.getElementById("oldPassGuru").value = guru.password || "Tidak ada data";
    }

    // 2. Ubah Label agar admin tahu ini untuk update
    document.getElementById("labelPass").innerHTML = `<i class="fas fa-lock mr-2 text-rose-500"></i> Update Password Baru`;
    
    // 3. Isi Field Lainnya
    document.getElementById("namaGuru").value = guru.nama;
    document.getElementById("userGuru").value = guru.username;
    document.getElementById("kelasGuru").value = guru.kelas || "-";
    document.getElementById("emailGuru").value = guru.email;
    
    // 4. Kosongkan field password baru agar admin mengetik ulang
    document.getElementById("passGuru").value = ""; 
    document.getElementById("passGuru").placeholder = "Ketik password baru jika ingin mengubah...";
    
    // 5. Proteksi Email
    document.getElementById("emailGuru").disabled = true;
    document.getElementById("emailGuru").classList.add("bg-slate-100", "cursor-not-allowed", "opacity-50");

    // 6. Update UI Modal
    document.querySelector("#modalGuru h3").innerText = "Edit Data Tenaga Pengajar";
    document.querySelector("#formGuru button[type='submit']").innerText = "Simpan Perubahan";

    toggleModal();
}

// 6. SIMPAN GURU (MODIFIKASI UNTUK EDIT & TAMBAH)
formGuru.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSimpan = e.submitter;
    const originalBtnText = editMode ? "Simpan Perubahan" : "Simpan Data Baru";
    
    btnSimpan.innerText = "Memproses...";
    btnSimpan.disabled = true;

    const email = document.getElementById("emailGuru").value;
    const password = document.getElementById("passGuru").value;
    const nama = document.getElementById("namaGuru").value;
    const kelas = document.getElementById("kelasGuru").value;
    const username = document.getElementById("userGuru").value.toLowerCase().trim();

    try {
        if (editMode) {
            // LOGIKA UPDATE FIRESTORE
            await db.collection("users").doc(currentEditId).update({
                nama: nama,
                username: username,
                kelas: kelas || "-",
                password: password // Update salinan password di DB
            });
            showToast(`Data ${nama} Berhasil Diperbarui!`, 'success');
        } else {
            // LOGIKA TAMBAH BARU (AUTHENTICATION + FIRESTORE)
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            await db.collection("users").doc(uid).set({
                nama: nama,
                username: username,
                email: email,
                role: "guru", 
                password: password, // Menyimpan password teks biasa agar bisa diedit nanti
                kelas: kelas || "-",
                createdAt: new Date().toISOString()
            });
            showToast(`Akun Guru ${nama} Berhasil Dibuat!`, 'success');
        }
        toggleModal();
    } catch (error) {
        showToast("Gagal: " + error.message, "error");
    } finally {
        btnSimpan.innerText = originalBtnText;
        btnSimpan.disabled = false;
    }
});

// 7. PROSES BULK GURU (TAMBAHKAN FIELD PASSWORD KE FIRESTORE)
async function processBulkGuru() {
    const input = document.getElementById("bulkJsonInput").value;
    const btn = document.getElementById("btnProsesBulk");
    
    try {
        const dataArray = JSON.parse(input);
        btn.disabled = true;
        btn.innerText = "Memproses...";

        let sukses = 0;
        for (const guru of dataArray) {
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(guru.email, guru.password);
                const uid = userCredential.user.uid;

                await db.collection("users").doc(uid).set({
                    nama: guru.nama,
                    email: guru.email,
                    username: guru.username.toLowerCase(),
                    password: guru.password, // Penting: simpan agar bisa di-edit
                    kelas: guru.kelas || "-",
                    role: "guru",
                    createdAt: new Date().toISOString()
                });
                sukses++;
            } catch (err) { console.warn(`Gagal: ${guru.email}`, err.message); }
        }
        showToast(`Berhasil mengimpor ${sukses} guru!`, 'success');
        toggleBulkModal();
        document.getElementById("bulkJsonInput").value = "";
    } catch (e) { showToast("Format JSON salah!", 'error'); } 
    finally {
        btn.disabled = false;
        btn.innerText = "Mulai Impor Data";
    }
}


// 8. HAPUS GURU 
async function hapusGuru(uid, nama, email) {
    Swal.fire({
        title: "Hapus Data?",
        text: `Data guru "${nama}" (${email}) akan dihapus dari database.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await db.collection("users").doc(uid).delete();
                showToast(`Data ${nama} berhasil dihapus`, "success");
            } catch (error) {
                showToast("Gagal menghapus data", "error");
            }
        }
    });
}

// 9. UTILITIES
function showToast(message, type = 'success') {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `${type === 'success' ? 'bg-emerald-500 shadow-emerald-200/50' : 'bg-red-500 shadow-red-200/50'} text-white px-6 py-4 rounded-2xl shadow-2xl animate-fadeIn mb-3 flex items-center space-x-3`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <p class="text-sm font-bold">${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-x-10");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", loadTeachers);