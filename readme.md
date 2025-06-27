# Stamp Calculator

This project is a web application that allows you to manage a collection of stamps and calculate combinations of stamps to achieve a desired postage value. The key features include:

## Adding Stamps
You can add stamps to your collection by specifying the currency (Euro, Lire, or a predefined letter denomination), the quantity, and the facial value. Clicking the "Add Stamps" button will add the specified stamps to your collection.

## Calculating Stamp Combinations 
You can calculate stamp combinations to achieve a target postage value. The application offers several postage categories:

- **Lettere Standard**: B, B Zona 1, B Zona 2, B Zona 3 (20g letters)
- **Lettere 50g**: B 50g, B Zona 1 50g, B Zona 2 50g, B Zona 3 50g (50g letters)
- **Posta Prioritaria**: A, A Zona 1, A Zona 2, A Zona 3 (priority mail with different weight limits)
- **Piego Libri**: 2kg and 5kg book packages
- **Valore Personalizzato**: Custom postage value

Select the desired postage category, specify the maximum number of stamps to use, and click "Calculate". The application will display possible stamp combinations that sum to the target value.

## Managing Your Stamp Collection
The application displays a table showing all the stamps in your collection, including the facial value, euro value, quantity, and total value for each stamp. You can remove stamps from your collection using the "Remove stamp" button for each row.

Summary statistics are shown, including the total number of stamps, total euro value, and number of unique denominations in your collection.

## Technical Details
The frontend is built with HTML, CSS, and JavaScript. Stamp data is stored in the browser's local storage so that it persists across sessions.

The key algorithm for calculating stamp combinations uses a recursive function to generate all possible combinations of stamps up to the maximum number specified, and then filters the combinations to find ones that exactly sum to the target value while respecting the available quantities of each stamp.

## Setup
To run the application locally:
1. Clone this repository 
2. Open index.html in a web browser

The application has been tested in modern versions of Chrome, Firefox, and Safari.
