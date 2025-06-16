let myStamps = [
    /*{
        value: 80,
        face_value: 'L.400',
        number: 14
    }*/
];
const facialDen = {
    A: { max_weight: 100, valore: 300, nome: "A" },
    B: { max_weight: 20, valore: 130, nome: "B" },
    A1: { max_weight: 50, valore: 375, nome: "A Zona 1" },
    B1: { max_weight: 20, valore: 135, nome: "B Zona 1" },
    A2: { max_weight: 50, valore: 485, nome: "A Zona 2" },
    B2: { max_weight: 20, valore: 255, nome: "B Zona 2" },
    A3: { max_weight: 50, valore: 595, nome: "A Zona 3" },
    B3: { max_weight: 20, valore: 335, nome: "B Zona 3" },
    B_50: { max_weight: 50, valore: 290, nome: "B 50g" },
    B1_50: { max_weight: 50, valore: 330, nome: "B Zona 1 50g" },
    B2_50: { max_weight: 50, valore: 415, nome: "B Zona 2 50g" },
    B3_50: { max_weight: 50, valore: 515, nome: "B Zona 3 50g" }
}
const letterStamps = Object.keys(facialDen).map(x => facialDen[x].nome)
const tendina = document.querySelector("#scegli-lettera");
tendina.innerHTML = Object.keys(facialDen).sort((x, y) => facialDen[x].valore - facialDen[y].valore).map(x => `<option value="${x}">${facialDen[x].nome} (€${(facialDen[x].valore / 100).toFixed(2).replace('.', ',')})</option>`).join('')

let currentSet = []
const fieldset = document.querySelector('#francobolli')
const tab = document.querySelector('#postage')

const B = document.querySelector('#B');
const B1 = document.querySelector('#B1');
const B2 = document.querySelector('#B2');
const B3 = document.querySelector('#B3');

const B_50 = document.querySelector('#B_50');
const B1_50 = document.querySelector('#B1_50');
const B2_50 = document.querySelector('#B2_50');
const B3_50 = document.querySelector('#B3_50');

const A = document.querySelector('#A');
const A1 = document.querySelector('#A1');
const A2 = document.querySelector('#A2');
const A3 = document.querySelector('#A3');

const piego2 = document.querySelector('#piego2');
const piego5 = document.querySelector('#piego5');

const other = document.querySelector('#other')
const altriValori = document.querySelector('#valore-francobollo-calcolo')
const numeroFrancobolli = document.querySelector('#quantita-francobolli-calcolo')
const storedValue = localStorage.getItem('savedNumber');
let francobollo_da_usare = null;
if (storedValue !== null) {
    numeroFrancobolli.value = storedValue;
}
numeroFrancobolli.addEventListener('change', function () {
    // Save the new value to local storage
    localStorage.setItem('savedNumber', this.value);
});
const aside = document.querySelector('aside');
const lire = document.querySelector('#lire')
const euro = document.querySelector('#euro')
const lettera = document.querySelector('#lettera')
const scegliLettera = document.querySelector('#scegli-lettera')
const stampValue = document.querySelector('#valore')
const stampQuantity = document.querySelector('#quantity')
const buttonContainer = document.querySelector('#button-container')
const spanTotal = document.querySelector("span#total")
function retrieveStamps() {
    myStamps = JSON.parse(localStorage.getItem('__myStamps')) ?? []
    myStamps = myStamps.filter(({ number }) => number > 0)
        .map((stamp) => {
            const copy = letterStamps.map(x => x.toLowerCase())
            if (copy.includes(stamp.face_value.toLowerCase())) {
                stamp.value = facialDen[Object.keys(facialDen).find(key => stamp.face_value.toLowerCase() === facialDen[key].nome.toLowerCase())].valore;
            }
            return stamp
        })
    sortStamps()
    saveStamps()
}

retrieveStamps()

function sortStamps() {
    if (myStamps.length < 2) { } else {
        myStamps.sort(
            (a, b) => {
                return (b.value - a.value)
                || (b.face_value[0] === a.face_value[0] ? 0 : b.face_value[0] === 'L' ? -1 : 1)
                || (Number(b.face_value.match(/\d+/)[0]) - Number(a.face_value.match(/\d+/)[0]))
            }
        )
    }
    showStamps()
}

