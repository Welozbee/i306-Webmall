import prisma from "../src/prisma";
import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client";
import { url } from "node:inspector";

const stores = [
  // HIGH FASHION
  {
    name: "Akris",
    storeNumber: "320",
    phone: "091 601 93 30",
    floor: 3,
    category: "High Fashion",
    url: "https://ch.akris.com/",
    logoUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvectorseek.com%2Fwp-content%2Fuploads%2F2023%2F05%2FAkris-Logo-Vector-600x600.jpg&f=1&nofb=1&ipt=2b54921de34447db1974b9274d484b4b184d51689797741519fae95c85d91df7",
  },
  {
    name: "Armani",
    storeNumber: "328",
    phone: "091 630 06 17",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Borbonese",
    storeNumber: "244",
    phone: "091 646 26 60",
    floor: 2,
    category: "High Fashion",
  },
  {
    name: "Boss",
    storeNumber: "326",
    phone: "091 630 26 40",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Burberry",
    storeNumber: "343",
    phone: "044 588 99 62",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Coach",
    storeNumber: "201",
    phone: "091 646 01 86",
    floor: 2,
    category: "High Fashion",
  },
  {
    name: "Corneliani",
    storeNumber: "306",
    phone: "091 630 01 47",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Dolce & Gabbana",
    storeNumber: "339",
    phone: "091 630 29 90",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Dsquared2",
    storeNumber: "160",
    phone: "091 646 35 36",
    floor: 1,
    category: "High Fashion",
  },
  {
    name: "Etro",
    storeNumber: "315",
    phone: "091 646 34 15",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Fay",
    storeNumber: "309",
    phone: "091 646 92 15",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Furla",
    storeNumber: "316",
    phone: "091 646 36 01",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "John Richmond",
    storeNumber: "342",
    phone: "091 630 29 33",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Kate Spade New York",
    storeNumber: "327",
    phone: "091 646 77 67",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Kiton",
    storeNumber: "311",
    phone: "091 683 02 02",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Longchamp",
    storeNumber: "322",
    phone: "091 600 35 30",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Loro Piana",
    storeNumber: "330",
    phone: "091 640 99 30",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Michael Kors",
    storeNumber: "214",
    phone: "091 646 81 00",
    floor: 2,
    category: "High Fashion",
  },
  {
    name: "Missoni",
    storeNumber: "314",
    phone: "091 646 74 19",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Off-White",
    storeNumber: "325",
    phone: "091 646 33 90",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Patrizia Pepe",
    storeNumber: "372",
    phone: "091 640 08 11",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Philipp Plein Men",
    storeNumber: "158",
    phone: "091 646 24 08",
    floor: 1,
    category: "High Fashion",
  },
  {
    name: "Philipp Plein Women",
    storeNumber: "157",
    phone: "091 646 24 08",
    floor: 1,
    category: "High Fashion",
  },
  {
    name: "Prada",
    storeNumber: "312",
    phone: "091 986 64 40",
    floor: 3,
    category: "High Fashion",
  },
  {
    name: "Salvatore Ferragamo",
    storeNumber: "106",
    phone: "091 630 05 90",
    floor: 1,
    category: "High Fashion",
  },
  {
    name: "Versace",
    storeNumber: "301",
    phone: "091 646 74 74",
    floor: 3,
    category: "High Fashion",
  },

  // LADIES & MENSWEAR
  {
    name: "7 for all mankind",
    storeNumber: "359",
    phone: "091 646 35 12",
    floor: 3,
    category: "Ladies & Menswear",
    logoUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmma.prnewswire.com%2Fmedia%2F1274087%2F7_for_all_Mankind_Logo.jpg%3Fp%3Dfacebook&f=1&nofb=1&ipt=db4e7f20e2232914eed05f0792ac3b25c7cbe5f2267875cbf6b2c8bdfff3043d",
    url: "https://www.7forallmankind.fr/fr_fr/",
  },
  {
    name: "André Maurice",
    storeNumber: "355",
    phone: "091 630 29 29",
    floor: 3,
    category: "Ladies & Menswear",
    logoUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.licdn.com%2Fdms%2Fimage%2Fv2%2FD4D0BAQFUl0ZNkNdwew%2Fcompany-logo_200_200%2Fcompany-logo_200_200%2F0%2F1689606764060%2Fandr_maurice_logo%3Fe%3D2147483647%26v%3Dbeta%26t%3D_xawgAeB9Okw5gShYJu_hkh7owvRc5G-AMzySMRphQA&f=1&nofb=1&ipt=5ac07491d6348eafef96df8b812d0d00cf422ba08e048d32b2807ed3a4ec60d0",
    url: "https://www.andremaurice.com/",
  },
  {
    name: "Angelico",
    storeNumber: "262",
    phone: "091 224 65 57",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://angelico.it/en",
    logoUrl:
      "https://angelico.it/cdn/shop/files/logo-angelico-dal1959-bianco.png?v=1716988942&width=320",
  },
  {
    name: "Boggi Milano",
    storeNumber: "109",
    phone: "091 646 78 33",
    floor: 1,
    category: "Ladies & Menswear",
    url: "https://www.boggi.com/fr_FR/default-homepage",
    logoUrl:
      "https://www.boggi.com/on/demandware.static/Sites-Boggi-Site/-/default/dwf7dd6555/images/global/boggi-logo-alt.svg",
  },
  {
    name: "Brooks Brothers",
    storeNumber: "362",
    phone: "091 646 62 52",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.brooksbrothers.eu/fr-fr/",
    logoUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flogos-world.net%2Fwp-content%2Fuploads%2F2020%2F08%2FBrooks-Brothers-Logo.png&f=1&nofb=1&ipt=cf822ce1d5c0b4e0b1fdeca688fbf2d661d0408718f670f5b6a6dc4c81df8072",
  },
  {
    name: "Camicissima",
    storeNumber: "162",
    phone: "091 646 27 27",
    floor: 1,
    category: "Ladies & Menswear",
    url: "https://www.camicissima.it/",
    logoUrl:
      "https://www.camicissima.it/media/logo/stores/1/LOGO-CamicissimaMilanoSince1931-Black.jpg",
  },
  {
    name: "Caroll",
    storeNumber: "277",
    phone: "091 922 81 72",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.caroll.com/fr_fr/",
    logoUrl:
      "https://www.caroll.com/on/demandware.static/Sites-CRL_FR_SFRA-Site/-/default/dw969ff8b1/images/logo.svg",
  },
  {
    name: "CoSTUME National",
    storeNumber: "217",
    phone: "091 646 80 62",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://costumenational.com/",
    logoUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fseeklogo.com%2Fimages%2FC%2Fcostume-national-logo-3616B94F87-seeklogo.com.png%3Fv%3D637703372230000000&f=1&nofb=1&ipt=b00d326e03bf1829913624e656163d5690edc5ec668490efe8b65fe3992bae33",
  },
  {
    name: "Elena Mirò",
    storeNumber: "202",
    phone: "091 646 38 66",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.elenamiro.com/fr_FR",
    logoUrl:
      "https://www.elenamiro.com/on/demandware.static/Sites-elenamiro_global-Site/-/default/dwe0bd6fa6/images/logo_miro_monogram.gif",
  },
  {
    name: "Elmas Phil",
    storeNumber: "267",
    phone: "091 220 84 53",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Elmas Phil Collection",
    storeNumber: "356",
    phone: "091 220 84 53",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Elmas Phil Uomo",
    storeNumber: "349",
    phone: "091 220 84 53",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Falke",
    storeNumber: "354",
    phone: "091 646 83 88",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Fiorella Rubino",
    storeNumber: "226",
    phone: "091 224 48 62",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Flavio Castellani",
    storeNumber: "337",
    phone: "091 646 48 48",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Hackett London",
    storeNumber: "215",
    phone: "091 630 03 29",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Human Couture",
    storeNumber: "275",
    phone: "091 646 36 53",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Il Lanificio",
    storeNumber: "231",
    phone: "091 630 23 10",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Jerem",
    storeNumber: "115",
    phone: "091 646 01 10",
    floor: 1,
    category: "Ladies & Menswear",
  },
  {
    name: "Maje",
    storeNumber: "366",
    phone: "091 630 01 46",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Marc O'Polo",
    storeNumber: "373",
    phone: "091 252 00 01",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Modesto Bertotto",
    storeNumber: "230",
    phone: "091 646 06 25",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Moorer",
    storeNumber: "336",
    phone: "091 640 95 56",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Morgan",
    storeNumber: "276",
    phone: "091 646 77 52",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Motivi",
    storeNumber: "150",
    phone: "091 630 28 45",
    floor: 1,
    category: "Ladies & Menswear",
  },
  {
    name: "Paul & Shark",
    storeNumber: "300",
    phone: "091 646 00 67",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Peuterey",
    storeNumber: "319",
    phone: "091 646 36 56",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Pinko",
    storeNumber: "338",
    phone: "091 630 22 16",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Polo Ralph Lauren",
    storeNumber: "108",
    phone: "091 641 30 10",
    floor: 1,
    category: "Ladies & Menswear",
  },
  {
    name: "Sandro",
    storeNumber: "388",
    phone: "091 260 08 64",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Trussardi",
    storeNumber: "248",
    phone: "091 225 63 23",
    floor: 2,
    category: "Ladies & Menswear",
  },
  {
    name: "Vero Moda",
    storeNumber: "139",
    phone: "091 646 31 35",
    floor: 1,
    category: "Ladies & Menswear",
  },
  {
    name: "Woolrich",
    storeNumber: "352",
    phone: "091 646 01 81",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Zadig & Voltaire",
    storeNumber: "363",
    phone: "091 646 28 32",
    floor: 3,
    category: "Ladies & Menswear",
  },
  {
    name: "Gaudì",
    storeNumber: "364",
    phone: "091 646 87 44",
    floor: 3,
    category: "Ladies & Menswear",
  },

  // CASUALWEAR
  {
    name: "Aeronautica Militare",
    storeNumber: "243",
    phone: "091 971 60 00",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Boxeur Des Rues - Malloy",
    storeNumber: "225",
    phone: "091 646 01 01",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Calvin Klein",
    storeNumber: "247",
    phone: "091 646 02 50",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "C.P. Company",
    storeNumber: "212",
    phone: "091 646 02 21",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Diesel Factory Outlet",
    storeNumber: "113",
    phone: "091 646 02 46",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "Gant",
    storeNumber: "145",
    phone: "091 646 50 22",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "Guess 1",
    storeNumber: "241",
    phone: "091 630 26 50",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Guess 2",
    storeNumber: "269",
    phone: "091 646 87 01",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Harmont & Blaine",
    storeNumber: "216",
    phone: "091 646 03 55",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Jack & Jones",
    storeNumber: "143",
    phone: "091 630 00 04",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "K·Way",
    storeNumber: "130",
    phone: "091 609 10 00",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "La Martina",
    storeNumber: "114",
    phone: "091 646 54 35",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "Lacoste",
    storeNumber: "129",
    phone: "091 646 11 24",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "Lee - Wrangler",
    storeNumber: "219",
    phone: "091 646 01 01",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Levi's & Dockers",
    storeNumber: "146",
    phone: "091 630 29 85",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "Napapijri",
    storeNumber: "353",
    phone: "091 646 74 83",
    floor: 3,
    category: "Casualwear",
  },
  {
    name: "Only",
    storeNumber: "171",
    phone: "091 646 23 35",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "Pepe Jeans",
    storeNumber: "251",
    phone: "091 630 03 27",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Quiksilver",
    storeNumber: "142",
    phone: "091 646 82 33",
    floor: 1,
    category: "Casualwear",
  },
  {
    name: "Replay",
    storeNumber: "221",
    phone: "091 630 27 14",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Timberland",
    storeNumber: "261",
    phone: "091 630 23 55",
    floor: 2,
    category: "Casualwear",
  },
  {
    name: "Tommy Hilfiger",
    storeNumber: "242",
    phone: "091 630 20 54",
    floor: 2,
    category: "Casualwear",
  },

  // SPORTSWEAR & EQUIPMENT
  {
    name: "Aventurx",
    storeNumber: "263",
    phone: "091 646 24 90",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Cmp",
    storeNumber: "257",
    phone: "091 630 06 06",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Freddy",
    storeNumber: "013",
    phone: "091 646 32 22",
    floor: 0,
    category: "Sportswear & Equipment",
  },
  {
    name: "Icebreaker",
    storeNumber: "237",
    phone: "091 600 00 95",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Jaked",
    storeNumber: "164",
    phone: "091 646 42 76",
    floor: 1,
    category: "Sportswear & Equipment",
  },
  {
    name: "Mammut",
    storeNumber: "254",
    phone: "091 630 12 44",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "New Balance",
    storeNumber: "256",
    phone: "091 646 11 01",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Nike Factory Store",
    storeNumber: "111",
    phone: "091 640 40 60",
    floor: 1,
    category: "Sportswear & Equipment",
  },
  {
    name: "Oakley",
    storeNumber: "213",
    phone: "091 646 49 50",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Odlo",
    storeNumber: "246",
    phone: "041 545 36 79",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Peak Performance",
    storeNumber: "135",
    phone: "091 640 95 20",
    floor: 1,
    category: "Sportswear & Equipment",
  },
  {
    name: "Plein Sport",
    storeNumber: "232",
    phone: "091 646 80 75",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Puma",
    storeNumber: "245",
    phone: "091 630 27 01",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Rh+",
    storeNumber: "331",
    phone: "091 682 10 97",
    floor: 3,
    category: "Sportswear & Equipment",
  },
  {
    name: "Salomon",
    storeNumber: "255",
    phone: "091 646 77 44",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "The North Face",
    storeNumber: "235",
    phone: "091 646 23 09",
    floor: 2,
    category: "Sportswear & Equipment",
  },
  {
    name: "Vaude",
    storeNumber: "264",
    phone: "091 630 10 78",
    floor: 2,
    category: "Sportswear & Equipment",
  },

  // FOOTWEAR
  {
    name: "Baldinini",
    storeNumber: "249",
    phone: "091 630 28 30",
    floor: 2,
    category: "Footwear",
  },
  {
    name: "Bally",
    storeNumber: "305",
    phone: "091 646 73 45",
    floor: 3,
    category: "Footwear",
  },
  {
    name: "Church's",
    storeNumber: "323",
    phone: "091 640 60 20",
    floor: 3,
    category: "Footwear",
  },
  {
    name: "Clarks",
    storeNumber: "128",
    phone: "091 630 08 01",
    floor: 1,
    category: "Footwear",
  },
  {
    name: "Ecco",
    storeNumber: "238",
    phone: "091 646 08 88",
    floor: 2,
    category: "Footwear",
  },
  {
    name: "Fratelli Rossetti",
    storeNumber: "233",
    phone: "091 630 28 72",
    floor: 2,
    category: "Footwear",
  },
  {
    name: "Geox",
    storeNumber: "155",
    phone: "091 630 22 24",
    floor: 1,
    category: "Footwear",
  },
  {
    name: "Jimmy Choo",
    storeNumber: "206",
    phone: "091 646 18 20",
    floor: 2,
    category: "Footwear",
  },
  {
    name: "Pollini",
    storeNumber: "304",
    phone: "091 646 79 06",
    floor: 3,
    category: "Footwear",
  },
  {
    name: "Skechers",
    storeNumber: "228",
    phone: "091 646 01 60",
    floor: 2,
    category: "Footwear",
  },
  {
    name: "Tod's - Hogan",
    storeNumber: "309",
    phone: "091 646 92 15",
    floor: 3,
    category: "Footwear",
  },
  {
    name: "Ugg",
    storeNumber: "210",
    phone: "091 630 00 71",
    floor: 2,
    category: "Footwear",
  },
  {
    name: "Vans",
    storeNumber: "252",
    phone: "091 630 02 93",
    floor: 2,
    category: "Footwear",
  },

  // WATCHES & JEWELLERY
  {
    name: "Damiani",
    storeNumber: "303",
    phone: "091 630 15 95",
    floor: 3,
    category: "Watches & Jewellery",
  },
  {
    name: "Hour Passion",
    storeNumber: "317",
    phone: "091 646 14 44",
    floor: 3,
    category: "Watches & Jewellery",
  },
  {
    name: "Swarovski",
    storeNumber: "117",
    phone: "091 646 01 78",
    floor: 1,
    category: "Watches & Jewellery",
  },
  {
    name: "Swatch",
    storeNumber: "345",
    phone: "091 646 90 09",
    floor: 3,
    category: "Watches & Jewellery",
  },

  // ACCESSORIES
  {
    name: "Blitz for eyes",
    storeNumber: "116",
    phone: "091 630 01 30",
    floor: 1,
    category: "Accessories",
  },
  {
    name: "Bric's",
    storeNumber: "151",
    phone: "091 646 07 18",
    floor: 1,
    category: "Accessories",
  },
  {
    name: "Coccinelle",
    storeNumber: "310",
    phone: "091 630 00 24",
    floor: 3,
    category: "Accessories",
  },
  {
    name: "Freitag",
    storeNumber: "370",
    phone: "",
    floor: 3,
    category: "Accessories",
  },
  {
    name: "Mantero",
    storeNumber: "203",
    phone: "091 646 90 60",
    floor: 2,
    category: "Accessories",
  },
  {
    name: "Miriade",
    storeNumber: "253",
    phone: "091 640 95 43",
    floor: 2,
    category: "Accessories",
  },
  {
    name: "Samsonite",
    storeNumber: "204",
    phone: "091 630 21 70",
    floor: 2,
    category: "Accessories",
  },
  {
    name: "Belotti OtticaUdito",
    storeNumber: "387",
    phone: "091 646 30 31",
    floor: 3,
    category: "Accessories",
  },

  // ELECTRONICS
  {
    name: "Sbs",
    storeNumber: "127",
    phone: "091 646 08 05",
    floor: 1,
    category: "Electronics",
  },

  // BEAUTY
  {
    name: "Free Shop 1",
    storeNumber: "107",
    phone: "091 646 09 29",
    floor: 1,
    category: "Beauty",
  },
  {
    name: "Free Shop 2",
    storeNumber: "357",
    phone: "091 646 32 41",
    floor: 3,
    category: "Beauty",
  },
  {
    name: "Kiko Milano",
    storeNumber: "274",
    phone: "091 630 02 55",
    floor: 2,
    category: "Beauty",
  },

  // HOME
  {
    name: "Bassetti",
    storeNumber: "227",
    phone: "091 646 45 05",
    floor: 2,
    category: "Home",
    url: "https://www.bassetti.com/",
    logoUrl: "https://www.bassetti.com/assets/logo-1-2d907dae.png"

  },
  {
    name: "Christmas Store", // It was a temporary store for the 2025 Christmas season, from what I found
    storeNumber: "350",
    phone: "091 646 77 12",
    floor: 3,
    category: "Home"
  },
  {
    name: "Le Creuset",
    storeNumber: "010",
    phone: "091 646 83 37",
    floor: 0,
    category: "Home",
    url: "https://www.lecreuset.ch/",
    logoUrl: "https://www.lecreuset.ch/on/demandware.static/Sites-LCCH-Site/-/default/dwcbd62265/images/logo.svg"
  },
  {
    name: "Millefiori store",
    storeNumber: "152",
    phone: "091 646 77 12",
    floor: 1,
    category: "Home"
  },
  {
    name: "Villeroy & Boch",
    storeNumber: "220",
    phone: "091 630 26 20",
    floor: 2,
    category: "Home",
    url: "https://pwasf.villeroy-boch.ch/",
    logoUrl: "https://pwasf.villeroy-boch.ch/mobify/bundle/659/static/img/global/apple-touch-icon.png"

  },
  {
    name: "Wmf",
    storeNumber: "258",
    phone: "091 646 21 25",
    floor: 2,
    category: "Home",
    url: "https://www.wmf.com/ch/de/",
    logoUrl: "https://www.wmf.com/static/version1772117106/frontend/wmf/hyva/de_CH/images/logo.svg"

  },

  // CHILDRENSWEAR
  {
    name: "Brums",
    storeNumber: "153",
    phone: "",
    floor: 1,
    category: "Childrenswear",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2014.10.28.10.22.323142.jpg"
  },
  {
    name: "Harmont & Blaine Junior",
    storeNumber: "131",
    phone: "091 646 66 34",
    floor: 1,
    category: "Childrenswear",
    url: "https://www.harmontblaine.com",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2023-09-15-09-44-3174107.jpg"
  },
  {
    name: "Jacadi Paris",
    storeNumber: "358",
    phone: "091 646 38 88",
    floor: 3,
    category: "Childrenswear",
    url: "https://www.jacadi.fr/",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2023-03-16-08-45-0770848.jpg"
  },
  {
    name: "Kid Space",
    storeNumber: "222",
    phone: "091 646 80 62",
    floor: 2,
    category: "Childrenswear",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2014.10.28.10.23.067204.jpg"
  },
  {
    name: "Kid Space Collection",
    storeNumber: "133",
    phone: "091 646 20 62",
    floor: 1,
    category: "Childrenswear",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2025-11-11-12-48-5346315.jpg"
  },
  {
    name: "Simonetta",
    storeNumber: "332",
    phone: "091 646 38 13",
    floor: 3,
    category: "Childrenswear",
    url: "https://www.simonetta.it/",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2024-06-25-09-54-0382652.jpg"
  },

  // UNDERWEAR
  {
    name: "Calida",
    storeNumber: "134",
    phone: "091 630 23 45",
    floor: 1,
    category: "Underwear",
    url: "https://www.calida.com",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2014.10.28.10.22.328052.jpg"
  },
  {
    name: "Calzedonia - Intimissimi",
    storeNumber: "112",
    phone: "091 646 74 41",
    floor: 1,
    category: "Underwear",
    url: "https://www.intimissimi.com",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2014.10.28.10.23.046991.jpg"
  },
  {
    name: "Hanro",
    storeNumber: "224",
    phone: "091 630 09 94",
    floor: 2,
    category: "Underwear",
    url: "https://hanro.com/",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2019.05.02.02.51.455876.jpg"
  },
  {
    name: "Triumph",
    storeNumber: "148",
    phone: "091 646 37 02",
    floor: 1,
    category: "Underwear",
    url: "https://ch.triumph.com/",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2023-08-16-12-30-5270552.jpg"
  },
  {
    name: "Wolford",
    storeNumber: "347",
    phone: "091 630 10 27",
    floor: 3,
    category: "Underwear",
    url: "https://www.wolford.com",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2023-01-30-09-23-2173690.jpg"
  },

  // FOOD & DRINKS
  {
    name: "Chalet Suisse",
    storeNumber: "259",
    phone: "091 630 28 89",
    floor: 2,
    category: "Food & Drinks"
  },
  {
    name: "Fashion Bar",
    storeNumber: "234",
    phone: "091 646 12 43",
    floor: 2,
    category: "Food & Drinks"
  },
  {
    name: "Gelateria",
    storeNumber: "154",
    phone: "091 646 03 58",
    floor: 1,
    category: "Food & Drinks"
  },
  {
    name: "Il Caffè",
    storeNumber: "278",
    phone: "091 646 58 06",
    floor: 2,
    category: "Food & Drinks",
  },
  {
    name: "Lindt - Maître Chocolatier Suisse depuis 1845",
    storeNumber: "132",
    phone: "091 914 48 58",
    floor: 1,
    category: "Food & Drinks",
    url: "https://www.lindt.ch",
    logoUrl: "https://www.lindt.ch/static/version1771821936/frontend/Lseu/transactional/de_CH/images/logo.png"
  },
  {
    name: "Pizzeria",
    storeNumber: "137",
    phone: "091 630 27 81",
    floor: 1,
    category: "Food & Drinks"
  },
  {
    name: "Maui Poke",
    storeNumber: "169",
    phone: "091 222 99 01",
    floor: 1,
    category: "Food & Drinks",
    url: "https://mauipoke.ch/",
    logoUrl: "https://mauipoke.ch/wp-content/uploads/2022/02/maui_logo_w.svg"
  },
  {
    name: "The Place Asian",
    storeNumber: "121",
    phone: "091 646 03 58",
    floor: 1,
    category: "Food & Drinks"
  },
  {
    name: "The Place Juices",
    storeNumber: "154",
    phone: "091 646 03 58",
    floor: 1,
    category: "Food & Drinks"
  },
  {
    name: "The Place Sweet & Salt",
    storeNumber: "121",
    phone: "091 646 03 58",
    floor: 1,
    category: "Food & Drinks"
  },
  {
    name: "Wood Avenue - Italian Restaurant",
    storeNumber: "170",
    phone: "091 646 03 56",
    floor: 1,
    category: "Food & Drinks"
  },

  // SERVICES
  {
    name: "Casinò Admiral",
    storeNumber: "1011",
    phone: "091 640 50 20",
    floor: 1,
    category: "Services",
    url: "https://mendrisio.admiral.ch/",
    logoUrl: "https://mendrisio.admiral.ch/wp-content/uploads/2021/12/LOGO-MENDRISIO-900-300x169.png"
  },
  {
    name: "Cloakroom",
    storeNumber: "019",
    phone: "091 646 78 83",
    floor: 0,
    category: "Services"
  },
  {
    name: "Infopoint",
    storeNumber: "",
    phone: "0848 828 888",
    floor: 1,
    category: "Services"
  },
  {
    name: "Guest Services",
    storeNumber: "",
    phone: "091 630 08 03",
    floor: 1,
    category: "Services"
  },
  {
    name: "Planet Tax Refund Point",
    storeNumber: "120",
    phone: "091 630 00 61",
    floor: 1,
    category: "Services",
    url: "https://www.planetpayment.com/refund-locations?country=ch", 
    logoUrl: "https://www.planetpayment.com/resources/logo/planet_logo.svg"
  },
  {
    name: "Global Blue Tax Free Refund Point",
    storeNumber: "120",
    phone: "091 630 00 61",
    floor: 1,
    category: "Services",
    url: "https://www.globalblue.com/en",
    logoUrl: "https://www.globalblue.com/assets/svg/logo.svg"
  },
  {
    name: "Tailor's Store",
    storeNumber: "019",
    phone: "091 646 78 83",
    floor: 0,
    category: "Services"
  },
  {
    name: "The Sense Gallery",
    storeNumber: "166",
    phone: "091 610 99 63",
    floor: 1,
    category: "Services",
    url: "https://www.thesensegallery.com/en/homepage",
    logoUrl: "https://www.thesensegallery.com/upload/multimedia/2024/04/logo-the-sense-gallery.svg"
  },
  {
    name: "Tichange - Exchange Office",
    storeNumber: "120",
    phone: "091 630 00 61",
    floor: 1,
    category: "Services",
    url: "https://tichangegroup.ch/portfolio/startup-funding/", 
    logoUrl: "https://tichangegroup.ch/wp-content/uploads/2018/04/logotichangegroup-1-e1523453451277.png"
  },
  {
    name: "Vantaviaggi",
    storeNumber: "141",
    phone: "091 646 42 85",
    floor: 1,
    category: "Services",
    url: "https://www.vantaviaggi.com/",
    logoUrl: "https://www.vantaviaggi.com/imgcache/306_99b7ecc9462/1179_600_266_2945a9475b.png"
  },

  // TEMPORARY STORES
  {
    name: "Bally Temporary",
    storeNumber: "005",
    phone: "091 646 73 45",
    floor: 0,
    category: "Temporary Stores",
  },
  {
    name: "Boxeur Des Rues Temporary",
    storeNumber: "371",
    phone: "091 646 01 01",
    floor: 3,
    category: "Temporary Stores",
  },
  {
    name: "Odlo Temporary",
    storeNumber: "240",
    phone: "041 545 36 79",
    floor: 2,
    category: "Temporary Stores",
  },
  {
    name: "Timberland Temporary",
    storeNumber: "236",
    phone: "091 630 23 55",
    floor: 2,
    category: "Temporary Stores",
  },
];

