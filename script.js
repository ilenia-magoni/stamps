let myStamps = [
    /*{
        value: 80,
        face_value: 'L.400',
        number: 14
    }*/
];
let currentSet = []
const fieldset = document.querySelector('#francobolli')
const tab = document.querySelector('#postage')
const B = document.querySelector('#B')
const B1 = document.querySelector('#B1')
const B2 = document.querySelector('#B2')
const B3 = document.querySelector('#B3')
const other = document.querySelector('#other')
const altriValori = document.querySelector('#valore-francobollo-calcolo')
const numeroFrancobolli = document.querySelector('#quantita-francobolli-calcolo')
const storedValue = localStorage.getItem('savedNumber');
let francobollo_da_usare = null;
if (storedValue !== null) {
    numeroFrancobolli.value = storedValue;
}
numeroFrancobolli.addEventListener('change', function() {
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
        .map(({ face_value, value, number }) => ((face_value[0] === 'L') && (value % 1 === 0)) ? { face_value, number, value: Math.round(1000 * face_value.match(/\d+/)[0] / 1936.27) / 10 }
            : { face_value, value, number })
    sortStamps()
    saveStamps()
}

retrieveStamps()

function sortStamps() {
    myStamps.sort(
        (a, b) =>
            (b.value - a.value)
            || (b.face_value[0] === a.face_value[0] ? 0 : b.face_value[0] === 'L' ? -1 : 1)
            || (Number(b.face_value.match(/\d+/)[0]) - Number(a.face_value.match(/\d+/)[0]))
    )
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
            switch (lettera) {
                case 'B':
                    return 'B'
                case 'B1':
                    return 'B zona 1'
                case 'B2':
                    return 'B zona 2'
                case 'B3':
                    return 'B zona 3'
            }
        })(scegliLettera.value)
        value = (function (lettera) {
            switch (lettera) {
                case 'B':
                    return 125
                case 'B1':
                    return 130
                case 'B2':
                    return 245
                case 'B3':
                    return 320
            }
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
    switch (true) {
        case B.checked:
            v = 125;
            break
        case B1.checked:
            v = 130
            break
        case B2.checked:
            v = 245
            break
        case B3.checked:
            v = 320
            break
        case other.checked:
            v = Math.round(altriValori.value * 100)
    }
    currentSet = calculate_stamps(myStamps, v, Number(numeroFrancobolli.value));
    let html = ''
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
        stampsFiltered = stamps.filter(({ value }) => value <= postage + range)
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