function saveStamps() {
    myStamps = myStamps.filter(({ number }) => number > 0)
    sortStamps()
    localStorage.setItem('__myStamps', JSON.stringify(myStamps))
    showStamps()
}

function showStamps() {
    let totalValue = 0
    let totalAmount = 0
    let html = '<legend>lista francobolli</legend><table><tr><td>valore facciale</td><td>valore (€)</td><td>quantità</td><td>valore totale</td><td><label><input type=radio id=radio name=stamp onclick="francobollo_da_usare = null" checked>Seleziona nessun francobollo</label></td></tr>'
    for (let stamp of myStamps) {
        html += `<tr><td>${stamp.face_value}</td>
        <td>€${stamp.face_value[0] === 'L' ? (stamp.value / 100).toFixed(3) : (stamp.value / 100).toFixed(2)}</td>
        <td>${stamp.number}</td>
        <td>€${(stamp.number * stamp.value / 100).toFixed(2)}</td>
        <td><label><input type=radio name=stamp onclick="francobollo_da_usare = '${stamp.face_value}'" > Usa questo francobollo</label></td>
        <td><button onclick="removeStamp('${stamp.face_value}')">Elimina francobollo</button></td>
        </tr>`
        totalValue += stamp.value * stamp.number
        totalAmount += stamp.number
    }
    html += '</table>'
    fieldset.innerHTML = html
    aside.innerHTML = `<p>Numero totale francobolli: ${totalAmount}</p>
    <p>Valore totale: €${(totalValue / 100).toFixed(2)}</p>
    <p>Numero denominazioni diverse: ${myStamps.length}</p>
    <p>Numero combinazioni calcolate: <span id="numb-comb">${numberCombinations(myStamps.length, numeroFrancobolli.value)}</span></p>`
}

numeroFrancobolli.addEventListener("change", () => {
    document.querySelector('#numb-comb').innerText = numberCombinations(myStamps.length, numeroFrancobolli.value)
})

function removeStamp(fv) {
    myStamps.find(x => x.face_value === fv).number = 0
    saveStamps()

}
// AGGIUNGI NUOVO FRANCOBOLLO AL SET

function addStamps() {
    let face_value;
    let value;
    let number = Number(stampQuantity.value);
    if (number % 1 !== 0) { alert("Quantity must be a whole number"); return }
    if (lire.checked) {
        face_value = `L.${stampValue.value}`
        value = (100 * stampValue.value / 1936.27)


    } else if (euro.checked) {

        face_value = `€${(function (str) {
            const dec = str.split(".")[1];
            if (!dec) {
                return str + ".00";
            } else if (dec.length == 1) {
                return str + "0";
            } else {
                return str;
            }
        })(stampValue.value)}`
        value = Math.round(100 * stampValue.value)


    } else if (lettera.checked) {
        face_value = (function (lettera) {
            return facialDen[lettera].nome
        })(scegliLettera.value)
        value = (function (lettera) {
            return facialDen[lettera].valore
        })(scegliLettera.value)
    }

    const inMyStamps = myStamps.find((obj) => (obj.face_value === face_value))
    if (inMyStamps) {
        inMyStamps.number += number
    } else {
        myStamps.push({ face_value, value, number })
        myStamps.sort((a, b) => b.value - a.value)

    }
    saveStamps()
    stampQuantity.value = ''
    stampValue.value = ''
}
function numberCombinations(x, y) {
    let z = 0
    for (let n = y; n > 0; n--) { z += Math.pow(x, n); }
    if (z > 9999) {
        return z.toExponential(2)
    }
    else {
        return z;
    }
}

