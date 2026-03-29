// 1. Inisialisasi Elemen UI
const selectKelas = document.getElementById("select-kelas");
const selectSemester = document.getElementById("select-semester");
const selectMapel = document.getElementById("select-mapel");
const btnLoad = document.getElementById("btn-load-analisis");
const btnGenerateAll = document.getElementById("btn-generate-all");
const tableBody = document.getElementById("table-ai-body");
const statRerata = document.getElementById("stat-rerata");
const statRemedial = document.getElementById("stat-remedial");

// 2. Konfigurasi API
const GEMINI_API_KEY = "AIzaSyBRI3ne-3Fqn9pukfJNx0_Wi8bjgTskvn8"; 
// Gunakan gemini-1.5-flash tanpa '-latest' atau ganti ke gemini-pro jika 404 berlanjut
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// 3. Fungsi Utama: AI Generator
async function runAIEngine(studentId) {
    const row = document.querySelector(`tr[data-id="${studentId}"]`);
    if (!row) return;

    const rerata = parseFloat(row.querySelector(".rerata-val").innerText);
    const namaSiswa = row.querySelector(".font-bold").innerText;
    const noteEl = row.querySelector(".ai-note-text");
    const recEl = row.querySelector(".ai-rec-text");

    noteEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Menganalisis...';
    recEl.innerText = "Memproses...";

    const promptText = `Identitas Siswa: ${namaSiswa}. Nilai Rata-rata: ${rerata} (KKM 75). 
    Tugas: Berikan evaluasi singkat sebagai asisten guru SDN Ganting.
    Format Output: JSON murni (tanpa markdown) {"catatan": "max 15 kata", "rekomendasi": "max 10 kata"}`;

    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { 
                    temperature: 0.7 
                }
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        // Ambil teks dan bersihkan dari karakter aneh/markdown
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json|```/g, "").trim();

        const aiResult = JSON.parse(rawText);

        // Update UI
        noteEl.innerText = `"${aiResult.catatan}"`;
        recEl.innerText = aiResult.rekomendasi;
        
        noteEl.classList.remove("text-slate-400", "italic");
        noteEl.classList.add("text-slate-700", "font-medium");

    } catch (error) {
        console.error("AI Error:", error);
        // Fallback jika JSON gagal diparsing
        noteEl.innerText = "Gagal memproses analisis.";
        recEl.innerText = "Cek koneksi/API.";
    }
}

// 4. Fungsi: Generate Semua Siswa
async function generateAll() {
    const rows = document.querySelectorAll("#table-ai-body tr[data-id]");
    if (rows.length === 0) return Swal.fire("Kosong", "Muat data siswa terlebih dahulu!", "info");

    const confirm = await Swal.fire({
        title: "Generate Semua?",
        text: `AI akan menganalisis ${rows.length} siswa secara otomatis.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Jalankan",
        cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
        Swal.fire({
            title: 'Sedang Memproses...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        for (const row of rows) {
            await runAIEngine(row.getAttribute("data-id"));
            // Jeda agar tidak terkena limit API Free
            await new Promise(r => setTimeout(r, 800));
        }

        Swal.close();
        Swal.fire("Selesai!", "Semua catatan rapot berhasil dibuat.", "success");
    }
}

// 5. Fungsi: Load Data dari Firestore
async function loadDataUntukAI() {
    const kelas = selectKelas.value;
    const semester = selectSemester.value;
    const mapel = selectMapel.value;

    if (kelas === "Pilih Kelas" || semester === "Pilih Semester" || mapel === "Pilih Mapel") {
        return Swal.fire("Peringatan", "Lengkapi filter!", "warning");
    }

    tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-20"><i class="fas fa-spinner fa-spin text-blue-500 text-3xl"></i></td></tr>`;

    try {
        const studentSnapshot = await db.collection("students").where("kelas", "==", kelas).orderBy("nama", "asc").get();
        
        if (studentSnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-20 text-slate-400 italic">Data tidak ditemukan.</td></tr>';
            return;
        }

        let totalNilai = 0, countRemedial = 0, rowHtml = "";

        for (const studentDoc of studentSnapshot.docs) {
            const student = studentDoc.data();
            const id = studentDoc.id;
            const gradeId = `${id}_${mapel}_${semester}`;
            const gradeDoc = await db.collection("grades").doc(gradeId).get();
            
            const g = gradeDoc.exists ? gradeDoc.data() : { uh1: 0, uh2: 0, uts: 0 };
            const rerata = ((parseFloat(g.uh1 || 0) + parseFloat(g.uh2 || 0) + parseFloat(g.uts || 0)) / 3);
            
            totalNilai += rerata;
            if (rerata < 75) countRemedial++;
            rowHtml += renderRow(id, student, g, rerata.toFixed(1));
        }

        tableBody.innerHTML = rowHtml;
        statRerata.innerText = (totalNilai / studentSnapshot.size).toFixed(1);
        statRemedial.innerText = countRemedial;
    } catch (error) {
        Swal.fire("Error", error.message, "error");
    }
}

// 6. Helper: Render Baris
function renderRow(id, s, g, rerata) {
    const color = rerata >= 75 ? "emerald" : "amber";
    return `
        <tr data-id="${id}" class="bg-white border border-slate-100 shadow-sm rounded-xl hover:bg-slate-50 transition-all">
            <td class="px-6 py-5">
                <div class="font-bold text-slate-700 uppercase">${s.nama}</div>
                <div class="text-[10px] text-slate-400">NISN: ${s.nisn || '-'}</div>
            </td>
            <td class="px-6 py-5 text-center">
                <span class="rerata-val font-bold text-${color}-600 bg-${color}-50 px-3 py-1 rounded-lg border border-${color}-200">${rerata}</span>
            </td>
            <td class="px-6 py-5">
                <div class="p-4 bg-slate-50/50 rounded-2xl border-l-4 border-${color}-500 text-[11px]">
                    <span class="ai-note-text italic text-slate-400">"Menunggu analisis AI..."</span>
                    <div class="mt-2 font-black text-${color}-600 uppercase text-[9px]">
                        <i class="fas fa-robot mr-1"></i> Rekomendasi: <span class="ai-rec-text ml-1">-</span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-5 text-center">
                <div class="flex space-x-2 justify-center">
                    <button onclick="runAIEngine('${id}')" class="w-9 h-9 bg-white border border-slate-200 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"><i class="fas fa-magic text-xs"></i></button>
                    <button onclick="saveReport('${id}')" class="w-9 h-9 bg-white border border-slate-200 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm"><i class="fas fa-save text-xs"></i></button>
                </div>
            </td>
        </tr>`;
}

// 7. Fungsi: Simpan ke Firestore
async function saveReport(studentId) {
    const row = document.querySelector(`tr[data-id="${studentId}"]`);
    const note = row.querySelector(".ai-note-text").innerText;
    const rec = row.querySelector(".ai-rec-text").innerText;

    if (note.includes("Menunggu")) return Swal.fire("Eits!", "Analisis AI dulu!", "warning");

    try {
        await db.collection("reports").doc(`${studentId}_${selectMapel.value}`).set({
            studentId, mapel: selectMapel.value, semester: selectSemester.value,
            catatan_ai: note, rekomendasi: rec, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        Swal.fire({ title: "Tersimpan!", icon: "success", timer: 1000, showConfirmButton: false });
    } catch (e) { Swal.fire("Gagal!", e.message, "error"); }
}

btnLoad.addEventListener("click", loadDataUntukAI);
btnGenerateAll.addEventListener("click", generateAll);