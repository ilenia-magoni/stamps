let myStamps = [
    /*{
        value: 0.80,
        face_value: 'L.400',
        number: 14
    }*/
];
function retrieveStamps() {
    myStamps = JSON.parse(localStorage.getItem('__myStamps'))
}

function saveStamps() {
    localStorage.setItem('__myStamps', JSON.stringify(myStamps))
}

const targets = { ITALIA: 1.25, "Zona 1": 1.3, "Zona 2": 2.45, "Zona 3": 3.2 };
const country = "Francia";
const countries = {
    ITALIA: "Italia, Repubblica San Marino, Vaticano",
    "Zona 1":
        "Albania, Andorra, Austria, Azzorre, Belgio, Bielorussia, Bosnia-Erzegovina, Bulgaria, Cipro, Croazia, Danimarca, Estonia, Faroe (Isole), Finlandia, Francia, Germania, Gibilterra, Gran Bretagna e Irlanda del Nord, Grecia, Guernsey, Irlanda, Islanda, Jersey, Kosovo, Lettonia, Liechtenstein, Lituania, Lussemburgo, Macedonia del Nord, Malta, Man Isole - Gran Bretagna UE, Moldavia, Monaco, Montenegro, Norvegia, Olanda, Polonia, Portogallo, Repubblica Ceca, Romania, Russia, Serbia, Slovacchia, Slovenia, Spagna, Svezia, Svizzera, Turchia, Ucraina, Ungheria" +
        ", " +
        "Algeria, Egitto, Giordania, Israele, Libano, Libia, Marocco, Tunisia",
    "Zona 2":
        "Angola, Ascension - Isole (Uk), Benin, Botswana, Burkina Faso, Burundi, Camerun, Capo Verde, Ciad, Comore, Congo (Rep. Popolare), Costa D'Avorio, Eritrea, Etiopia, Gabon, Gambia, Ghana, Gibuti, Guinea, Guinea Equatoriale, Guinea Bissau, Kenya, Lesotho, Liberia, Madagascar, Malawi, Mali, Mauritania, Mauritius, Mayotte, Mozambico, Namibia, Niger, Nigeria, Repubblica Centrafricana, Repubblica del Congo, Reunion (Isole), Ruanda, Sant'Elena (Isola di), S. Tommaso E Principe, Senegal, Seychelles, Sierra Leone, Sud Africa, Sudan, Sud Sudan, Swaziland, Tanzania, Territorio Britannico dell'Oceano Indiano, Togo, Tristan Da Cunha, Uganda, Zambia, Zimbabwe" +
        ", " +
        "Anguilla, Antigua & Barbuda, Argentina, Aruba, Bahamas, Barbados, Belize, Bermuda, Bolivia, Bonaire - (Antille Olandesi), Brasile, Canada, Cayman Islands, Cile, Colombia, Costa Rica, Cuba, Curacao, Dominica, Ecuador, El Salvador, Falklands (Isole), Giamaica, Grenada, Groenlandia, Guadalupa, Guantanamo Bay, Guatemala, Guyana, Guyana (Francese), Haiti, Honduras, Martinica, Messico, Montserrat, Nicaragua, Panama, Paraguay, Peru, Porto Rico, Repubblica Dominicana, Saba - (Antille Olandesi), Saint Barthelemy - (St. Barth), Saint Eustatius - (Antille Olandesi), S. Cristoforo, Saint Lucia, Saint Pierre & Miquelon, Saint Vincent (E Granadines), Samoa Britanniche, Sint Maarten, South Georgia and The South Sandwich Islands, Stati Uniti, Suriname, Trinidad & Tobago, Turks And Caicos Is., Uruguay, Venezuela, Vergini (Isole) - Br, Vergini (Isole) Usa - (St. Tomas & St. Croix)" +
        ", " +
        "Afghanistan, Arabia Saudita, Armenia, Azerbaidjan, Bahrain, Bangladesh, Bhutan, Brunei, Cambogia, China, Corea Del Nord - Rep. Dem., Corea del Sud, Emirati Arabi Uniti, Filippine, Georgia, Giappone, Hong Kong, India, Indonesia, Iran, Iraq, Kazakistan, Kirghizistan, Kuwait, Laos, Macao, Maldive, Malesia, Mongolia, Myanmar Burnma (Birmania), Nepal, Oman, Pakistan, Qatar, Singapore, Sri Lanka, Tagikistan, Taiwan, Thailandia, Timor Orientale (Est), Turkmenistan, Uzbekistan, Vietnam",
    "Zona 3":
        "Australia, Cook (Isole), Fiji (Isole), Guam, Kiribati, Marshall (Isole), Micronesia (Isole Caroline), Nauru, Niue, Norfolk Island, Nuova Caledonia, Nuova Zelanda, Palau, Papua Nuova Guinea, Pitcairn, Polinesia (Francese), Saipan (Isole Marianne), Salomone (Isole), Samoa (Americane), Scattered Islands, Terre Australi e Antartiche Francesi, Tokelau, Tonga (Isole), Tuvalu, Vanuatu, Wake, Wallis & Futuna (Isole)",
};
const max_number_of_stamps = 5;
const stamps = [
    2.8,
    1.63,
    1.5,
    1.3, // B zona 1
    1.25, // B
    0.70,
    0.28,
    0.2,
    0.15,
    0.1,
    0.09,
    0.05,
    0.04,
    0.03,
    0.02,
];
const lire_stamps = {
    1.63: 3150,
    0.31: 600,
    0.28: 550,
    0.15: 300,
    0.1: 200,
    0.09: 170,
    0.05: 100,
    0.05: 90,
    0.04: 80,
    0.04: 70,
    0.03: 50,
    0.02: 40,
};
const zones = {
    1.25: "B",
    1.3: "B Zona 1",
};
for (const list in countries) {
    if (countries[list].includes(country)) {
        calculate_stamps(stamps, targets[list], max_number_of_stamps);
    }
}