async function main() {
  await prisma.gamePlay.deleteMany();
  await prisma.prize.deleteMany();
  await prisma.visitorLog.deleteMany();
  await prisma.shopImage.deleteMany();
  await prisma.shop.deleteMany();

  for (const store of stores) {
    await prisma.shop.create({
      data: {
        name: store.name,
        floor: store.floor,
        category: store.category,
        storeNumber: store.storeNumber,
        phone: store.phone,
        openingHours: "11:00-19:00",
        url: store.url ?? "",
        logoUrl: store.logoUrl ?? "",
      },
    });
  }
  console.log(`Seeded ${stores.length} shops`);

  const parkings = [
    { name: "Parking Nord", totalSpaces: 500, availableSpaces: 342 },
    { name: "Parking Sud", totalSpaces: 400, availableSpaces: 215 },
    { name: "Parking Est", totalSpaces: 300, availableSpaces: 178 },
    { name: "Parking Ouest", totalSpaces: 350, availableSpaces: 290 },
  ];

  for (const parking of parkings) {
    await prisma.parking.upsert({
      where: { name: parking.name },
      update: {
        totalSpaces: parking.totalSpaces,
        availableSpaces: parking.availableSpaces,
      },
      create: parking,
    });
  }
  console.log(`Seeded ${parkings.length} parkings`);

  const prizes = [
    {
      name: "Bon d'achat Nike 20 CHF",
      description: "Bon d'achat de 20 CHF chez Nike Factory Store",
      shopName: "Nike Factory Store",
    },
    {
      name: "Bon d'achat Lindt 10 CHF",
      description: "Bon d'achat de 10 CHF chez Lindt",
      shopName: "Lindt - Maître Chocolatier Suisse depuis 1845",
    },
    {
      name: "Bon d'achat Swatch 30 CHF",
      description: "Bon d'achat de 30 CHF chez Swatch",
      shopName: "Swatch",
    },
    {
      name: "Bon d'achat Puma 15 CHF",
      description: "Bon d'achat de 15 CHF chez Puma",
      shopName: "Puma",
    },
    {
      name: "Bon d'achat Geox 25 CHF",
      description: "Bon d'achat de 25 CHF chez Geox",
      shopName: "Geox",
    },
  ];

  for (const prize of prizes) {
    await prisma.prize.create({
      data: { ...prize, quantity: 10, claimed: 0, active: true },
    });
  }
  console.log(`Seeded ${prizes.length} prizes`);

  const TOTAL_VISITORS = 100_000;
  const BATCH_SIZE = 1000;
  const now = Date.now();
  const TWELVE_MONTHS = 365 * 24 * 60 * 60 * 1000;
  const paths = ["/", "/boutiques", "/plan", "/parkings", "/login"];

  for (let i = 0; i < TOTAL_VISITORS; i += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, TOTAL_VISITORS - i) },
      () => {
        const randomPath = paths[Math.floor(Math.random() * paths.length)];
        return {
          visitedAt: new Date(now - Math.random() * TWELVE_MONTHS),
          path: randomPath ?? "/",
        };
      },
    );
    await prisma.visitorLog.createMany({ data: batch });
  }
  console.log(`Seeded ${TOTAL_VISITORS.toLocaleString()} visitor logs`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { passwordHash, role: Role.ADMIN },
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`Admin user seeded: ${adminEmail}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
