const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 9999;

const url = "mongodb+srv://akhil:akhil493@mydb.3f3ay.mongodb.net/?retryWrites=true&w=majority&appName=MyDb";

mongoose
    .connect(url)
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.error("Database connection failed", err));


const translationSchema = new mongoose.Schema({
    original_text: String,
    transed_text: String,
    source_lang: { type: String, default: "en" },
    target_lang: { type: String, default: "hi" },
});

const Translation = mongoose.model("Translation", translationSchema);

app.use(bodyParser.json());
app.use(cors());


app.post("/api/translateText", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "English text is required" });
        }

        const existingTranslation = await Translation.findOne({ original_text: text.toLowerCase() });

        if (existingTranslation) {
            return res.status(200).json({ 
                message: "Translation found", 
                hindi_text: existingTranslation.transed_text 
            });
        }

        res.status(404).json({ message: "Translation not found, please provide one." });

    } catch (err) {
        res.status(500).json({ message: `Server Error: ${err}` });
    }
});


app.post("/api/addTranslation", async (req, res) => {
    try {
        const { original_text, transed_text } = req.body;

        if (!original_text || !transed_text) {
            return res.status(400).json({ message: "Both language text are required" });
        }

        const newTranslation = new Translation({
            original_text: original_text.toLowerCase(),
            transed_text: transed_text.toLowerCase(),
            source_lang: "en", 
            target_lang: "hi"   
        });

        await newTranslation.save();
        res.status(201).json({ message: "Translation added successfully" });

    } catch (err) {
        res.status(500).json({ message: `Server Error: ${err}` });
    }
});



app.get("/api/getTranslations", async (req, res) => {
    try {
        const translations = await Translation.find().sort({ createdAt: -1 });
        res.status(200).json(translations);
    } catch (err) {
        res.status(500).json({ message: "Error fetching translations" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
