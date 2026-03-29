// Inisialisasi Elemen DOM
const teacherTableBody = document.getElementById("teacherTableBody");
const formGuru = document.getElementById("formGuru");
const modalGuru = document.getElementById("modalGuru");
const btnTambahGuru = document.getElementById("btnTambahGuru");
const totalGuruLabel = document.getElementById("totalGuruLabel");

// 1. FUNGSI TOGGLE MODAL
function toggleModal() {
    modalGuru.classList.toggle("hidden");
    if (modalGuru.classList.contains("hidden")) {
        formGuru.reset();
    }
}

btnTambahGuru.addEventListener("click", toggleModal);

// 2. FUNGSI LOAD DATA GURU (Real-time)
function loadTeachers() {
    db.collection("users").where("role", "==", "guru")
        .onSnapshot((snapshot) => {
            teacherTableBody.innerHTML = "";
            
            if (snapshot.empty) {
                teacherTableBody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-slate-400 italic font-medium">Belum ada data guru terdaftar.</td></tr>`;
                totalGuruLabel.innerText = "Total: 0 Guru";
                return;
            }

            let no = 1;
            snapshot.forEach((doc) => {
                const data = doc.data();
                const row = `
                    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-50">
                        <td class="py-4 px-6 text-center font-bold text-slate-400 text-sm">${no++}</td>
                        <td class="py-4 px-6">
                            <div class="font-bold text-slate-800">${data.nama}</div>
                            <div class="text-[10px] text-blue-500 font-black uppercase tracking-widest">User: ${data.username}</div>
                        </td>
                        <td class="py-4 px-6 text-center">
                            <span class="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-lg text-xs border border-indigo-100">
                                ${data.kelas || '-'}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-slate-600 text-sm font-medium italic">${data.email}</td>
                        <td class="py-4 px-6 text-slate-300 tracking-widest text-xs">••••••••</td>
                        <td class="py-4 px-6 text-center">
                            <button onclick="hapusGuru('${doc.id}', '${data.nama}')" 
                                class="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition inline-flex items-center justify-center shadow-sm border border-red-100">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </td>
                    </tr>
                `;
                teacherTableBody.innerHTML += row;
            });
            totalGuruLabel.innerText = `Total: ${snapshot.size} Guru Terdaftar`;
        });
}

// 3. FUNGSI SIMPAN GURU (HANYA SATU EVENT LISTENER)
formGuru.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // UI Feedback: Loading
    const btnSimpan = e.submitter;
    const originalText = btnSimpan.innerText;
    btnSimpan.innerText = "Memproses...";
    btnSimpan.disabled = true;

    const nama = document.getElementById("namaGuru").value;
    const newGuru = {
        nama: nama,
        username: document.getElementById("userGuru").value.toLowerCase().trim(),
        kelas: document.getElementById("kelasGuru").value,
        email: document.getElementById("emailGuru").value,
        password: document.getElementById("passGuru").value,
        role: "guru",
        createdAt: new Date().toISOString()
    };

    try {
        await db.collection("users").add(newGuru);
        showToast(`Guru ${nama} berhasil didaftarkan`, 'success');
        toggleModal(); 
    } catch (error) {
        console.error("Firebase Error:", error);
        showToast("Gagal menyimpan data ke Firebase", 'error');
    } finally {
        btnSimpan.innerText = originalText;
        btnSimpan.disabled = false;
    }
});

// 4. FUNGSI HAPUS GURU
async function hapusGuru(id, nama) {
    if (confirm(`Hapus data guru "${nama}"?`)) {
        try {
            await db.collection("users").doc(id).delete();
            showToast(`Data ${nama} telah dihapus`, 'success');
        } catch (error) {
            showToast("Gagal menghapus data", 'error');
        }
    }
}

// 5. FUNGSI TOAST
function showToast(message, type = 'success') {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fadeIn min-w-[300px] mb-3`;
    toast.innerHTML = `
        <i class="fas ${icon} text-xl"></i>
        <div class="flex-1">
            <p class="text-xs font-black uppercase tracking-widest opacity-80">${type === 'success' ? 'Berhasil' : 'Gagal'}</p>
            <p class="text-sm font-bold">${message}</p>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", loadTeachers);

        // Logika sederhana untuk Bulk Insert di admin-datasiswa.js nantinya:
        async function processBulkInsert() {
            const input = document.getElementById("bulkJsonInput").value;
            try {
                const dataArray = JSON.parse(input);
                if(!Array.isArray(dataArray)) throw new Error("Format harus Array []");
                
                // Looping untuk simpan ke Firebase
                for (const item of dataArray) {
                    await db.collection("students").add({
                        ...item,
                        createdAt: new Date().toISOString()
                    });
                }
                alert("Berhasil mengimpor " + dataArray.length + " data siswa!");
                toggleBulkModal();
            } catch (e) {
                alert("Format JSON salah! Pastikan sesuai contoh.");
            }
        }

        function toggleModal() { document.getElementById("modalSiswa").classList.toggle("hidden"); }
        function toggleBulkModal() { document.getElementById("modalBulk").classList.toggle("hidden"); }
