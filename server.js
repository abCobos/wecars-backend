const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const tipos = [1, 3, 4, 6, 10];

/*
========================================
MARCAS + MODELOS
========================================
*/

const marcasModelos = {

  "Acura": ["ILX","Integra","MDX","RDX","TLX"],

  "Alfa Romeo": ["Giulia","Stelvio","Tonale"],

  "Audi": [
    "A1","A3","A4","A5","A6","A7","A8",
    "Q2","Q3","Q5","Q7","Q8",
    "TT","R8","e-tron"
  ],

  "BAIC": ["BJ40","X35","X55","U5 Plus"],

  "BMW": [
    "Serie 1","Serie 2","220I","230I",
    "Serie 3","Serie 4","Serie 5",
    "X1","X2","X3","X4","X5","X6",
    "M2","M3","M4","i4","iX"
  ],

  "Buick": ["Encore","Enclave","Envista"],

  "BYD": ["Dolphin","Han","King","Seal","Song"],

  "Cadillac": ["ATS","CT4","CT5","Escalade","XT4","XT5","XT6"],

  "Chevrolet": [
    "Aveo","Beat","Blazer","Camaro","Captiva",
    "Cavalier","Cheyenne","Colorado","Corvette",
    "Cruze","Equinox","Groove","Malibu","Onix",
    "S10","Silverado","Spark","Suburban","Tahoe",
    "Tracker","Trax"
  ],

  "Chirey": ["Arrizo","Omoda","Tiggo"],

  "Chrysler": ["300","Pacifica"],

  "Dodge": [
    "Attitude","Challenger","Charger",
    "Durango","Journey"
  ],

  "Dongfeng": [
    "M4","Shine","Shine GS","Shine Max"
  ],

  "Fiat": [
    "500","Argo","Fastback","Mobi","Pulse"
  ],

  "Ford": [
    "Bronco","Edge","Escape","Expedition",
    "Explorer","Figo","Focus","Fusion",
    "Lobo","Maverick","Mustang",
    "Mustang Mach","Ranger","Territory"
  ],

  "GMC": [
    "Acadia","Sierra","Terrain","Yukon"
  ],

  "Honda": [
    "Accord","BR-V","City","Civic",
    "CR-V","Fit","HR-V","Odyssey",
    "Pilot","WR-V"
  ],

  "Hyundai": [
    "Accent","Creta","Elantra",
    "Grand i10","HB20","Santa Fe",
    "Sonata","Staria","Tucson"
  ],

  "Infiniti": [
    "Q50","Q60","QX50","QX60","QX80"
  ],

  "Isuzu": [
    "D-Max","MU-X"
  ],

  "JAC": [
    "E10X","Frison","J7","Sei2",
    "Sei3","Sei4","Sei7"
  ],

  "Jaguar": [
    "E-Pace","F-Pace","F-Type","XE","XF"
  ],

  "Jeep": [
    "Cherokee","Compass","Gladiator",
    "Grand Cherokee","Liberty","Patriot",
    "Renegade","Wrangler"
  ],

  "Kia": [
    "Forte","K3","Niro","Rio",
    "Seltos","Sorento","Soul",
    "Sportage","Stinger","Telluride"
  ],

  "Land Rover": [
    "Defender","Discovery","Discovery Sport",
    "Evoque","Range Rover","Velar"
  ],

  "Lexus": [
    "ES","GX","IS","LX","NX","RX","UX"
  ],

  "Lincoln": [
    "Aviator","Corsair","MKZ",
    "Nautilus","Navigator"
  ],

  "Mazda": [
    "CX-3","CX-30","CX-5","CX-50",
    "CX-9","Mazda 2","Mazda 3",
    "Mazda 6","MX-5"
  ],

  "Mercedes-Benz": [
    "A200","A250","AMG GT","C200",
    "C250","C300","CLA","CLS",
    "E200","E350","GLA","GLB",
    "GLC","GLE","GLS","G63","SLC"
  ],

  "MG": [
    "MG3","MG5","MG GT","HS","RX5","ZS"
  ],

  "Mini": [
    "Clubman","Cooper","Countryman"
  ],

  "Mitsubishi": [
    "Eclipse Cross","L200","Mirage",
    "Montero","Outlander","Xpander"
  ],

  "Nissan": [
    "370Z","Altima","Frontier","Kicks",
    "March","Maxima","Murano","NP300",
    "Pathfinder","Rogue","Sentra",
    "Titan","Versa","X-Trail","Z"
  ],

  "Peugeot": [
    "2008","208","3008","Partner","Rifter"
  ],

  "Porsche": [
    "718","911","Boxster","Cayenne",
    "Cayman","Macan","Panamera","Taycan"
  ],

  "RAM": [
    "700","1200","1500","2500","Promaster"
  ],

  "Renault": [
    "Captur","Duster","Kangoo",
    "Kwid","Logan","Oroch","Stepway"
  ],

  "SEAT": [
    "Arona","Ateca","Ibiza",
    "Leon","Tarraco","Toledo"
  ],

  "Subaru": [
    "BRZ","Forester","Impreza",
    "Outback","WRX","XV"
  ],

  "Suzuki": [
    "Across","Baleno","Ciaz","Ertiga",
    "Grand Vitara","Ignis","Jimny",
    "S-Cross","Swift","Vitara"
  ],

  "Tesla": [
    "Model 3","Model S","Model X","Model Y"
  ],

  "Toyota": [
    "4Runner","Avanza","Camry","Corolla",
    "GR86","Hilux","Highlander","Prius",
    "RAV4","Sequoia","Sienna","Supra",
    "Tacoma","Tundra","Yaris"
  ],

  "Volkswagen": [
    "Amarok","Beetle","Cross Sport","Golf",
    "Jetta","Nivus","Passat","Polo",
    "Taos","Teramont","Tiguan","Virtus"
  ],

  "Volvo": [
    "C40","S60","S90","XC40",
    "XC60","XC90"
  ]

};

