// Constants
const LIRE_TO_EURO_RATE = 1936.27;
const STORAGE_KEYS = {
    STAMPS: '__myStamps',
    SAVED_NUMBER: 'savedNumber'
};

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
};

const letterStamps = Object.keys(facialDen).map(x => facialDen[x].nome);

// Initialize letter denomination dropdown
const tendina = document.querySelector("#scegli-lettera");
tendina.innerHTML = Object.keys(facialDen)
    .sort((x, y) => facialDen[x].valore - facialDen[y].valore)
    .map(x => `<option value="${x}">${facialDen[x].nome} (€${(facialDen[x].valore / 100).toFixed(2).replace('.', ',')})</option>`)
    .join('');

// DOM element cache for better performance
const DOM = {
    // Main containers
    fieldset: document.querySelector('#francobolli'),
    postageTable: document.querySelector('#postage'),
    aside: document.querySelector('aside'),
    buttonContainer: document.querySelector('#button-container'),
    spanTotal: document.querySelector("span#total"),
    selectedValue: document.querySelector('#selectedValue'),
    
    // Form elements
    euroRadio: document.querySelector('#euro'),
    lireRadio: document.querySelector('#lire'),
    letterRadio: document.querySelector('#lettera'),
    letterSelect: document.querySelector('#scegli-lettera'),
    stampValue: document.querySelector('#valore'),
    stampQuantity: document.querySelector('#quantity'),
    maxStampsInput: document.querySelector('#quantita-francobolli-calcolo'),
    customValueInput: document.querySelector('#valore-francobollo-calcolo'),
    
    // Postage type radio buttons
    postageRadios: {
        B: document.querySelector('#B'),
        B1: document.querySelector('#B1'),
        B2: document.querySelector('#B2'),
        B3: document.querySelector('#B3'),
        B_50: document.querySelector('#B_50'),
        B1_50: document.querySelector('#B1_50'),
        B2_50: document.querySelector('#B2_50'),
        B3_50: document.querySelector('#B3_50'),
        A: document.querySelector('#A'),
        A1: document.querySelector('#A1'),
        A2: document.querySelector('#A2'),
        A3: document.querySelector('#A3'),
        piego2: document.querySelector('#piego2'),
        piego5: document.querySelector('#piego5'),
        other: document.querySelector('#other')
    }
};

let currentSet = [];
let francobollo_da_usare = null;

// Initialize saved number from localStorage
const storedValue = localStorage.getItem(STORAGE_KEYS.SAVED_NUMBER);
if (storedValue !== null) {
    DOM.maxStampsInput.value = storedValue;
}

// Save max stamps value to localStorage when changed
DOM.maxStampsInput.addEventListener('change', function () {
    localStorage.setItem(STORAGE_KEYS.SAVED_NUMBER, this.value);
});

// Update combination count when max stamps changes
DOM.maxStampsInput.addEventListener("change", () => {
    document.querySelector('#numb-comb').innerText = numberCombinations(myStamps.length, DOM.maxStampsInput.value);
});
function retrieveStamps() {
    myStamps = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAMPS)) ?? [];
    myStamps = myStamps.filter(({ number }) => number > 0)
        .map((stamp) => {
            const letterStampsLower = letterStamps.map(x => x.toLowerCase());
            if (letterStampsLower.includes(stamp.face_value.toLowerCase())) {
                const matchingKey = Object.keys(facialDen).find(key => 
                    stamp.face_value.toLowerCase() === facialDen[key].nome.toLowerCase()
                );
                if (matchingKey) {
                    stamp.value = facialDen[matchingKey].valore;
                }
            }
            return stamp;
        });
    sortStamps();
    saveStamps();
}

// Initialize the application
retrieveStamps();

// Setup main event listeners
function setupMainEventListeners() {
    // Add stamps button
    const addStampsBtn = document.querySelector('#add-stamps-btn');
    if (addStampsBtn) {
        addStampsBtn.addEventListener('click', addStamps);
    }
    
    // Calculate stamps button
    const calculateBtn = document.querySelector('#calcola');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateStamps);
    }
    
    // Collapsible legends
    const collapsibleLegends = document.querySelectorAll('.collapsible-legend');
    collapsibleLegends.forEach(legend => {
        legend.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                toggleCollapse(targetId);
            }
        });
    });
}

