// login.js - versi final dengan penyimpanan mapel
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const userInput = document.getElementById('username').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value;
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = loginBtn.innerHTML;

    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';
    loginBtn.disabled = true;

    try {
        let userQuery;
        if (userInput.includes('@')) {
            userQuery = db.collection("users").where("email", "==", userInput);
        } else {
            userQuery = db.collection("users").where("username", "==", userInput);
        }

        const userSnapshot = await userQuery.get();
        if (userSnapshot.empty) throw new Error("Username tidak ditemukan!");

        const userData = userSnapshot.docs[0].data();
        const emailAsli = userData.email;

        // Ambil wali kelas dan mapel (pastikan tidak undefined)
        let waliKelas = userData.kelas || "";
        if (waliKelas === "-") waliKelas = "";
        
        let userMapel = userData.mapel || "";
        if (userMapel === "-") userMapel = "";

        // Login ke Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(emailAsli, passwordInput);
        const uid = userCredential.user.uid;

        const role = userData.role ? userData.role.toLowerCase() : "";

        // Simpan session dengan kunci yang konsisten
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", uid);
        localStorage.setItem("userName", userData.nama || userInput);
        localStorage.setItem("waliKelas", waliKelas);
        localStorage.setItem("userMapel", userMapel);   // ← penting untuk guru mapel

        // Redirect
        if (role === "admin") {
            window.location.href = "admin-dashboard.html";
        } else if (role === "guru") {
            window.location.href = "guru-dashboard.html";
        } else {
            alert("Role tidak dikenali!");
        }

    } catch (error) {
        console.error("Login Error:", error);
        let pesanPalsu = "Username atau Password salah!";
        if (error.message.includes("index")) pesanPalsu = "Database sedang dikonfigurasi.";
        else if (error.message.includes("Username tidak ditemukan")) pesanPalsu = "Username tidak terdaftar!";
        else if (error.message.includes("password")) pesanPalsu = "Password salah!";
        alert(pesanPalsu);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnText;
    }
});