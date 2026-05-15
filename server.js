const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/autos", async (req, res) => {
  try {
    const urls = [];

for (let i = 1; i <= 60; i++) {
  if (i === 1) {
    urls.push("https://somosautos.mx/inventario");
  } else {
    urls.push(`https://somosautos.mx/inventario?pagina=${i}`);
  }
}

    const autos = [];

    for (const url of urls) {
      try {
        const { data } = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          },
          timeout: 15000
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
            .replace(/Automática Transmisión/gi, "")
            .replace(/Manual Transmisión/gi, "")
            .replace(/\d{1,3},?\d{3}\s+Kilometros/gi, "")
            .replace(/\d{1,3},?\d{3}\s+Kilómetros/gi, "")
            .replace(/Gasolina Combustible/gi, "")
            .replace(/Hibrido Combustible/gi, "")
            .replace(/Híbrido Combustible/gi, "")
            .replace(/\s+/g, " ")
            .trim();

          if (nombre && precio && precio > 50000) {
            autos.push({
              nombre,
              precio
            });
          }
        }
      } catch (pageError) {
        console.log("No se pudo leer:", url, pageError.message);
      }
    }

    const autosUnicos = [];
    const vistos = new Set();

    for (const auto of autos) {
      const clave = `${auto.nombre}-${auto.precio}`;

      if (!vistos.has(clave)) {
        vistos.add(clave);
        autosUnicos.push(auto);
      }
    }

    res.json(autosUnicos);
  } catch (error) {
    res.status(500).json({
      error: "Error cargando inventario",
      detalle: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend WeCars funcionando");
});
app.get("/debug", async (req, res) => {
  const urls = [
    "https://somosautos.mx/inventario",
    "https://somosautos.mx/inventario?pagina=2",
    "https://somosautos.mx/inventario?pagina=3"
  ];

  const resultados = [];

  for (const url of urls) {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    resultados.push({
      url,
      contieneMazda: data.includes("MAZDA"),
      largo: data.length
    });
  }

  res.json(resultados);
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado en puerto " + PORT);
});