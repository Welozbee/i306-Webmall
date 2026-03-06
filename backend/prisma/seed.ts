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
    url: "https://www.armani.com/",
    logoUrl: "https://logo.com/image-cdn/images/kts928pd/production/91b306f0fe09a3f6b80edbaa4f1179d510534f7e-1104x632.png?w=1920&q=72&fm=webp",
  },
  {
    name: "Borbonese",
    storeNumber: "244",
    phone: "091 646 26 60",
    floor: 2,
    category: "High Fashion",
    url: "https://www.borbonese.com/",
    logoUrl: "https://www.borbonese.com/cdn/shop/files/borbonese-logo_800x.png?v=1684847804",
  },
  {
    name: "Boss",
    storeNumber: "326",
    phone: "091 630 26 40",
    floor: 3,
    category: "High Fashion",
    url: "https://www.hugoboss.com/",
    logoUrl: "https://brandpulse.ch/wp-content/uploads/2021/08/Work_Case_HB.jpg",
  },
  {
    name: "Burberry",
    storeNumber: "343",
    phone: "044 588 99 62",
    floor: 3,
    category: "High Fashion",
    url: "https://www.burberry.com/",
    logoUrl: "https://static.vecteezy.com/system/resources/thumbnails/014/414/693/small/burberry-old-logo-on-transparent-background-free-vector.jpg",
  },
  {
    name: "Coach",
    storeNumber: "201",
    phone: "091 646 01 86",
    floor: 2,
    category: "High Fashion",
    url: "https://www.coach.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPDSukeGHpl4-5mvFqPHG9gqoNL-VVk9TQNw&s",
  },
  {
    name: "Corneliani",
    storeNumber: "306",
    phone: "091 630 01 47",
    floor: 3,
    category: "High Fashion",
    url: "https://www.corneliani.com/",
    logoUrl: "https://srs.nl/wp-content/uploads/2017/09/Corneliani-logo.jpg",
  },
  {
    name: "Dolce & Gabbana",
    storeNumber: "339",
    phone: "091 630 29 90",
    floor: 3,
    category: "High Fashion",
    url: "https://www.dolcegabbana.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0M2gkNxGLekBlaOP6Qoxz00DlCrOvfSKm1A&s",
  },
  {
    name: "Dsquared2",
    storeNumber: "160",
    phone: "091 646 35 36",
    floor: 1,
    category: "High Fashion",
    url: "https://www.dsquared2.com/",
    logoUrl: "https://1000logos.net/wp-content/uploads/2022/07/Dsquared2-logo.jpg",
  },
  {
    name: "Etro",
    storeNumber: "315",
    phone: "091 646 34 15",
    floor: 3,
    category: "High Fashion",
    url: "https://www.etro.com/",
    logoUrl: "https://www.soulery.com/img/m/127.jpg",
  },
  {
    name: "Fay",
    storeNumber: "309",
    phone: "091 646 92 15",
    floor: 3,
    category: "High Fashion",
    url: "https://www.fay.com/",
    logoUrl: "https://www.fay.com/static/assets/images/favicon/favicon-196x196.png",
  },
  {
    name: "Furla",
    storeNumber: "316",
    phone: "091 646 36 01",
    floor: 3,
    category: "High Fashion",
    url: "https://www.furla.com/",
    logoUrl: "https://www.journalduluxe.fr/files/resize/outside/875-875-furla-logo_118bace5eed472b9dd55c91c57da7264.jpeg",
  },
  {
    name: "John Richmond",
    storeNumber: "342",
    phone: "091 630 29 33",
    floor: 3,
    category: "High Fashion",
    url: "https://www.johnrichmond.com/",
    logoUrl: "https://thumbs.dreamstime.com/b/vector-logos-collection-most-famous-fashion-brands-world-format-available-illustrator-ai-john-richmond-logo-132135838.jpg",
  },
  {
    name: "Kate Spade New York",
    storeNumber: "327",
    phone: "091 646 77 67",
    floor: 3,
    category: "High Fashion",
    url: "https://www.katespade.com/",
    logoUrl: "https://media.designrush.com/inspiration_images/136117/conversions/_1513770727_402_kate_spade1_365b00401e4f-preview.jpg",
  },
  {
    name: "Kiton",
    storeNumber: "311",
    phone: "091 683 02 02",
    floor: 3,
    category: "High Fashion",
    url: "https://www.kiton.it/",
    logoUrl: "https://thumbs.dreamstime.com/b/logo-de-kiton-120007071.jpg",
  },
  {
    name: "Longchamp",
    storeNumber: "322",
    phone: "091 600 35 30",
    floor: 3,
    category: "High Fashion",
    url: "https://www.longchamp.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOtSV3XAeSRiALPKzyYWDyuhlnVO6DYUUmMQ&s",
  },
  {
    name: "Loro Piana",
    storeNumber: "330",
    phone: "091 640 99 30",
    floor: 3,
    category: "High Fashion",
    url: "https://www.loropiana.com/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Loro_Piana_logo.png",
  },
  {
    name: "Michael Kors",
    storeNumber: "214",
    phone: "091 646 81 00",
    floor: 2,
    category: "High Fashion",
    url: "https://www.michaelkors.com/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/32/Michael_Kors_%28brand%29_logo.svg/960px-Michael_Kors_%28brand%29_logo.svg.png",
  },
  {
    name: "Missoni",
    storeNumber: "314",
    phone: "091 646 74 19",
    floor: 3,
    category: "High Fashion",
    url: "https://www.missoni.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy_YGJjB78ni5LhHYFbBuqsJTXh7xx3q6c1A&s",
  },
  {
    name: "Off-White",
    storeNumber: "325",
    phone: "091 646 33 90",
    floor: 3,
    category: "High Fashion",
    url: "https://www.off---white.com/",
    logoUrl: "https://1000logos.net/wp-content/uploads/2019/06/Off-White-Logo.jpg",
  },
  {
    name: "Patrizia Pepe",
    storeNumber: "372",
    phone: "091 640 08 11",
    floor: 3,
    category: "High Fashion",
    url: "https://www.patriziapepe.com/",
    logoUrl: "https://pringo.it/wp-content/uploads/2024/12/Patrizia-Pepe-logo-1000x500-1.jpg",
  },
  {
    name: "Philipp Plein Men",
    storeNumber: "158",
    phone: "091 646 24 08",
    floor: 1,
    category: "High Fashion",
    url: "https://www.pleinoutlet.com/",
    logoUrl: "https://thumbs.dreamstime.com/b/philipp-plein-logo-120566665.jpg",
  },
  {
    name: "Philipp Plein Women",
    storeNumber: "157",
    phone: "091 646 24 08",
    floor: 1,
    category: "High Fashion",
    url: "https://www.pleinoutlet.com/",
    logoUrl: "https://thumbs.dreamstime.com/b/philipp-plein-logo-120566665.jpg",
  },
  {
    name: "Prada",
    storeNumber: "312",
    phone: "091 986 64 40",
    floor: 3,
    category: "High Fashion",
    url: "https://www.prada.com/",
    logoUrl: "https://1000logos.net/wp-content/uploads/2017/05/Prada-Logo.png",
  },
  {
    name: "Salvatore Ferragamo",
    storeNumber: "106",
    phone: "091 630 05 90",
    floor: 1,
    category: "High Fashion",
    url: "https://www.ferragamo.com/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Salvatore_Ferragamo_logo.png",
  },
  {
    name: "Versace",
    storeNumber: "301",
    phone: "091 646 74 74",
    floor: 3,
    category: "High Fashion",
    url: "https://www.versace.com/",
    logoUrl: "https://images.seeklogo.com/logo-png/14/1/versace-medusa-logo-png_seeklogo-148376.png",
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
    url: "https://elmasphil.it/",
    logoUrl: "https://elmasphil.it/wp-content/uploads/2024/04/Elmas-Phil.png",
  },
  {
    name: "Elmas Phil Collection",
    storeNumber: "356",
    phone: "091 220 84 53",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://elmasphil.it/",
    logoUrl: "https://elmasphil.it/wp-content/uploads/2024/04/Elmas-Phil.png",
  },
  {
    name: "Elmas Phil Uomo",
    storeNumber: "349",
    phone: "091 220 84 53",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://elmasphil.it/collezioni/collezioni-lui/",
    logoUrl: "https://elmasphil.it/wp-content/uploads/2024/04/Elmas-Phil.png",
  },
  {
    name: "Falke",
    storeNumber: "354",
    phone: "091 646 83 88",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.falke.com/",
    logoUrl: "https://www.falke.com/ch_fr/fecd7566c6d9c31f6598ced3a7a9fcb05246002e/assets/base/staticImages/falke_germany_1895_logo.svg",
  },
  {
    name: "Fiorella Rubino",
    storeNumber: "226",
    phone: "091 224 48 62",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.fiorellarubino.it/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa1i1ZXSer0pIqbbanbC1m2_J69jguO16DOA&s",
  },
  {
    name: "Flavio Castellani",
    storeNumber: "337",
    phone: "091 646 48 48",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://flaviocastellani.it/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPPQtCpbpzZoy1OWyTiapyYdm9EzdPMhnu-A&s",
  },
  {
    name: "Hackett London",
    storeNumber: "215",
    phone: "091 630 03 29",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.hackett.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQerrhzDuToKoENJuyEWKpJTs8ubXI1e3RDJQ&s",
  },
  {
    name: "Human Couture",
    storeNumber: "275",
    phone: "091 646 36 53",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://human-couture.com/en/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStW-KFRBRGNnV2R9azPzgRWPbI8pliRV7Lww&s",
  },
  {
    name: "Il Lanificio",
    storeNumber: "231",
    phone: "091 630 23 10",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.illanificio.com/fr",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiKYHr-23PgZGDl6a5G9DC8tzgrZbf2YGc5A&s",
  },
  {
    name: "Jerem",
    storeNumber: "115",
    phone: "091 646 01 10",
    floor: 1,
    category: "Ladies & Menswear",
    url: "https://www.jerem.com/fr/",
    logoUrl: "https://www.jerem.com/img/jeremcom-logo-1650012659.jpg",
  },
  {
    name: "Maje",
    storeNumber: "366",
    phone: "091 630 01 46",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.maje.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfd38XQah3gh8ySOahzpmvB4fKBCbsADyDqA&s",
  },
  {
    name: "Marc O'Polo",
    storeNumber: "373",
    phone: "091 252 00 01",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.marcopolocom/",
    logoUrl: "https://www.a6-fashionplace.de/wp-content/uploads/2023/10/A6_fashion-place_store_Marc_Opolo_quadrat.png",
  },
  {
    name: "Modesto Bertotto",
    storeNumber: "230",
    phone: "091 646 06 25",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.modestobertotto.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn_dkvgteeu6qnRJiDkNl4Mfhs9y3G_SEcdA&s",
  },
  {
    name: "Moorer",
    storeNumber: "336",
    phone: "091 640 95 56",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.moorer.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZCJ-SV9dDG_vJ7gDvXAtb5jjpuWwpxZoAig&s",
  },
  {
    name: "Morgan",
    storeNumber: "276",
    phone: "091 646 77 52",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.morgan.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4hNpqz4SLc3B62fVuMTIJFybaNrh8YUITiQ&s",
  },
  {
    name: "Motivi",
    storeNumber: "150",
    phone: "091 630 28 45",
    floor: 1,
    category: "Ladies & Menswear",
    url: "https://www.motivi.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIKbQxiVl-usBX7behOG7wH36uobPnjdOsmQ&s",
  },
  {
    name: "Paul & Shark",
    storeNumber: "300",
    phone: "091 646 00 67",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.paulandshark.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVLkYu8zun7sbOHK5hAWXXxS-jrzPvcKyANA&s",
  },
  {
    name: "Peuterey",
    storeNumber: "319",
    phone: "091 646 36 56",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.peuterey.com/",
    logoUrl: "https://cdn2.peuterey.com.filoblu.com/static/version1772106190126/img/logo_lg.svg",
  },
  {
    name: "Pinko",
    storeNumber: "338",
    phone: "091 630 22 16",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.pinko.it/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaqFYylkLgz6CBBSZGlkD2gg0foJU-tJ6IEQ&s",
  },
  {
    name: "Polo Ralph Lauren",
    storeNumber: "108",
    phone: "091 641 30 10",
    floor: 1,
    category: "Ladies & Menswear",
    url: "https://www.ralphlauren.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM_TnlcykUPYbWI1v5tf7uqmuQHo_L4eMFmQ&s",
  },
  {
    name: "Sandro",
    storeNumber: "388",
    phone: "091 260 08 64",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.sandro-paris.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYeCKoC6vvKt3KmvbC5anemsCAj782OmD7Bw&s",
  },
  {
    name: "Trussardi",
    storeNumber: "248",
    phone: "091 225 63 23",
    floor: 2,
    category: "Ladies & Menswear",
    url: "https://www.trussardi.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYA-1LHJkq0emoczsqEi6BQnnso2cs89peuw&s",
  },
  {
    name: "Vero Moda",
    storeNumber: "139",
    phone: "091 646 31 35",
    floor: 1,
    category: "Ladies & Menswear",
    url: "https://www.veromoda.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1NcR4EpcslWUtMzMQFnsSEG29aLVw-Dc42Q&s",
  },
  {
    name: "Woolrich",
    storeNumber: "352",
    phone: "091 646 01 81",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.woolrich.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHC9MPVsQSAEUlgqiXoPJ4J9kJRWSRx8TUKw&s",
  },
  {
    name: "Zadig & Voltaire",
    storeNumber: "363",
    phone: "091 646 28 32",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.zadig-et-voltaire.com/",
    logoUrl: "https://www.zegg.ch/ZEGG%20Stores/Parfum_Kosmetik/Logos/image-thumb__9134__og-image/Zadig%20%26%20Voltaire.webp",
  },
  {
    name: "Gaudì",
    storeNumber: "364",
    phone: "091 646 87 44",
    floor: 3,
    category: "Ladies & Menswear",
    url: "https://www.gaudiofficial.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK9rlsqauDt7qYuCNB1IBkD_Xazun0LiYQUw&s",
  },

  // CASUALWEAR
  {
    name: "Aeronautica Militare",
    storeNumber: "243",
    phone: "091 971 60 00",
    floor: 2,
    category: "Casualwear",
    url: "https://www.aeronauticamilitareofficialstore.it/eu-it/",
    logoUrl: "https://www.aeronauticamilitareofficialstore.it/static/version1769071264/frontend/Alpenite/cristianodithiene/it_IT/images/misc/logo-color.svg",
  },
  {
    name: "Boxeur Des Rues - Malloy",
    storeNumber: "225",
    phone: "091 646 01 01",
    floor: 2,
    category: "Casualwear",
    url: "https://www.boxeurdesrues.com",
    logoUrl: "https://www.boxeurdesrues.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.6e142397.png&w=1920&q=75",
  },
  {
    name: "Calvin Klein",
    storeNumber: "247",
    phone: "091 646 02 50",
    floor: 2,
    category: "Casualwear",
    url: "https://www.calvinklein.ch/FR?cmpid=ch:cpc|so:google|ca:calvin%20klein|cr:610466218982|lb:17745293644|ag:134076671650|pi:kwd-11661971&gclsrc=aw.ds&&utm_source=google&utm_medium=cpc&utm_campaign=17745293644&utm_id=17745293644&utm_term=calvin%20klein&utm_content=134076671650&utm_source_platform=g&gad_source=1&gad_campaignid=17745293644&gclid=CjwKCAiAzZ_NBhAEEiwAMtqKy67dePePPCj5cgfFR-f2D2oW77omP1RRWYsGnGfhImWfCkQXgH3CdBoCzCMQAvD_BwE",
    logoUrl: "https://static.vecteezy.com/system/resources/thumbnails/023/400/513/small/calvin-klein-brand-clothes-logo-symbol-design-fashion-illustration-with-black-background-free-vector.jpg",
  },
  {
    name: "C.P. Company",
    storeNumber: "212",
    phone: "091 646 02 21",
    floor: 2,
    category: "Casualwear",
    url: "https://www.cpcompany.com/en-ch/",
    logoUrl: "https://www.cpcompany.com/dw/image/v2/BDWM_PRD/on/demandware.static/-/Library-Sites-CPCompanyLibrary/default/dw9e00be0f/images/header/hero/RD%20DESK%202.jpg?sw=1920",
  },
  {
    name: "Diesel Factory Outlet",
    storeNumber: "113",
    phone: "091 646 02 46",
    floor: 1,
    category: "Casualwear",
    url: "https://ch.diesel.com/fr/stores",
    logoUrl: "https://marketingportal.viaoutlets.com/m/5895e9d3349094c3/webimage-DIESEL-LOGO-svg.jpg",
  },
  {
    name: "Gant",
    storeNumber: "145",
    phone: "091 646 50 22",
    floor: 1,
    category: "Casualwear",
    url: "https://www.gant.ch/",
    logoUrl: "https://www.terracity.com.tr/fileadmin/user_upload/GLOBAL/brand_stores/logos/gant.jpg",
  },
  {
    name: "Guess 1",
    storeNumber: "241",
    phone: "091 630 26 50",
    floor: 2,
    category: "Casualwear",
    url: "",
    logoUrl: "",
  },
  {
    name: "Guess 2",
    storeNumber: "269",
    phone: "091 646 87 01",
    floor: 2,
    category: "Casualwear",
    url: "",
    logoUrl: "",
  },
  {
    name: "Harmont & Blaine",
    storeNumber: "216",
    phone: "091 646 03 55",
    floor: 2,
    category: "Casualwear",
    url: "https://www.harmontblaine.com/ch/fr/",
    logoUrl: "https://www.harmontblaine.com/on/demandware.static/Sites-harmont_and_blaine-Site/-/default/dw134a9573/images/HB_LOGO.png",
  },
  {
    name: "Jack & Jones",
    storeNumber: "143",
    phone: "091 630 00 04",
    floor: 1,
    category: "Casualwear",
    url: "https://www.jackjones.com/fr-ch",
    logoUrl: "https://www.viamoda.ad/wp-content/uploads/2020/04/Logo-Jack-And-Jones.jpg",
  },
  {
    name: "K·Way",
    storeNumber: "130",
    phone: "091 609 10 00",
    floor: 1,
    category: "Casualwear",
    url: "https://www.k-way.com/it",
    logoUrl: "https://www.k-way.com/cdn/shop/files/color_IT.png?v=1644416244&width=280",
  },
  {
    name: "La Martina",
    storeNumber: "114",
    phone: "091 646 54 35",
    floor: 1,
    category: "Casualwear",
    url: "https://lamartina.com/fr-ch",
    logoUrl: "https://lamartina.com/cdn/shop/files/logo_white.svg?v=1712221281&width=313",
  },
  {
    name: "Lacoste",
    storeNumber: "129",
    phone: "091 646 11 24",
    floor: 1,
    category: "Casualwear",
    url: "https://www.lacoste.com",
    logoUrl: "https://logos-world.net/wp-content/uploads/2020/09/Lacoste-Logo.png",
  },
  {
    name: "Lee - Wrangler",
    storeNumber: "219",
    phone: "091 646 01 01",
    floor: 2,
    category: "Casualwear",
    url: "https://eu.wrangler.com/fr-fr/home",
    logoUrl: "https://marketingportal.viaoutlets.com/m/1d14a6f4d00733f5/webimage-Lee_Wrangler_schwarz-svg.jpg",
  },
  {
    name: "Levi's & Dockers",
    storeNumber: "146",
    phone: "091 630 29 85",
    floor: 1,
    category: "Casualwear",
    url: "https://eu.dockers.com/fr",
    logoUrl: "https://wp.logos-download.com/wp-content/uploads/2019/11/Levi%E2%80%99s_Dockers_Logo.png?dl",
  },
  {
    name: "Napapijri",
    storeNumber: "353",
    phone: "091 646 74 83",
    floor: 3,
    category: "Casualwear",
    url: "https://www.napapijri.com/fr-ch",
    logoUrl: "https://www.napapijri.com/cdn/shop/files/Napapijri_Logo_Hi-Res.svg?v=1747432927&width=200",
  },
  {
    name: "Only",
    storeNumber: "171",
    phone: "091 646 23 35",
    floor: 1,
    category: "Casualwear",
    url: "https://www.only.com/fr-ch",
    logoUrl: "https://images.only.com/media/keelxfa1/only-logo.jpg",
  },
  {
    name: "Pepe Jeans",
    storeNumber: "251",
    phone: "091 630 03 27",
    floor: 2,
    category: "Casualwear",
    url: "https://www.jeans.ch/fr/marques/pepe-jeans-shop",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS95W3zOngsrCqffZ26CRqojpPCEMvaw0ZMxw&s",
  },
  {
    name: "Quiksilver",
    storeNumber: "142",
    phone: "091 646 82 33",
    floor: 1,
    category: "Casualwear",
    url: "https://www.quiksilver.ch/herrenbekleidung",
    logoUrl: "https://res.cloudinary.com/ekoweb/image/upload/v1761903117/premium/quiksilver/logo-bma-Quiksilver-noir_gkjivk.png",
  },
  {
    name: "Replay",
    storeNumber: "221",
    phone: "091 630 27 14",
    floor: 2,
    category: "Casualwear",
    url: "https://www.replayjeans.com/ch",
    logoUrl: "https://www.replayjeans.com/ch/static/version1772439979/frontend/Syncitgroup/replay/default/images/replay-logo.svg",
  },
  {
    name: "Timberland",
    storeNumber: "261",
    phone: "091 630 23 55",
    floor: 2,
    category: "Casualwear",
    url: "https://www.timberland.com/en-ch",
    logoUrl: "https://cdn.freebiesupply.com/logos/large/2x/timberland-1-logo-black-and-white.png",
  },
  {
    name: "Tommy Hilfiger",
    storeNumber: "242",
    phone: "091 630 20 54",
    floor: 2,
    category: "Casualwear",
    url: "https://ch.tommy.com",
    logoUrl: "https://static.vecteezy.com/system/resources/previews/071/985/796/non_2x/tommy-hilfiger-logo-set-top-clothing-brand-editorial-logotype-free-vector.jpg",
  },

  // SPORTSWEAR & EQUIPMENT
  {
    name: "Aventurx",
    storeNumber: "263",
    phone: "091 646 24 90",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://aventurx.ch/fr",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_XUjYrDrnmr5LUh_R6hOhSmdb92QbfdQSTQ&s",
  },
  {
    name: "Cmp",
    storeNumber: "257",
    phone: "091 630 06 06",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.cmp.it/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3hEpZ0a4n3G4xxaLQjoxm75aKs0u0ALjVHg&s",
  },
  {
    name: "Freddy",
    storeNumber: "013",
    phone: "091 646 32 22",
    floor: 0,
    category: "Sportswear & Equipment",
    url: "https://www.freddy.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa96SVrADtQ_n4YSKfA2_dmMfX6aMLjNqIag&s",
  },
  {
    name: "Icebreaker",
    storeNumber: "237",
    phone: "091 600 00 95",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.icebreaker.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsQOEu7c13SrEQTxSFj_jC1BEzxhJPUxZ-Zw&s",
  },
  {
    name: "Jaked",
    storeNumber: "164",
    phone: "091 646 42 76",
    floor: 1,
    category: "Sportswear & Equipment",
    url: "https://www.jaked.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ3BEW_xfJ3bvaXSlMtmNWEOjhRVl8R-2EkQ&s",
  },
  {
    name: "Mammut",
    storeNumber: "254",
    phone: "091 630 12 44",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.mammut.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYRAXmAjnkce09mZaoOf9mqtlwm8wgJwnO-Q&s",
  },
  {
    name: "New Balance",
    storeNumber: "256",
    phone: "091 646 11 01",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.newbalance.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK32h1hKG45n2RBPSqx8cnwXaLHZb3fxgxAQ&s",
  },
  {
    name: "Nike Factory Store",
    storeNumber: "111",
    phone: "091 640 40 60",
    floor: 1,
    category: "Sportswear & Equipment",
    url: "https://www.nike.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKM6jKfVroDEm-CtDCbtffRI659QdTJn1sxg&s",
  },
  {
    name: "Oakley",
    storeNumber: "213",
    phone: "091 646 49 50",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.oakley.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqfF1vcVkGm0B4oUVnjYJ7cWaCus_PfkTPnA&s",
  },
  {
    name: "Odlo",
    storeNumber: "246",
    phone: "041 545 36 79",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.odlo.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGHNg_8PkaxQN-EeBh0rXIhnVgRhuPVV6s9A&s",
  },
  {
    name: "Peak Performance",
    storeNumber: "135",
    phone: "091 640 95 20",
    floor: 1,
    category: "Sportswear & Equipment",
    url: "https://www.peakperformance.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl16423PUeOn7qwrM02WIuNyoQXb5WBJRAPw&s",
  },
  {
    name: "Plein Sport",
    storeNumber: "232",
    phone: "091 646 80 75",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.pleinsport.com/",
    logoUrl: "https://1000logos.net/wp-content/uploads/2020/01/Plein-Sport-Logo.jpg",
  },
  {
    name: "Puma",
    storeNumber: "245",
    phone: "091 630 27 01",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.puma.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWvHwr0e8_720Om847vN_Q7bGKWLTcw6TSxQ&s",
  },
  {
    name: "Rh+",
    storeNumber: "331",
    phone: "091 682 10 97",
    floor: 3,
    category: "Sportswear & Equipment",
    url: "https://rhthelookofsport.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmHfvsvrwxcde5EyF4uODcFQM11rbcpo4TgA&s",
  },
  {
    name: "Salomon",
    storeNumber: "255",
    phone: "091 646 77 44",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.salomon.com/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Salomon_group_logo.png",
  },
  {
    name: "The North Face",
    storeNumber: "235",
    phone: "091 646 23 09",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.thenorthface.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtFCyg7uk4HsDddXfuFYZvNYdvA_9xq65cFQ&s",
  },
  {
    name: "Vaude",
    storeNumber: "264",
    phone: "091 630 10 78",
    floor: 2,
    category: "Sportswear & Equipment",
    url: "https://www.vaude.com/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Vaude.svg/3840px-Vaude.svg.png",
  },

  // FOOTWEAR
  {
    name: "Baldinini",
    storeNumber: "249",
    phone: "091 630 28 30",
    floor: 2,
    category: "Footwear",
    url: "https://www.baldinini-shop.com",
    logoUrl: "https://www.mcarthurglen.com/globalassets-v12/01-brands/baldinini/assets/baldinini-brand-logo-1080x1080-recuperato.png",
  },
  {
    name: "Bally",
    storeNumber: "305",
    phone: "091 646 73 45",
    floor: 3,
    category: "Footwear",
    url: "https://www.bally.com/fr-ch",
    logoUrl: "https://www.bally.com/cdn/shop/files/Bally_Logo_Light.svg?v=1739290843&width=100",
  },
  {
    name: "Church's",
    storeNumber: "323",
    phone: "091 640 60 20",
    floor: 3,
    category: "Footwear",
    url: "https://www.church-footwear.com/eu/en.html",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb6Xc1yB48LgwXB7uwlFfOoimHZ_QfHvDd8w&s",
  },
  {
    name: "Clarks",
    storeNumber: "128",
    phone: "091 630 08 01",
    floor: 1,
    category: "Footwear",
    url: "https://www.clarks.com/fr-ch",
    logoUrl: "https://clarks.a.bigcontent.io/v1/static/ClarksLogo_Update",
  },
  {
    name: "Ecco",
    storeNumber: "238",
    phone: "091 646 08 88",
    floor: 2,
    category: "Footwear",
    url: "https://ch.ecco.com/fr-CH",
    logoUrl: "https://1000logos.net/wp-content/uploads/2021/05/ECCO-logo.png",
  },
  {
    name: "Fratelli Rossetti",
    storeNumber: "233",
    phone: "091 630 28 72",
    floor: 2,
    category: "Footwear",
    url: "https://fratellirossetti.com",
    logoUrl: "https://fratellirossetti.com/cdn/shop/files/logo.png?v=1691683003&width=700",
  },
  {
    name: "Geox",
    storeNumber: "155",
    phone: "091 630 22 24",
    floor: 1,
    category: "Footwear",
    url: "https://www.geox.com",
    logoUrl: "https://www.geox.com/on/demandware.static/Sites-xcom-dach-Site/-/default/dw747c7f91/images/Geox-Logo.svg",
  },
  {
    name: "Jimmy Choo",
    storeNumber: "206",
    phone: "091 646 18 20",
    floor: 2,
    category: "Footwear",
    url: "https://row.jimmychoo.com/en/home",
    logoUrl: "https://1000logos.net/wp-content/uploads/2022/07/Jimmy-Choo-Logo-1996.png",
  },
  {
    name: "Pollini",
    storeNumber: "304",
    phone: "091 646 79 06",
    floor: 3,
    category: "Footwear",
    url: "https://www.pollini.com/en",
    logoUrl: "https://iconape.com/wp-content/files/cw/202013/png/202013.png",
  },
  {
    name: "Skechers",
    storeNumber: "228",
    phone: "091 646 01 60",
    floor: 2,
    category: "Footwear",
    url: "https://www.skechers.ch/fr",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9TEyNeOs7cWn2QPTZveAmVMJJ6Z0rauKu_g&s",
  },
  {
    name: "Tod's - Hogan",
    storeNumber: "309",
    phone: "091 646 92 15",
    floor: 3,
    category: "Footwear",
    url: "https://www.hogan.com/ch-fr/home/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyW4-g0384_IGQFKbvMQ2AeUN58divn-lo5A&s",
  },
  {
    name: "Ugg",
    storeNumber: "210",
    phone: "091 630 00 71",
    floor: 2,
    category: "Footwear",
    url: "https://www.ugg.com/eu/fr/fr/",
    logoUrl: "https://1000logos.net/wp-content/uploads/2017/07/UGG-logo.png",
  },
  {
    name: "Vans",
    storeNumber: "252",
    phone: "091 630 02 93",
    floor: 2,
    category: "Footwear",
    url: "https://www.vans.com/fr-ch",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8m-JqF5NhyIfRW87_MpwfAd5W39j4bl0iUg&s",
  },

  // WATCHES & JEWELLERY
  {
    name: "Damiani",
    storeNumber: "303",
    phone: "091 630 15 95",
    floor: 3,
    category: "Watches & Jewellery",
    url: "https://www.damiani.com/fr_ch",
    logoUrl: "https://images.seeklogo.com/logo-png/32/1/damiani-logo-png_seeklogo-321338.png",
  },
  {
    name: "Hour Passion",
    storeNumber: "317",
    phone: "091 646 14 44",
    floor: 3,
    category: "Watches & Jewellery",
    url: "https://www.hourpassion.com/fr",
    logoUrl: "https://upload.wikimedia.org/wikipedia/fr/5/5a/HourPassion-logo.jpeghttps://www.damiani.com/fr_ch",
  },
  {
    name: "Swarovski",
    storeNumber: "117",
    phone: "091 646 01 78",
    floor: 1,
    category: "Watches & Jewellery",
    url: "https://www.swarovski.com/fr-CH/",
    logoUrl: "https://www.swarovski.com/_ui/responsive/theme-swarovski/images/icons/swa-brandlogo-icon.svg",
  },
  {
    name: "Swatch",
    storeNumber: "345",
    phone: "091 646 90 09",
    floor: 3,
    category: "Watches & Jewellery",
    url: "https://www.swatch.com/fr-ch/",
    logoUrl: "https://1000logos.net/wp-content/uploads/2017/06/Swatch-Logo.png",
  },

  // ACCESSORIES
  {
    name: "Blitz for eyes",
    storeNumber: "116",
    phone: "091 630 01 30",
    floor: 1,
    category: "Accessories",
    url: "https://www.blitzforeyes.ch/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk1YaBmUKAcWNT2I3Q3QW9TkW3EPhDJoUz1w&s",
  },
  {
    name: "Bric's",
    storeNumber: "151",
    phone: "091 646 07 18",
    floor: 1,
    category: "Accessories",
    url: "https://www.brics.it/",
    logoUrl: "https://bricstore.com/cdn/shop/files/brics-logo-blue_174bd011-3a64-4234-a187-cf6d0fab671c.png?crop=center&height=1200&v=1719231953&width=1200",
  },
  {
    name: "Coccinelle",
    storeNumber: "310",
    phone: "091 630 00 24",
    floor: 3,
    category: "Accessories",
    url: "https://www.coccinelle.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyeHcRjJ3aFbplf6oYM1V990ibklEHnwjKEw&s",
  },
  {
    name: "Freitag",
    storeNumber: "370",
    phone: "",
    floor: 3,
    category: "Accessories",
    url: "https://www.freitag.ch/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPOGtxkE1GhmdAa_sNgoJ258CO6D8g8T8BFw&s",
  },
  {
    name: "Mantero",
    storeNumber: "203",
    phone: "091 646 90 60",
    floor: 2,
    category: "Accessories",
    url: "https://www.mantero.ch/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtLLs0-c_Tw7ajWl0OG_kmx3hH1GMl6mNHXg&s",
  },
  {
    name: "Miriade",
    storeNumber: "253",
    phone: "091 640 95 43",
    floor: 2,
    category: "Accessories",
    url: "https://miriade.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr0GDjVQ76cTsXSdMSYSvT3iTq6sqYhlUmIQ&s",
  },
  {
    name: "Samsonite",
    storeNumber: "204",
    phone: "091 630 21 70",
    floor: 2,
    category: "Accessories",
    url: "https://www.samsonite.com/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf9-3cKv2dFbhnwHa4FgeAIAwmMUiijFJUgQ&s",
  },
  {
    name: "Belotti OtticaUdito",
    storeNumber: "387",
    phone: "091 646 30 31",
    floor: 3,
    category: "Accessories",
    url: "https://www.belottiotticaudito.ch/",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0c_t-0mUlLrXa_xWQBDLfd0oWl3vACPgw5w&s",
  },

  // ELECTRONICS
  {
    name: "Sbs",
    storeNumber: "127",
    phone: "091 646 08 05",
    floor: 1,
    category: "Electronics",
    url: "https://www.sbsmobile.com",
    logoUrl: "https://www.sbsmobile.com/cdn/shop/files/logo_sbs_nero.png?v=1738324531&width=170",
  },

  // BEAUTY
  {
    name: "Free Shop 1",
    storeNumber: "107",
    phone: "091 646 09 29",
    floor: 1,
    category: "Beauty",
    url: "",
    logoUrl: "",
  },
  {
    name: "Free Shop 2",
    storeNumber: "357",
    phone: "091 646 32 41",
    floor: 3,
    category: "Beauty",
    url: "",
    logoUrl: "",
  },
  {
    name: "Kiko Milano",
    storeNumber: "274",
    phone: "091 630 02 55",
    floor: 2,
    category: "Beauty",
    url: "https://www.kikocosmetics.com/de-ch/",
    logoUrl: "https://balexert.ch/app/uploads/2019/05/maquillage-logo-kiko-milano.webp",
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
    logoUrl: "https://www.foxtown.com/upload/multimedia/2014.10.28.10.23.176447.jpg"
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
    url: "https://www.bally.com/",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2023-03-22-11-26-5714473.jpg"
  },
  {
    name: "Boxeur Des Rues Temporary",
    storeNumber: "371",
    phone: "091 646 01 01",
    floor: 3,
    category: "Temporary Stores",
    url: "https://www.boxeurdesrues.com/",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2018.11.09.10.01.044774.jpg"
  },
  {
    name: "Odlo Temporary",
    storeNumber: "240",
    phone: "041 545 36 79",
    floor: 2,
    category: "Temporary Stores",
    url: "https://www.odlo.com",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2022-10-27-14-47-3813877.jpg"
  },
  {
    name: "Timberland Temporary",
    storeNumber: "236",
    phone: "091 630 23 55",
    floor: 2,
    category: "Temporary Stores",
    url: "https://www.timberland.com",
    logoUrl: "https://www.foxtown.com/upload/multimedia/2014.10.28.10.23.408778.jpg"
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