/*
========================================
DETECTAR MARCA
========================================
*/

function detectarMarca(nombre){

  const limpio = nombre.toLowerCase();

  for(const marca in marcasModelos){

    const modelos = marcasModelos[marca];

    for(const modelo of modelos){

      if(limpio.includes(modelo.toLowerCase())){

        return marca;

      }

    }

    if(limpio.includes(marca.toLowerCase())){

      return marca;

    }

  }

  return "Sin marca";
}

/*
========================================
DETECTAR MODELO
========================================
*/

function detectarModelo(nombre){

  const limpio = nombre.toLowerCase();

  for(const marca in marcasModelos){

    const modelos = marcasModelos[marca];

    for(const modelo of modelos){

      if(limpio.includes(modelo.toLowerCase())){

        return modelo;

      }

    }

  }

  return "Sin modelo";
}

/*
========================================
ENDPOINT AUTOS
========================================
*/

app.get("/autos", async (req, res) => {

  try {

    const autos = [];
    const urls = [];

    urls.push("https://somosautos.mx/inventario");

    for(const tipo of tipos){

      for(let pagina = 1; pagina <= 14; pagina++){

        urls.push(
          `https://somosautos.mx/inventario?pagina=2&type[0]=${tipo}&page=${pagina}`
        );

      }

    }

    for(const url of urls){

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

        const precioMatch =
          bloque.match(/Contado\s*\$([\d,]+)/);

        if(!precioMatch) return;

        const precio = Number(
          precioMatch[1].replace(/,/g, "")
        );

        nombre = nombre
          .replace(/Ver Más/gi, "")
          .replace(/\s+/g, " ")
          .trim();

        const marca = detectarMarca(nombre);

        const modelo = detectarModelo(nombre);

        if(nombre && precio > 50000){

          autos.push({
            marca,
            modelo,
            nombre,
            precio
          });

        }

      });

    }

    const unicos = [];
    const vistos = new Set();

    for(const auto of autos){

      const clave =
        `${auto.marca}-${auto.modelo}-${auto.nombre}-${auto.precio}`;

      if(!vistos.has(clave)){

        vistos.add(clave);

        unicos.push(auto);

      }

    }

    res.json(unicos);

  } catch(error){

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