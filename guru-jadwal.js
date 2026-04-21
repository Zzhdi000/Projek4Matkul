      // ==================== DATA GURU DARI LOCALSTORAGE ====================
      let guruData = {
          nama: localStorage.getItem("userName") || "Guru",
          role: localStorage.getItem("userRole") || "guru",
          waliKelas: localStorage.getItem("waliKelas") || "",
          userId: localStorage.getItem("userId") || "",
          mapel: localStorage.getItem("userMapel") || "Bahasa Indonesia",
          email: localStorage.getItem("userEmail") || ""
      };

      // ==================== UPDATE HEADER PROFILE ====================
      function updateHeaderProfile() {
          const namaHeader = document.querySelector("#profileBtn .text-right p:last-child");
          if (namaHeader && guruData.nama) namaHeader.innerText = guruData.nama;
          const avatarHeader = document.querySelector("#profileBtn .rounded-full");
          if (avatarHeader && guruData.nama) {
              const inisial = guruData.nama.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
              avatarHeader.innerText = inisial;
          }
          const avatarDropdown = document.querySelector("#profileDropdown .w-16.h-16");
          if (avatarDropdown && guruData.nama) {
              const inisial = guruData.nama.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
              avatarDropdown.innerText = inisial;
          }
          const namaDropdown = document.querySelector("#profileDropdown h4");
          if (namaDropdown && guruData.nama) namaDropdown.innerText = guruData.nama;

          // Update bagian print (nama guru)
          const printName = document.getElementById("print-name-placeholder");
          if (printName && guruData.nama) printName.innerText = guruData.nama;
          const printNip = document.getElementById("print-nip-placeholder");
          if (printNip) printNip.innerText = "";
      }

      function escapeHtml(str) {
          if (!str) return '';
          return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
      }

      // ==================== RENDER DROPDOWN PROFILE ====================
      function renderProfileDropdown() {
          const dropdownContent = document.getElementById("dropdownContent");
          if (!dropdownContent) return;
          const isWaliKelas = (guruData.waliKelas && guruData.waliKelas !== "");
          const tugasText = isWaliKelas ? `Wali Kelas ${guruData.waliKelas}` : (guruData.mapel !== "-" ? guruData.mapel : "Guru Mata Pelajaran");
          const emailText = guruData.email || "email@sekolah.com";
          dropdownContent.innerHTML = `
              <div class="animate-fadeIn">
                  <div class="mb-3">
                      <label class="text-[10px] font-bold text-slate-400 uppercase ml-2">Tugas</label>
                      <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 cursor-not-allowed">${escapeHtml(tugasText)}</div>
                  </div>
                  <div class="mb-3">
                      <label class="text-[10px] font-bold text-slate-400 uppercase ml-2">Email</label>
                      <div class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 cursor-not-allowed">${escapeHtml(emailText)}</div>
                  </div>
                  <button onclick="window.openChangePasswordForm(event)" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-200 mt-2">Ganti Password</button>
                  <hr class="border-slate-50 my-2">
                  <a href="login.html" class="flex items-center justify-center text-red-500 text-[11px] font-bold hover:bg-red-50 py-2 rounded-lg transition uppercase"><i class="fas fa-sign-out-alt mr-2"></i> KELUAR SISTEM</a>
              </div>`;
      }

      // ==================== FORM GANTI PASSWORD & LUPA PASSWORD ====================
      window.openChangePasswordForm = function(e) {
          if (e) e.stopPropagation();
          const dropdownContent = document.getElementById("dropdownContent");
          if (!dropdownContent) return;
          dropdownContent.innerHTML = `
              <div class="animate-fadeIn">
                  <div class="flex items-center mb-4">
                      <button onclick="window.renderProfileDropdown(); event.stopPropagation();" class="text-slate-400 hover:text-slate-800 mr-2"><i class="fas fa-arrow-left text-xs"></i></button>
                      <h4 class="text-xs font-black text-slate-800 uppercase">Ganti Password</h4>
                  </div>
                  <div class="mb-3 relative">
                      <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Password Lama</label>
                      <div class="relative">
                          <input type="password" id="oldPass" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm pr-10 outline-none focus:ring-2 focus:ring-blue-500">
                          <button type="button" onclick="window.togglePasswordField('oldPass', this)" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"><i class="fas fa-eye text-xs"></i></button>
                      </div>
                  </div>
                  <div class="mb-3 relative">
                      <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Password Baru</label>
                      <div class="relative">
                          <input type="password" id="newPass" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm pr-10 outline-none focus:ring-2 focus:ring-blue-500">
                          <button type="button" onclick="window.togglePasswordField('newPass', this)" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"><i class="fas fa-eye text-xs"></i></button>
                      </div>
                  </div>
                  <div class="mb-2 relative">
                      <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Konfirmasi Password Baru</label>
                      <div class="relative">
                          <input type="password" id="confirmPass" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm pr-10 outline-none focus:ring-2 focus:ring-blue-500">
                          <button type="button" onclick="window.togglePasswordField('confirmPass', this)" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"><i class="fas fa-eye text-xs"></i></button>
                      </div>
                  </div>
                  <div class="text-right mb-3">
                      <a href="#" onclick="window.forgotPassword(event)" class="text-[10px] text-blue-500 hover:underline">Lupa password?</a>
                  </div>
                  <button onclick="window.submitChangePassword(); event.stopPropagation();" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition uppercase">Simpan Password Baru</button>
              </div>`;
      };

      window.togglePasswordField = function(inputId, btn) {
          const input = document.getElementById(inputId);
          if (!input) return;
          const icon = btn.querySelector('i');
          if (input.type === "password") {
              input.type = "text";
              icon.classList.remove('fa-eye');
              icon.classList.add('fa-eye-slash');
          } else {
              input.type = "password";
              icon.classList.remove('fa-eye-slash');
              icon.classList.add('fa-eye');
          }
      };

      window.submitChangePassword = async function(e) {
          if (e) e.stopPropagation();
          const oldPass = document.getElementById("oldPass").value;
          const newPass = document.getElementById("newPass").value;
          const confirmPass = document.getElementById("confirmPass").value;
          if (!oldPass || !newPass || !confirmPass) {
              Swal.fire("Error", "Semua field harus diisi", "error");
              return;
          }
          if (newPass.length < 6) {
              Swal.fire("Error", "Password baru minimal 6 karakter", "error");
              return;
          }
          if (newPass !== confirmPass) {
              Swal.fire("Error", "Password baru dan konfirmasi tidak cocok", "error");
              return;
          }
          try {
              const user = firebase.auth().currentUser;
              if (!user) throw new Error("User tidak terautentikasi");
              const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
              await user.reauthenticateWithCredential(credential);
              await user.updatePassword(newPass);
              Swal.fire({ title: "Berhasil!", text: "Password telah diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
              renderProfileDropdown();
              const profileDropdown = document.getElementById("profileDropdown");
              if (profileDropdown) profileDropdown.classList.add("hidden");
          } catch (error) {
              let pesan = "Gagal mengganti password. Periksa password lama.";
              if (error.code === 'auth/wrong-password') pesan = "Password lama salah.";
              Swal.fire("Error", pesan, "error");
          }
      };

      window.forgotPassword = async function(e) {
          if (e) {
              e.preventDefault();
              e.stopPropagation();
          }
          try {
              const user = firebase.auth().currentUser;
              if (!user || !user.email) {
                  Swal.fire("Error", "Email user tidak ditemukan.", "error");
                  return;
              }
              await firebase.auth().sendPasswordResetEmail(user.email);
              Swal.fire({
                  title: "Email Terkirim!",
                  text: `Link reset password telah dikirim ke ${user.email}. Cek inbox atau folder spam.`,
                  icon: "success",
                  confirmButtonText: "OK"
              });
              setTimeout(() => { renderProfileDropdown(); }, 2000);
          } catch (error) {
              Swal.fire("Error", "Gagal mengirim email reset. " + error.message, "error");
          }
      };

      // Event profile button
      const profileBtn = document.getElementById("profileBtn");
      const profileDropdownElem = document.getElementById("profileDropdown");
      if (profileBtn && profileDropdownElem) {
          profileBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              profileDropdownElem.classList.toggle("hidden");
              if (!profileDropdownElem.classList.contains("hidden")) renderProfileDropdown();
          });
          window.addEventListener("click", (e) => {
              if (!profileBtn.contains(e.target) && !profileDropdownElem.contains(e.target)) {
                  profileDropdownElem.classList.add("hidden");
              }
          });
      }

      // ==================== AMBIL EMAIL DARI AUTH & UPDATE PROFILE ====================
      firebase.auth().onAuthStateChanged((user) => {
          if (user && user.email) {
              guruData.email = user.email;
              localStorage.setItem("userEmail", user.email);
          } else {
              guruData.email = localStorage.getItem("userEmail") || "";
          }
          updateHeaderProfile();
          renderProfileDropdown();

          // Update bagian print dengan tanggal hari ini
          const today = new Date();
          const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          const tanggalString = today.toLocaleDateString('id-ID', options);
          const printDateElem = document.getElementById("print-date-placeholder");
          if (printDateElem) printDateElem.innerText = `Surabaya, ${tanggalString}`;
      });