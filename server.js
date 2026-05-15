const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/autos", async (req, res) => {
  try {
    const urls = [
      "https://somosautos.mx/inventario",
      "https://somosautos.mx/inventario/page/2",
      "https://somosautos.mx/inventario/page/3",
      "https://somosautos.mx/inventario/page/4",
      "https://somosautos.mx/inventario/page/5"
    ];

    const autos = [];

    for (const url of urls) {
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const $ = cheerio.load(data);
      const texto = $("body").text().replace(/\s+/g, " ").trim();

      const regex = /([A-Za-zÁÉÍÓÚÑáéíóúñ0-9 .,\-]+?\d{4}[^$]{0,120}?)\s+\$[\d,]+(?:\.\d{2})?\*\/Mes\s+Contado\s+\$([\d,]+)/g;

      let match;

      while ((match = regex.exec(texto)) !== null) {
        let nombre = match[1].trim();
        const precio = Number(match[2].replace(/,/g, ""));

        nombre = nombre
          .replace(/Ver Más/gi, "")
          .replace(/Automatica Transmisión/gi, "")
          .replace(/Manual Transmisión/gi, "")
          .replace(/\d{1,3},?\d{3}\s+Kilometros/gi, "")
          .replace(/Gasolina Combustible/gi, "")
          .replace(/Hibrido Combustible/gi, "")
          .replace(/\s+/g, " ")
          .trim();

        if (nombre && precio && precio > 50000) {
          autos.push({ nombre, precio });
        }
      }
    }

    res.json(autos);
  } catch (error) {
    res.status(500).json({ error: "Error cargando inventario" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor iniciado"));