// Call setup function when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMainEventListeners);
} else {
    setupMainEventListeners();
}

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
    myStamps = myStamps.filter(({ number }) => number > 0);
    sortStamps();
    localStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify(myStamps));
    showStamps();
}

function showStamps() {
    const stats = calculateStampStats();
    const tableHtml = generateStampTableHtml();
    const sidebarHtml = generateSidebarHtml(stats);
    
    DOM.fieldset.innerHTML = tableHtml;
    DOM.aside.innerHTML = sidebarHtml;
    
    // Add event listeners for dynamically created elements
    setupStampTableEventListeners();
}

function calculateStampStats() {
    return myStamps.reduce((stats, stamp) => {
        stats.totalValue += stamp.value * stamp.number;
        stats.totalAmount += stamp.number;
        return stats;
    }, { totalValue: 0, totalAmount: 0 });
}

function generateStampTableHtml() {
    let html = '<legend>Lista Francobolli</legend>';
    
    if (myStamps.length === 0) {
        html += '<div style="text-align: center; padding: 2rem; color: #718096; font-style: italic;">Nessun francobollo nella collezione. Aggiungi dei francobolli per iniziare.</div>';
        return html;
    }
    
    html += '<table>';
    html += '<thead><tr>';
    html += '<th>Valore Facciale</th>';
    html += '<th>Valore (€)</th>';
    html += '<th>Quantità</th>';
    html += '<th>Valore Totale</th>';
    html += '<th>Selezione</th>';
    html += '<th>Azioni</th>';
    html += '</tr></thead><tbody>';
    
    // Add "no stamp" option first
    html += '<tr>';
    html += '<td colspan="4"><em>Nessun francobollo selezionato</em></td>';
    html += '<td><label><input type="radio" id="radio" name="stamp" data-stamp-value="" checked> Seleziona</label></td>';
    html += '<td>-</td>';
    html += '</tr>';
    
    for (const stamp of myStamps) {
        const euroValue = stamp.face_value[0] === 'L' ? 
            (stamp.value / 100).toFixed(3) : 
            (stamp.value / 100).toFixed(2);
        const totalValue = (stamp.number * stamp.value / 100).toFixed(2);
        
        html += `<tr>
            <td><strong>${stamp.face_value}</strong></td>
            <td>€${euroValue}</td>
            <td>${stamp.number}</td>
            <td><strong>€${totalValue}</strong></td>
            <td><label><input type="radio" name="stamp" data-stamp-value="${stamp.face_value}"> Seleziona</label></td>
            <td><button class="remove-stamp-btn" data-face-value="${stamp.face_value}">🗑️ Elimina</button></td>
        </tr>`;
    }
    
    html += '</tbody></table>';
    return html;
}

function generateSidebarHtml(stats) {
    return `<p><span>Totale francobolli:</span> <strong>${stats.totalAmount}</strong></p>
        <p><span>Valore totale:</span> <strong>€${(stats.totalValue / 100).toFixed(2)}</strong></p>
        <p><span>Denominazioni diverse:</span> <strong>${myStamps.length}</strong></p>
        <p><span>Combinazioni possibili:</span> <strong><span id="numb-comb">${numberCombinations(myStamps.length, DOM.maxStampsInput.value)}</span></strong></p>`;
}

// Event listeners for dynamically created stamp table elements
function setupStampTableEventListeners() {
    // Handle stamp selection radio buttons
    const stampRadios = DOM.fieldset.querySelectorAll('input[name="stamp"]');
    stampRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const stampValue = this.getAttribute('data-stamp-value');
            francobollo_da_usare = stampValue || null;
        });
    });
    
    // Handle remove stamp buttons
    const removeButtons = DOM.fieldset.querySelectorAll('.remove-stamp-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const faceValue = this.getAttribute('data-face-value');
            removeStamp(faceValue);
        });
    });
}

