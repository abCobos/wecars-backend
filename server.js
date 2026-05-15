const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/autos", async (req, res) => {
  try {
    const { data } = await axios.get("https://somosautos.mx/inventario", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);
    const autos = [];

    $("a").each((i, el) => {
      const texto = $(el).text().replace(/\s+/g, " ").trim();

      const precioMatch = texto.match(/\$[\d,]+/);

      if (precioMatch && texto.length > 15) {
        const precioTexto = precioMatch[0];
        const precio = Number(precioTexto.replace(/[^0-9]/g, ""));
        const nombre = texto.replace(precioTexto, "").trim();

        if (nombre && precio) {
          autos.push({ nombre, precio });
        }
      }
    });

    res.json(autos);
  } catch (error) {
    res.status(500).json({
      error: "Error cargando inventario"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado");
});