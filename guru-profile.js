// ==================== GURU PROFILE HANDLER (Versi Kompatibel) ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

// Update header profile (inisial dan nama)
function updateHeaderProfile() {
    const profileInitial = document.getElementById("profileInitial");
    const profileName = document.getElementById("profileName");
    const profileAvatarDropdown = document.getElementById("profileAvatarDropdown");
    const profileNameDropdown = document.getElementById("profileNameDropdown");
    const profileRoleDropdown = document.getElementById("profileRoleDropdown");

    const namaGuru = localStorage.getItem("userName") || "Guru";
    const inisial = namaGuru.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
    const waliKelas = localStorage.getItem("waliKelas") || "";
    const mapel = localStorage.getItem("userMapel") || "";

    if (profileInitial) profileInitial.innerText = inisial;
    if (profileName) profileName.innerText = namaGuru;
    if (profileAvatarDropdown) profileAvatarDropdown.innerText = inisial;
    if (profileNameDropdown) profileNameDropdown.innerText = namaGuru;

    if (profileRoleDropdown) {
        if (waliKelas && waliKelas !== "") {
            profileRoleDropdown.innerText = `Wali Kelas ${waliKelas}`;
        } else if (mapel && mapel !== "") {
            profileRoleDropdown.innerText = mapel;
        } else {
            profileRoleDropdown.innerText = "Guru Mata Pelajaran";
        }
    }
}

// Tambahkan tombol ganti password dan logout ke dalam dropdown (jika belum ada)
function ensureDropdownButtons() {
    const dropdown = document.getElementById("profileDropdown");
    if (!dropdown) return;

    // Cek apakah tombol sudah ada
    if (dropdown.querySelector("#dynamic-ganti-password")) return;

    // Cari container tempat kita akan menambahkan tombol (misalnya setelah div status)
    const statusDiv = dropdown.querySelector(".w-full.bg-gray-50");
    if (!statusDiv) return;

    // Buat tombol ganti password
    const btnGanti = document.createElement("button");
    btnGanti.id = "dynamic-ganti-password";
    btnGanti.className = "w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-200 mt-4";
    btnGanti.innerText = "Ganti Password";
    btnGanti.onclick = () => openChangePasswordForm();

    // Buat garis pemisah
    const hr = document.createElement("hr");
    hr.className = "border-slate-50 my-2";

    // Buat tombol logout (link)
    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.className = "flex items-center justify-center text-red-500 text-[11px] font-bold hover:bg-red-50 py-2 rounded-lg transition uppercase";
    logoutLink.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i> KELUAR SISTEM';
    logoutLink.onclick = (e) => {
        e.preventDefault();
        handleLogout();
    };

    // Sisipkan setelah statusDiv (atau di akhir)
    statusDiv.parentNode.insertBefore(btnGanti, statusDiv.nextSibling);
    statusDiv.parentNode.insertBefore(hr, btnGanti.nextSibling);
    statusDiv.parentNode.insertBefore(logoutLink, hr.nextSibling);
}

