document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Mengambil input dan membersihkan spasi (trim)
    const usernameInput = document.getElementById('username').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value;

    // Menampilkan feedback loading pada tombol (opsional)
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';
    loginBtn.disabled = true;

    try {
        console.log("Mencoba login untuk user:", usernameInput);

        // 1. Query ke koleksi 'users'
        // PERHATIAN: Jika ini gagal, cek Console Log untuk link "Create Index" dari Firebase
        const userSnapshot = await db.collection("users")
            .where("username", "==", usernameInput)
            .where("password", "==", passwordInput)
            .get();

        if (!userSnapshot.empty) {
            // Jika data ditemukan, ambil dokumen pertama
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const role = userData.role ? userData.role.toLowerCase() : "";

            console.log("Login Berhasil! Role:", role);

            // 2. Simpan session ke LocalStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", role);
            localStorage.setItem("userId", userDoc.id);
            localStorage.setItem("userName", userData.nama || usernameInput);

            // 3. Pengalihan Halaman berdasarkan Role
            if (role === "admin") {
                window.location.href = "admin-dashboard.html";
            } else if (role === "guru") {
                window.location.href = "guru-dashboard.html";
            } else {
                alert("Role user tidak dikenali. Hubungi pengembang.");
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnText;
            }
        } else {
            alert("Username atau Password salah!");
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalBtnText;
        }

    } catch (error) {
        console.error("Firebase Login Error:", error);
        
        // Cek jika error disebabkan karena INDEX belum dibuat
        if (error.message.includes("index")) {
            alert("Sistem sedang konfigurasi database (Index Error). Cek Console Log dan klik link biru yang muncul.");
        } else {
            alert("Terjadi kesalahan koneksi: " + error.message);
        }
        
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnText;
    }
});