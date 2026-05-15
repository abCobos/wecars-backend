const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const tipos = [1, 3, 4, 6, 10];

app.get("/autos", async (req, res) => {
  try {

    const autos = [];
    const urls = [];

    // INVENTARIO GENERAL
    urls.push("https://somosautos.mx/inventario");

    // GENERAR URLS AUTOMÁTICAMENTE
    for (const tipo of tipos) {

      for (let pagina = 1; pagina <= 14; pagina++) {

        urls.push(
          `https://somosautos.mx/inventario?pagina=2&type[0]=${tipo}&page=${pagina}`
        );

      }
    }

    // RECORRER URLS
    for (const url of urls) {

      console.log("Leyendo:", url);

      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 20000
      });

      const $ = cheerio.load(data);

      $("a[href*='/vehiculo/']").each((index, el) => {

        let nombre = $(el)
          .text()
          .replace(/\s+/g, " ")
          .trim();

        const bloque = $(el)
          .closest("div")
          .parent()
          .parent()
          .text()
          .replace(/\s+/g, " ")
          .trim();

        const precioMatch = bloque.match(/Contado\s*\$([\d,]+)/);

        if (!precioMatch) return;

        const precio = Number(
          precioMatch[1].replace(/,/g, "")
        );

        nombre = nombre
          .replace(/Ver Más/gi, "")
          .replace(/\s+/g, " ")
          .trim();

        if (
          nombre &&
          precio > 50000
        ) {

          autos.push({
            nombre,
            precio
          });

        }

      });

    }

    // ELIMINAR DUPLICADOS
    const unicos = [];
    const vistos = new Set();

    for (const auto of autos) {

      const clave = `${auto.nombre}-${auto.precio}`;

      if (!vistos.has(clave)) {

        vistos.add(clave);
        unicos.push(auto);

      }

    }

    res.json(unicos);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado en puerto " + PORT);
});