function calculateStamps() {
    let v;
    let t;
    switch (true) {
        case B.checked:
            v = facialDen['B'].valore;
            t = facialDen['B'].nome;
            break;
        case B1.checked:
            v = facialDen['B1'].valore;
            t = facialDen['B1'].nome;
            break;
        case B2.checked:
            v = facialDen['B2'].valore;
            t = facialDen['B2'].nome;
            break;
        case B3.checked:
            v = facialDen['B3'].valore;
            t = facialDen['B3'].nome;
            break;

        case B_50.checked:
            v = facialDen['B_50'].valore;
            t = facialDen['B_50'].nome;
            break
        case B1_50.checked:
            v = facialDen['B1_50'].valore;
            t = facialDen['B1_50'].valore;
            break
        case B2_50.checked:
            v = facialDen['B2_50'].valore;
            t = facialDen['B2_50'].nome;
            break
        case B3_50.checked:
            v = facialDen['B3_50'].valore;
            t = facialDen['B3_50'].nome;
            break

        case A.checked:
            v = facialDen['A'].valore;
            t = facialDen['A'].nome;
            break
        case A1.checked:
            v = facialDen['A1'].valore;
            t = facialDen['A1'].nome;
            break
        case A2.checked:
            v = facialDen['A2'].valore;
            t = facialDen['A2'].nome;
            break
        case A3.checked:
            v = facialDen['A3'].valore;
            t = facialDen['A3'].nome;
            break
        case piego2.checked:
            v = 145;
            t = "Piego di libri 2kg";
            break;
        case piego5.checked:
            v = 395;
            t = "Piego di libri 5kg";
            break;
        case other.checked:
            v = Math.round(altriValori.value * 100)
            t = altriValori.value;
            break;
    }
    currentSet = calculate_stamps(myStamps, v, Number(numeroFrancobolli.value));
    let html = ``;
    html += '<tr>'
    let noStamps = true;
    for (let stamp of currentSet) {
        html += `<td><label><input name="stamps" type=checkbox>${stamp.face_value}</label></td>`
        noStamps = false;
    }
    if (noStamps) {
        html += '<td>Nessuna combinazione possibile</td></tr>'
        postage.innerHTML = html
        buttonContainer.innerHTML = ''
        spanTotal.innerHTML = ``
    } else {
        html += '</tr>'
        selectedValue.innerText = `Valore selezionato: ${(other.checked) ? `€${Number(t).toFixed(2)}` : `${t} (€${(v / 100).toFixed(2).replace('.', ',')})`}`;
        postage.innerHTML = html
        buttonContainer.innerHTML = '<button id="usa-questi-francobolli" value="Usa questi francobolli" onclick="useStamps()">Usa</button>'
        const usaQuestiFrancobolli = document.querySelector('#usa-questi-francobolli')
        usaQuestiFrancobolli.innerText = 'Usa questa combinazione: ' + currentSet.map(({ face_value }) => face_value).join(', ')
    }
}

function useStamps() {
    for (let x of currentSet) {
        let stamp = myStamps.find((a) => x.face_value === a.face_value)
        stamp.number--;
    }
    myStamps = myStamps.filter(({ number }) => number > 0)
    saveStamps()
    postage.innerHTML = ''
    buttonContainer.innerHTML = ''
    spanTotal.innerHTML = ``
    document.querySelector('#radio').click()
}

function calculate_stamps(stamps, postage, numberOfStamps) {
    const the_right_postage = [];
    let range = 0;
    while (postage + range <= stamps[0].value * numberOfStamps) {
        let current_number_of_stamps = 1;
        stampsFiltered = stamps.filter(({ value }) => Math.round(value) <= postage + range)
        while (current_number_of_stamps <= numberOfStamps) {
            const stamps_combinations = combRep(stampsFiltered, current_number_of_stamps);
            for (const arr of stamps_combinations) {
                const gg = arr.reduce((a, b) => ({ sum: a.sum + b.value, count: { ...a.count, [b.face_value]: ((a.count[b.face_value] || 0) + 1) } }), { sum: 0, count: {} })
                if (
                    Math.round(gg.sum) === postage + range
                    && Object.keys(gg.count).every(
                        x => (gg.count[x] <= arr.find(stamp => stamp.face_value === x).number)
                    ) && (francobollo_da_usare ? arr.some(stamp => stamp.face_value === francobollo_da_usare) : true)) {
                    the_right_postage.push(arr);
                }
            }
            current_number_of_stamps++;
        }
        if (the_right_postage.length > 0) break;
        range++;
    }
    spanTotal.innerHTML = `€${((range + postage) / 100).toFixed(2)} ~ (${the_right_postage.length} combinazioni)`
    const result =
        the_right_postage[Math.floor(the_right_postage.length * Math.random())] || [];
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