// Remove the duplicate event listener
// DOM.maxStampsInput.addEventListener("change", () => {
//     document.querySelector('#numb-comb').innerText = numberCombinations(myStamps.length, DOM.maxStampsInput.value);
// });

function removeStamp(fv) {
    const stamp = myStamps.find(x => x.face_value === fv);
    if (stamp) {
        stamp.number = 0;
        saveStamps();
    }
}
// Utility functions for stamp value formatting and calculation
function formatEuroValue(value) {
    const str = value.toString();
    const dec = str.split(".")[1];
    if (!dec) {
        return str + ".00";
    } else if (dec.length === 1) {
        return str + "0";
    } else {
        return str;
    }
}

function calculateLireValue(lireAmount) {
    return Math.round(100 * lireAmount / LIRE_TO_EURO_RATE);
}

function calculateEuroValue(euroAmount) {
    return Math.round(100 * euroAmount);
}

function getLetterStampData(letterKey) {
    const stampData = facialDen[letterKey];
    return {
        face_value: stampData.nome,
        value: stampData.valore
    };
}

// Improved addStamps function with validation
function addStamps() {
    // Validate form first
    if (!validateForm()) {
        return;
    }
    
    try {
        const number = Number(DOM.stampQuantity.value);
        
        // Validate quantity
        if (number % 1 !== 0) { 
            alert("Quantity must be a whole number"); 
            return;
        }
        
        let stampData;
        
        if (DOM.lireRadio.checked) {
            stampData = {
                face_value: `L.${DOM.stampValue.value}`,
                value: calculateLireValue(DOM.stampValue.value)
            };
        } else if (DOM.euroRadio.checked) {
            stampData = {
                face_value: `€${formatEuroValue(DOM.stampValue.value)}`,
                value: calculateEuroValue(DOM.stampValue.value)
            };
        } else if (DOM.letterRadio.checked) {
            stampData = getLetterStampData(DOM.letterSelect.value);
        }

        // Add or update stamp in collection
        const existingStamp = myStamps.find(stamp => stamp.face_value === stampData.face_value);
        if (existingStamp) {
            existingStamp.number += number;
        } else {
            myStamps.push({ ...stampData, number });
            myStamps.sort((a, b) => b.value - a.value);
        }
        
        saveStamps();
        
        // Clear form
        DOM.stampQuantity.value = '';
        DOM.stampValue.value = '';
        
        showMessage('Francobolli aggiunti con successo!', 'success');
    } catch (error) {
        showMessage('Errore durante l\'aggiunta dei francobolli', 'error');
        console.error('Error adding stamps:', error);
    }
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

// Utility function to find selected postage type
function getSelectedPostageType() {
    // Check predefined postage types first
    for (const [key, element] of Object.entries(DOM.postageRadios)) {
        if (element && element.checked) {
            if (key === 'piego2') {
                return { value: 145, name: "Piego di libri 2kg" };
            } else if (key === 'piego5') {
                return { value: 395, name: "Piego di libri 5kg" };
            } else if (key === 'other') {
                const customValue = Math.round(DOM.customValueInput.value * 100);
                return { value: customValue, name: DOM.customValueInput.value };
            } else if (facialDen[key]) {
                return { 
                    value: facialDen[key].valore, 
                    name: facialDen[key].nome 
                };
            }
        }
    }
    return null;
}

function calculateStamps() {
    // Check if other is selected and validate custom value
    if (DOM.postageRadios.other.checked) {
        const customValue = DOM.customValueInput.value;
        if (!customValue || isNaN(customValue) || customValue <= 0) {
            // Show error message in calculation section
            const calcResults = document.querySelector('.calculation-results');
            if (calcResults) {
                calcResults.innerHTML = '<div class="error-message">Per favore inserisci un valore valido per la spedizione personalizzata</div>';
            }
            return;
        }
    }
    
    try {
        const postageType = getSelectedPostageType();
        if (!postageType) {
            console.error('No postage type selected');
            return;
        }
        
        const { value: targetValue, name: typeName } = postageType;
        const maxStamps = Number(DOM.maxStampsInput.value);
        
        currentSet = calculate_stamps(myStamps, targetValue, maxStamps);
        
        displayCalculationResults(currentSet, targetValue, typeName);
    } catch (error) {
        const calcResults = document.querySelector('.calculation-results');
        if (calcResults) {
            calcResults.innerHTML = '<div class="error-message">Errore durante il calcolo delle combinazioni</div>';
        }
        console.error('Error calculating stamps:', error);
    }
}

function displayCalculationResults(stampSet, targetValue, typeName) {
    let html = '<tr>';
    let noStamps = true;
    
    for (const stamp of stampSet) {
        html += `<td><label><input name="stamps" type="checkbox">${stamp.face_value}</label></td>`;
        noStamps = false;
    }
    
    if (noStamps) {
        html += '<td>Nessuna combinazione possibile</td></tr>';
        DOM.postageTable.innerHTML = html;
        DOM.buttonContainer.innerHTML = '';
        DOM.spanTotal.innerHTML = '';
        
        // Update selectedValue even when no combinations are found
        const isCustomValue = DOM.postageRadios.other.checked;
        const displayValue = isCustomValue ? 
            `€${Number(typeName).toFixed(2)}` : 
            `${typeName} (€${(targetValue / 100).toFixed(2).replace(".", ",")})`;
        DOM.selectedValue.innerText = `Valore selezionato: ${displayValue}`;
    } else {
        html += '</tr>';
        
        const isCustomValue = DOM.postageRadios.other.checked;
        const displayValue = isCustomValue ? 
            `€${Number(typeName).toFixed(2)}` : 
            `${typeName} (€${(targetValue / 100).toFixed(2).replace('.', ',')})`;
        
        DOM.selectedValue.innerText = `Valore selezionato: ${displayValue}`;
        DOM.postageTable.innerHTML = html;
        
        const stampNames = stampSet.map(({ face_value }) => face_value).join(', ');
        DOM.buttonContainer.innerHTML = `<button id="usa-questi-francobolli" class="use-stamps-btn">Usa questa combinazione: ${stampNames}</button>`;
        
        // Add event listener for the use stamps button
        const useButton = DOM.buttonContainer.querySelector('.use-stamps-btn');
        if (useButton) {
            useButton.addEventListener('click', useStamps);
        }
    }
}

function useStamps() {
    // Reduce stamp quantities
    for (const stampToUse of currentSet) {
        const stamp = myStamps.find(stamp => stamp.face_value === stampToUse.face_value);
        if (stamp) {
            stamp.number--;
        }
    }
    
    // Clean up stamps with 0 quantity and save
    myStamps = myStamps.filter(({ number }) => number > 0);
    saveStamps();
    
    // Clear results display
    DOM.postageTable.innerHTML = '';
    DOM.buttonContainer.innerHTML = '';
    DOM.spanTotal.innerHTML = '';
    
    // Reset stamp selection - the radio will be recreated when showStamps is called from saveStamps
    francobollo_da_usare = null;
}

function calculate_stamps(stamps, postage, numberOfStamps) {
    // Safety check: ensure we have stamps
    if (!stamps || stamps.length === 0) {
        DOM.spanTotal.innerHTML = "Nessun francobollo disponibile";
        return [];
    }
    
    const validCombinations = [];
    let range = 0;
    const maxRange = Math.max(stamps[0]?.value || 0, postage);
    
    // Try different ranges until we find combinations
    while (range <= maxRange && validCombinations.length === 0) {
        const targetValue = postage + range;
        const eligibleStamps = stamps.filter(({ value }) => Math.round(value) <= targetValue);
        
        // Safety check: ensure we have eligible stamps
        if (eligibleStamps.length === 0) {
            range++;
            continue;
        }
        
        // Try different numbers of stamps
        for (let currentStampCount = 1; currentStampCount <= numberOfStamps; currentStampCount++) {
            const combinations = combRep(eligibleStamps, currentStampCount);
            
            for (const combination of combinations) {
                const analysis = analyzeCombination(combination, targetValue);
                
                if (meetsConstraints(analysis, combination)) {
                    validCombinations.push(combination);
                }
            }
        }
        
        if (validCombinations.length > 0) break;
        range++;
    }
    
    const finalValue = postage + range;
    DOM.spanTotal.innerHTML = `€${(finalValue / 100).toFixed(2)} ~ (${validCombinations.length} combinazioni)`;
    
    // Return a random valid combination or empty array
    return validCombinations.length > 0 ? 
        validCombinations[Math.floor(validCombinations.length * Math.random())] : 
        [];
}

function analyzeCombination(combination, targetValue) {
    const analysis = combination.reduce((acc, stamp) => {
        acc.sum += stamp.value;
        acc.count[stamp.face_value] = (acc.count[stamp.face_value] || 0) + 1;
        return acc;
    }, { sum: 0, count: {} });
    
    analysis.targetValue = targetValue;
    return analysis;
}

function meetsConstraints(analysis, combination) {
    // Check if sum matches target value
    const sumMatches = Math.round(analysis.sum) === Math.round(analysis.targetValue);
    
    // Check if we don't exceed available quantities
    const quantityValid = Object.keys(analysis.count).every(faceValue => {
        const stamp = combination.find(s => s.face_value === faceValue);
        return analysis.count[faceValue] <= stamp.number;
    });
    
    // Check if required stamp is included (if specified)
    const requiredStampIncluded = francobollo_da_usare ? 
        combination.some(stamp => stamp.face_value === francobollo_da_usare) : 
        true;
    
    return sumMatches && quantityValid && requiredStampIncluded;
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

// Form interaction handlers
const euroRadio = document.querySelector('#euro');
const lireRadio = document.querySelector('#lire');
const letterRadio = document.querySelector('#lettera');
const letterSelect = document.querySelector('#scegli-lettera');
const valueInputGroup = document.querySelector("#value-input-group");
const letterSelectGroup = document.querySelector("#letter-select-group");

// Handle radio button changes to show/hide letter selection vs value input
function handleCurrencyChange() {
    if (letterRadio.checked) {
        valueInputGroup.style.display = "none";
        letterSelectGroup.style.display = "block";
    } else {
        valueInputGroup.style.display = "block";
        letterSelectGroup.style.display = "none";
    }
}

// Add event listeners for currency type changes
euroRadio.addEventListener("change", handleCurrencyChange);
lireRadio.addEventListener("change", handleCurrencyChange);
letterRadio.addEventListener("change", handleCurrencyChange);

// Initialize the form state
handleCurrencyChange();

// Currency-specific input validation
const valueInput = document.querySelector("#valore");

// Update input attributes and validation based on currency type
function updateValueInputValidation() {
    if (lireRadio.checked) {
        // Lire: integers only
        valueInput.setAttribute("step", "1");
        valueInput.setAttribute("min", "1");
        valueInput.setAttribute("placeholder", "es. 400");
        valueInput.title = "Inserisci un valore intero in Lire";
    } else if (euroRadio.checked) {
        // Euro: up to 2 decimal places
        valueInput.setAttribute("step", "0.01");
        valueInput.setAttribute("min", "0.01");
        valueInput.setAttribute("placeholder", "es. 1.30");
        valueInput.title = "Inserisci un valore in Euro (massimo 2 decimali)";
    }
}

// Real-time input validation
valueInput.addEventListener("input", function() {
    const value = this.value;
    
    if (lireRadio.checked) {
        // For Lire: only integers
        if (value.includes(".") || value.includes(",")) {
            // Remove decimal places for Lire
            this.value = value.replace(/[.,].*/g, "");
            showMessage("I valori in Lire devono essere numeri interi", "error");
        }
    } else if (euroRadio.checked) {
        // For Euro: max 2 decimal places
        const parts = value.split(".");
        if (parts.length > 2) {
            // Multiple decimal points
            this.value = parts[0] + "." + parts[1];
        } else if (parts.length === 2 && parts[1].length > 2) {
            // More than 2 decimal places
            this.value = parts[0] + "." + parts[1].substring(0, 2);
            showMessage("I valori in Euro possono avere massimo 2 decimali", "error");
        }
    }
});

// Update input validation when currency changes
function handleCurrencyChangeWithValidation() {
    handleCurrencyChange(); // Call original function
    updateValueInputValidation();
    valueInput.value = ""; // Clear value when switching currency
}

// Replace the event listeners with the enhanced version
euroRadio.removeEventListener("change", handleCurrencyChange);
lireRadio.removeEventListener("change", handleCurrencyChange);
letterRadio.removeEventListener("change", handleCurrencyChange);

euroRadio.addEventListener("change", handleCurrencyChangeWithValidation);
lireRadio.addEventListener("change", handleCurrencyChangeWithValidation);
letterRadio.addEventListener("change", handleCurrencyChangeWithValidation);

// Initialize validation on page load
updateValueInputValidation();

// Form validation and user feedback functions
function showMessage(message, type = 'success') {
    const messagesDiv = document.querySelector('#form-messages');
    messagesDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 3000);
}

function validateForm() {
    const quantity = document.querySelector('#quantity').value;
    const value = document.querySelector('#valore').value;
    
    if (!quantity || quantity <= 0) {
        showMessage('Per favore inserisci una quantità valida (maggiore di 0)', 'error');
        return false;
    }
    
    if (quantity % 1 !== 0) {
        showMessage('La quantità deve essere un numero intero', 'error');
        return false;
    }
    
    if (!letterRadio.checked) {
        if (!value || value <= 0) {
            showMessage('Per favore inserisci un valore valido (maggiore di 0)', 'error');
            return false;
        }
        
        if (lireRadio.checked) {
            // Validate Lire: must be integer
            if (value.includes(".") || value.includes(",") || value % 1 !== 0) {
                showMessage("I valori in Lire devono essere numeri interi", "error");
                return false;
            }
            if (parseInt(value) < 1) {
                showMessage("Il valore in Lire deve essere almeno 1", "error");
                return false;
            }
        } else if (euroRadio.checked) {
            // Validate Euro: max 2 decimal places
            const euroValue = parseFloat(value);
            if (isNaN(euroValue) || euroValue < 0.01) {
                showMessage("Il valore in Euro deve essere almeno €0.01", "error");
                return false;
            }
            const decimals = value.split(".")[1];
            if (decimals && decimals.length > 2) {
                showMessage("I valori in Euro possono avere massimo 2 decimali", "error");
                return false;
            }
        }
    }
    
    if (letterRadio.checked && !letterSelect.value) {
        showMessage('Per favore seleziona un tipo di francobollo per lettera', 'error');
        return false;
    }
    
    return true;
}

// Collapsible section functionality
function toggleCollapse(contentId) {
    const content = document.getElementById(contentId);
    const legend = content.previousElementSibling;
    const icon = legend.querySelector('.collapse-icon');
    
    if (content.classList.contains('collapsed')) {
        // Expand
        content.classList.remove('collapsed');
        icon.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        // Collapse
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

// Custom value input functionality for calculation section
const otherRadio = DOM.postageRadios.other;
const customValueInput = DOM.customValueInput;

// Add event listeners to all radio buttons in calculation section
const postageRadios = document.querySelectorAll('input[name="money"]');
postageRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (otherRadio.checked) {
            customValueInput.style.display = 'block';
            customValueInput.focus();
        } else {
            customValueInput.style.display = 'none';
            customValueInput.value = '';
        }
    });
});

// Initialize the state on page load
if (otherRadio.checked) {
    customValueInput.style.display = 'block';
} else {
    customValueInput.style.display = 'none';
}

// Validation for custom value input
customValueInput.addEventListener('input', function() {
    const value = this.value;
    if (value && (isNaN(value) || value <= 0)) {
        this.style.borderColor = '#e53e3e';
    } else {
        this.style.borderColor = '#e2e8f0';
    }
});
