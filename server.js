const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/autos", async (req, res) => {

  try {

    const { data } = await axios.get("https://somosautos.mx/inventario");

    const $ = cheerio.load(data);

    const autos = [];

    $(".inventory-item, .vehicle-card, .car-card").each((i, el) => {

      const nombre = $(el).find("h2,h3,.title").text().trim();

      const precioTexto = $(el).find(".price,.precio").text().trim();

      const precio = Number(
        precioTexto.replace(/[^0-9]/g, "")
      );

      if(nombre && precio){

        autos.push({
          nombre,
          precio
        });

      }

    });

    res.json(autos);

  } catch(error){

    res.status(500).json({
      error: "Error cargando inventario"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado");
});