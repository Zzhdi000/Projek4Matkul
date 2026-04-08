document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const userInput = document.getElementById('username').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value;
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = loginBtn.innerHTML;

    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';
    loginBtn.disabled = true;

    try {
        // 1. CARI EMAIL BERDASARKAN USERNAME DI FIRESTORE
        // Kita cek apakah input itu username atau email
        let userQuery;
        if (userInput.includes('@')) {
            userQuery = db.collection("users").where("email", "==", userInput);
        } else {
            userQuery = db.collection("users").where("username", "==", userInput);
        }

        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            throw new Error("Username tidak ditemukan!");
        }

        const userData = userSnapshot.docs[0].data();
        const emailAsli = userData.email;

        // 2. LOGIN KE FIREBASE AUTH MENGGUNAKAN EMAIL ASLI
        const userCredential = await auth.signInWithEmailAndPassword(emailAsli, passwordInput);
        const uid = userCredential.user.uid;

        // 3. AMBIL DATA ROLE TERBARU
        const role = userData.role ? userData.role.toLowerCase() : "";

        // 4. SIMPAN SESSION
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", uid);
        localStorage.setItem("userName", userData.nama || userInput);

        // 5. REDIRECT BERDASARKAN ROLE
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
        
        // Jika error karena index belum dibuat, beri tahu user
        if (error.message.includes("index")) {
            pesanPalsu = "Database sedang dikonfigurasi. Cek Console (F12) dan klik link biru.";
        } else if (error.message.includes("Username tidak ditemukan")) {
            pesanPalsu = "Username tidak terdaftar!";
        }

        alert(pesanPalsu);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnText;
    }
});

// login.js
async function handleLogin(email, password) {
    try {
        // 1. Proses Login ke Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        // 2. Ambil Data Role dari Firestore berdasarkan UID tadi
        const userDoc = await db.collection("users").doc(uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const role = userData.role;

            // 3. Arahkan Berdasarkan Role
            if (role === "admin") {
                window.location.href = "admin-dashboard.html";
            } else if (role === "guru") {
                window.location.href = "guru-dashboard.html";
            } else {
                alert("Role tidak dikenali!");
            }
        } else {
            alert("Data profil tidak ditemukan di database!");
        }
    } catch (error) {
        alert("Login Gagal: " + error.message);
    }
}