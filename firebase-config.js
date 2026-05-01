// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCup-IDVdpPghzz2AW3-Qu6XrLd1enK0Ug",
  authDomain: "projek4matkul.firebaseapp.com",
  projectId: "projek4matkul",
  storageBucket: "projek4matkul.firebasestorage.app",
  messagingSenderId: "69043237829",
  appId: "1:69043237829:web:1a7f39197e2ff4b83e51ac",
  measurementId: "G-P5NC8KGGF1"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ==================== KONFIRMASI LOGOUT UNTUK SEMUA HALAMAN ====================
document.addEventListener('click', function(e) {
    // Cari elemen <a> yang mengarah ke login.html (link logout)
    const logoutLink = e.target.closest('a[href*="login.html"], a[href*="logout"]');
    if (logoutLink && logoutLink.getAttribute('href') && logoutLink.getAttribute('href').includes('login.html')) {
        e.preventDefault(); // Cegah langsung pindah halaman

        Swal.fire({
            title: 'Yakin ingin keluar?',
            text: 'Anda akan diarahkan ke halaman login.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, keluar!',
            cancelButtonText: 'Batal',
            backdrop: true,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Jika menggunakan Firebase Auth, logout dulu dari auth
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    firebase.auth().signOut().then(() => {
                        // Hapus semua data lokal yang tersimpan (opsional)
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('waliKelas');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('userNip');
                        localStorage.removeItem('userMapel');
                        localStorage.removeItem('userEmail');
                        // Redirect ke halaman login
                        window.location.href = logoutLink.href;
                    }).catch((error) => {
                        console.error('Gagal logout:', error);
                        // Tetap redirect meskipun gagal signOut
                        window.location.href = logoutLink.href;
                    });
                } else {
                    // Jika tidak pakai Firebase Auth, langsung redirect
                    window.location.href = logoutLink.href;
                }
            }
        });
    }
});