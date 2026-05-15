const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const tipos = [1, 3, 4, 6, 10];

const marcas = [
  "Acura", "Alfa Romeo", "Audi", "BAIC", "BMW", "Buick", "BYD",
  "Cadillac", "Chevrolet", "Chirey", "Chrysler", "Dodge", "Dongfeng",
  "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Isuzu",
  "JAC", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln",
  "Mazda", "Mercedes-Benz", "Mercedes Benz", "MG", "Mini", "Mitsubishi",
  "Nissan", "Peugeot", "Porsche", "RAM", "Renault", "SEAT", "Subaru",
  "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo", "VW"
];

function detectarMarca(nombre) {
  const limpio = nombre.toLowerCase();

  const marcasOrdenadas = marcas.sort((a, b) => b.length - a.length);

  for (const marca of marcasOrdenadas) {
    if (limpio.includes(marca.toLowerCase())) {
      if (marca === "Mercedes Benz") return "Mercedes-Benz";
      if (marca === "VW") return "Volkswagen";
      return marca;
    }
  }

  return "Sin marca";
}

app.get("/autos", async (req, res) => {
  try {
    const autos = [];
    const urls = [];

    urls.push("https://somosautos.mx/inventario");

    for (const tipo of tipos) {
      for (let pagina = 1; pagina <= 14; pagina++) {
        urls.push(
          `https://somosautos.mx/inventario?pagina=2&type[0]=${tipo}&page=${pagina}`
        );
      }
    }

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

        const precio = Number(precioMatch[1].replace(/,/g, ""));

        nombre = nombre
          .replace(/Ver Más/gi, "")
          .replace(/\s+/g, " ")
          .trim();

        const marca = detectarMarca(nombre);

        if (nombre && precio > 50000) {
          autos.push({
            marca,
            nombre,
            precio
          });
        }
      });
    }

    const unicos = [];
    const vistos = new Set();

    for (const auto of autos) {
      const clave = `${auto.marca}-${auto.nombre}-${auto.precio}`;

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