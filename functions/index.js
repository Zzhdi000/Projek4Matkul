const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors")({ origin: true });

/**
 * Fungsi ini menggunakan Secret Manager (GEMINI_KEY)
 * Pastikan sudah menjalankan: firebase functions:secrets:set GEMINI_KEY
 */
exports.generateAIReport = onRequest({ secrets: ["GEMINI_KEY"] }, (req, res) => {
    return cors(req, res, async () => {
        // Validasi Method
        if (req.method !== "POST") {
            return res.status(405).send({ error: "Method Not Allowed" });
        }

        const { nama, nilai } = req.body.data || {};

        if (!nama || !nilai) {
            return res.status(400).send({ data: { error: "Data nama atau nilai tidak lengkap" } });
        }

        try {
            // Mengambil API Key dari Secret Manager secara aman
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `Berikan evaluasi akademik singkat untuk siswa bernama ${nama} 
                            yang memiliki nilai rata-rata ${nilai}. 
                            Berikan satu kalimat catatan guru dan satu kalimat rekomendasi tindakan.
                            Format balasan harus JSON: {"catatan": "...", "rekomendasi": "..."}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Kirim hasil kembali ke frontend
            res.status(200).send({ data: JSON.parse(responseText) });

        } catch (error) {
            console.error("AI Error:", error);
            res.status(500).send({ data: { error: "Gagal memproses AI: " + error.message } });
        }
    });
});