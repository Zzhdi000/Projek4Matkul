// functions/index.js

require('dotenv').config();

const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors')({ origin: true });

// Inisialisasi Gemini dengan API key dari Secret Manager atau environment
let genAI = null;

// Fungsi untuk mendapatkan API key dari Secret Manager (production) atau fallback ke env local
async function getGeminiAPI() {
    if (genAI) return genAI;
    
    let apiKey = process.env.GEMINI_API_KEY; // untuk local testing
    if (!apiKey) {
        // Di production, ambil dari Secret Manager (akan di-set nanti)
        apiKey = functions.config().gemini?.api_key;
    }
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY tidak ditemukan');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
}

exports.geminiProxy = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    cors(req, res, async () => {
        // Hanya izinkan POST
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const { prompt } = req.body;
            if (!prompt) {
                res.status(400).send({ error: 'Prompt tidak boleh kosong' });
                return;
            }

            const genAIInstance = await getGeminiAPI();
            const model = genAIInstance.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            res.status(200).send({ success: true, data: text });
        } catch (error) {
            console.error('Gemini API Error:', error);
            res.status(500).send({ error: 'Gagal memproses permintaan: ' + error.message });
        }
    });
});