const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/autos", async (req, res) => {
  try {
    const autos = [];
let pagina = 1;
let seguir = true;

while (seguir) {

  const url = pagina === 1
    ? "https://somosautos.mx/inventario"
    : `https://somosautos.mx/inventario?pagina=${pagina}`;

  console.log("Leyendo:", url);

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 15000
  });

  const $ = cheerio.load(data);

  let encontrados = 0;

  $("a[href*='/vehiculo/']").each((index, el) => {

    const nombre = $(el)
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const bloque = $(el)
      .parent()
      .parent()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const precioMatch = bloque.match(/Contado\s*\$([\d,]+)/);

    if (precioMatch) {

      encontrados++;

      autos.push({
        nombre,
        precio: Number(precioMatch[1].replace(/,/g, ""))
      });
    }
  });

  console.log("Autos encontrados:", encontrados);

  if (encontrados < 3) {
    seguir = false;
  }

  pagina++;
}
      const url = i === 1
        ? "https://somosautos.mx/inventario"
        : `https://somosautos.mx/inventario?pagina=${i}`;

      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 15000
      });

      const $ = cheerio.load(data);

      $("a[href*='/vehiculo/']").each((index, el) => {
        const card = $(el).closest("div");

        let nombre = $(el).text().replace(/\s+/g, " ").trim();

        let bloque = $(el).parent().parent().text().replace(/\s+/g, " ").trim();

        let precioMatch = bloque.match(/Contado\s*\$([\d,]+)/);

        if (!precioMatch) return;

        let precio = Number(precioMatch[1].replace(/,/g, ""));

        nombre = nombre
          .replace(/Ver Más/gi, "")
          .replace(/\s+/g, " ")
          .trim();

        if (nombre && precio > 50000) {
          autos.push({ nombre, precio });
        }
      });
    }

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
app.listen(PORT, () => console.log("Servidor iniciado en puerto " + PORT));