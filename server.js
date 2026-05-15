const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/autos", async (req, res) => {
  try {
    const { data } = await axios.get("https://somosautos.mx/inventario", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const texto = $("body").text().replace(/\s+/g, " ").trim();

    const regex = /([A-Za-zÁÉÍÓÚÑáéíóúñ0-9 .,\-]+?\d{4}[^$]{0,120}?)\s+\$[\d,]+(?:\.\d{2})?\*\/Mes\s+Contado\s+\$([\d,]+)/g;

    const autos = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
      const nombre = match[1].trim();
      const precio = Number(match[2].replace(/,/g, ""));

      if (nombre && precio && precio > 50000) {
        autos.push({ nombre, precio });
      }
    }

    res.json(autos);
  } catch (error) {
    res.status(500).json({ error: "Error cargando inventario" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor iniciado"));