function calculate_stamps(stamps, postage, numberOfStamps) {
    stamps = stamps.map((x) => Math.round(x * 100));
    postage = Math.round(postage * 100);
    const the_right_postage = [];
    let range = 0;
    while (postage + range <= stamps[0] * numberOfStamps) {
        let current_number_of_stamps = 1;
        while (current_number_of_stamps <= numberOfStamps) {
            const stamps_combinations = combRep(stamps, current_number_of_stamps);
            for (const arr of stamps_combinations) {
                const sum = arr.reduce((a, b) => a + b, 0);
                if (sum === postage + range) {
                    the_right_postage.push(arr.map((x) => x / 100));
                }
            }
            current_number_of_stamps++;
        }
        if (the_right_postage.length > 0) break;
        range++;
    }
    const result =
        the_right_postage[Math.floor(the_right_postage.length * Math.random())];
    console.table([postage / 100, map_to_lire(result)]);
    return result;
}

// https://stackoverflow.com/questions/32543936/combination-with-repetition
function combRep(arr, l) {
    if (l === void 0) l = arr.length; // Length of the combinations
    var data = Array(l), // Used to store state
        results = []; // Array of results
    (function f(pos, start) {
        // Recursive function
        if (pos === l) {
            // End reached
            results.push(data.slice()); // Add a copy of data to results
            return;
        }
        for (var i = start; i < arr.length; ++i) {
            data[pos] = arr[i]; // Update data
            f(pos + 1, i); // Call f recursively
        }
    })(0, 0); // Start at index 0
    return results; // Return results
}

function map_to_lire(arr) {
    return arr.map((e) => {
        let value = lire_stamps[e];
        let zone = zones[e];
        if (value) {
            return `L.${value}`;
        } else if (zone) {
            return zone;
        } else {
            return `€${(function (e) {
                const str = e.toString();
                const dec = str.split(".")[1];
                if (!dec) {
                    return str + ".00";
                } else if (dec.length == 1) {
                    return str + "0";
                } else {
                    return str;
                }
            })(e)}`;
        }
    });
}