// Form ganti password (SweetAlert)
function openChangePasswordForm() {
    Swal.fire({
        title: '<span class="text-xl font-black text-slate-800">Ganti Password</span>',
        html: `
            <div class="text-left space-y-5 mt-2">
                <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password Lama</label>
                    <div class="relative">
                        <input type="password" id="oldPass" autocomplete="off" class="w-full py-2.5 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Masukkan password lama">
                        <button type="button" onclick="window.togglePasswordField('oldPass', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                            <i class="fas fa-eye-slash text-sm"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password Baru</label>
                    <div class="relative">
                        <input type="password" id="newPass" autocomplete="new-password" class="w-full py-2.5 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Minimal 6 karakter">
                        <button type="button" onclick="window.togglePasswordField('newPass', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                            <i class="fas fa-eye-slash text-sm"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Konfirmasi Password Baru</label>
                    <div class="relative">
                        <input type="password" id="confirmPass" autocomplete="off" class="w-full py-2.5 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ulangi password baru">
                        <button type="button" onclick="window.togglePasswordField('confirmPass', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                            <i class="fas fa-eye-slash text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Ganti Password',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl w-[450px] p-6',
            confirmButton: 'inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm',
            cancelButton: 'inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition ml-3'
        },
        preConfirm: () => {
            const oldPass = document.getElementById('oldPass').value;
            const newPass = document.getElementById('newPass').value;
            const confirmPass = document.getElementById('confirmPass').value;
            if (!oldPass || !newPass || !confirmPass) {
                Swal.showValidationMessage('Semua field harus diisi');
                return false;
            }
            if (newPass.length < 6) {
                Swal.showValidationMessage('Password baru minimal 6 karakter');
                return false;
            }
            if (newPass !== confirmPass) {
                Swal.showValidationMessage('Password baru dan konfirmasi tidak cocok');
                return false;
            }
            return { oldPass, newPass };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { oldPass, newPass } = result.value;
            try {
                const user = firebase.auth().currentUser;
                if (!user) throw new Error('User tidak terautentikasi');
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(newPass);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Password telah diperbarui',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-2xl' }
                });
                const profileDropdown = document.getElementById('profileDropdown');
                if (profileDropdown) profileDropdown.classList.add('hidden');
            } catch (error) {
                let pesan = 'Gagal mengganti password. Periksa password lama.';
                if (error.code === 'auth/wrong-password') pesan = 'Password lama salah.';
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: pesan,
                    confirmButtonText: 'OK',
                    customClass: { popup: 'rounded-2xl', confirmButton: 'px-6 py-2.5 rounded-xl bg-blue-600 text-white' }
                });
            }
        }
    });
}

// Fungsi toggle password (show/hide)
window.togglePasswordField = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector('i');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
};

// Fungsi logout (panggil dari sidebar atau link)
function handleLogout() {
    Swal.fire({
        title: "Yakin Keluar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Keluar",
        confirmButtonColor: "#ef4444",
        borderRadius: "20px",
    }).then((res) => {
        if (res.isConfirmed) window.location.href = "login.html";
    });
}

// Setup event listener untuk trigger dropdown
function setupProfileDropdown() {
    const trigger = document.getElementById('profileTrigger');
    const dropdown = document.getElementById('profileDropdown');
    if (trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
            dropdown.classList.toggle('show-dropdown');
        });
        window.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('show-dropdown');
            }
        });
    }
}

// Inisialisasi utama
function initGuruProfile() {
    updateHeaderProfile();
    setupProfileDropdown();
    ensureDropdownButtons(); // Pastikan tombol ganti password dan logout ada
}

// Panggil init saat DOMContentLoaded (untuk jaga-jaga jika tidak dipanggil dari JS lain)
document.addEventListener("DOMContentLoaded", () => {
    // Jika fungsi init belum dipanggil (misal dari guru-dashboard.js), panggil di sini
    if (typeof initGuruProfile === "function") {
        // Jangan panggil dua kali, bisa dicek dengan flag
        if (!window._guruProfileInitialized) {
            initGuruProfile();
            window._guruProfileInitialized = true;
        }
    }
    
    // Kosongkan search input jika terisi oleh autofill
const searchInput = document.getElementById('search-input');
if (searchInput) {
    // Cek apakah terisi secara otomatis
    if (searchInput.value && searchInput.value.trim() !== '') {
        searchInput.value = '';
        // Trigger event input untuk refresh daftar siswa
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
    }
    // Perkuat autocomplete off
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('autocomplete', 'nope');
    // Ubah nama field sementara (paling ampuh)
    const originalName = searchInput.getAttribute('name') || '';
    searchInput.setAttribute('name', 'dummy_' + Date.now());
    setTimeout(() => {
        searchInput.setAttribute('name', originalName);
    }, 500);
}
});

