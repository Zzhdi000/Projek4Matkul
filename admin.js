// 1. INISIALISASI ELEMEN
const teacherTableBody = document.getElementById("teacherTableBody");
const formGuru = document.getElementById("formGuru");
const modalGuru = document.getElementById("modalGuru");
const modalBulk = document.getElementById("modalBulk");
const btnTambahGuru = document.getElementById("btnTambahGuru");
const totalGuruLabel = document.getElementById("totalGuruLabel");

// 2. LOGIKA MODAL
function toggleModal() {
    if (modalGuru) {
        modalGuru.classList.toggle("hidden");
        if (modalGuru.classList.contains("hidden")) formGuru.reset();
    }
}

function toggleBulkModal() {
    if (modalBulk) modalBulk.classList.toggle("hidden");
}

if (btnTambahGuru) btnTambahGuru.addEventListener("click", toggleModal);

// 3. LOAD DATA GURU (Filter: users where role == guru)
function loadTeachers() {
    db.collection("users").where("role", "==", "guru")
        .onSnapshot((snapshot) => {
            teacherTableBody.innerHTML = "";
            if (snapshot.empty) {
                teacherTableBody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-slate-400 italic">Belum ada data guru.</td></tr>`;
                totalGuruLabel.innerText = "Total: 0 Guru";
                return;
            }

            let no = 1;
            snapshot.forEach((doc) => {
                const data = doc.data();
                const row = `
                    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <td class="py-4 px-6 text-center font-bold text-slate-400 text-sm">${no++}</td>
                        <td class="py-4 px-6">
                            <div class="font-bold text-slate-800">${data.nama}</div>
                            <div class="text-[10px] text-blue-500 font-black uppercase">User: ${data.username}</div>
                        </td>
                        <td class="py-4 px-6 text-center">
                            <span class="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-lg text-xs">${data.kelas || '-'}</span>
                        </td>
                        <td class="py-4 px-6 text-slate-600 text-sm italic">${data.email}</td>
                        <td class="py-4 px-6 text-slate-300 tracking-widest text-xs">••••••••</td>
                        <td class="py-4 px-6 text-center">
                            <button onclick="hapusGuru('${doc.id}', '${data.nama}')" class="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition inline-flex items-center justify-center border border-red-100">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </td>
                    </tr>`;
                teacherTableBody.innerHTML += row;
            });
            totalGuruLabel.innerText = `Total: ${snapshot.size} Guru Terdaftar`;
        });
}

// 4. SIMPAN GURU MANUAL
formGuru.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSimpan = e.submitter;
    btnSimpan.innerText = "Mendaftarkan...";
    btnSimpan.disabled = true;

    const email = document.getElementById("emailGuru").value;
    const password = document.getElementById("passGuru").value;
    const nama = document.getElementById("namaGuru").value;
    const kelas = document.getElementById("kelasGuru").value;
    const username = document.getElementById("userGuru").value.toLowerCase().trim();

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        await db.collection("users").doc(uid).set({
            nama: nama,
            username: username,
            email: email,
            role: "guru", 
            kelas: kelas,
            createdAt: new Date().toISOString()
        });

        showToast(`Akun Guru ${nama} Berhasil Dibuat!`, 'success');
        toggleModal();
    } catch (error) {
        showToast("Gagal: " + error.message, "error");
    } finally {
        btnSimpan.innerText = "Simpan Data";
        btnSimpan.disabled = false;
    }
});

// 5. PROSES BULK GURU
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

async function hapusGuru(id, nama) {
    if (confirm(`Hapus data guru "${nama}"?`)) {
        try {
            await db.collection("users").doc(id).delete();
            showToast(`Data ${nama} telah dihapus`, 'success');
        } catch (error) { showToast("Gagal menghapus", 'error'); }
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-6 py-4 rounded-2xl shadow-2xl animate-fadeIn mb-3 flex items-center space-x-3`;
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <p class="text-sm font-bold">${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Hapus guru dari Firestore sekaligus dari Authentication
async function hapusGuru(uid, email) {
    try {
        // 1. Hapus dari Authentication
        const user = firebase.auth().currentUser;
       
        Swal.fire({
            title: "Perhatian!",
            text: `User dengan email ${email} tidak bisa dihapus otomatis dari Authentication. Buka Firebase Console → Authentication → Hapus user tersebut secara manual.`,
            icon: "warning",
            confirmButtonText: "Mengerti"
        });
        
        // 2. Tetap hapus dokumen Firestore
        await db.collection("users").doc(uid).delete();
        return true;
    } catch (error) {
        console.error("Gagal hapus:", error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", loadTeachers);