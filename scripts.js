var model = [];

var tokens = [];

var gridDOM = document.querySelector('#hex-layer');        
var columns = gridDOM.children;

var rowCount = 0;

for (var i = 0; i < columns.length; i++) {

    model.push([]);                                     // create a new array for each column

    var rows = columns[i].children;

    rowCount = 0;

    for (var ii = 0; ii < rows.length; ii++) {

        var row = rows[ii];

        var type = row.getAttribute('data-type');

        model[i].push({});

        if (type !== 'desert' && type !== 'sea' && type !== 'spacer') {

            rowCount++;

            var id = (i + 1) + '-' + (rowCount + 1);            // adding 1 to i and ii lets us start counting at col 1 and row 1
            row.id = id;

            model[i][ii].id = id;
        }

        model[i][ii].type = type;
    }

}

function random(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function convertNodeListToArray(nodelist) {
    var arr = [].slice.call(nodelist);
    return arr;
}

function countHexesByType(type) {
    var count = 0;

    for (var i = 0; i < model.length; i++) {
        var column = model[i];
        for (var ii = 0; ii < column.length; ii++) {
            var row = column[ii];
            if (row.type === type) {
                count++;
            }
        }
    }

    return count;
}

function generateTokens(count) {            // remember that we need (number of hexes - 1) tokens (the desert doesn't get a token)
    var tokens = [];
    var baseTokens = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];

    var tokenChoices = baseTokens.slice();      // make an array of tokens to choose from by copying the array of base tokens

    for (var i = 0; i < count; i++) {

        if (tokenChoices.length === 0) {                    // if we run out of tokens to choose from
            tokenChoices = baseTokens;                          // replenish our token choices
        }

        var index = random(0, (tokenChoices.length - 1));   // randomly pick an index (using zero-based numbering)
        var token = tokenChoices[index];                    // locate the token at that index from our choices
        tokens.push(token);                                 // add that token to our tokens list
        tokenChoices.splice(index, 1);                      // remove that token from the choices
    }

    return tokens;
}

function assignTokensToHexes(tokens) {
    var rowCount = 0;
    
    for (var i = 0; i < model.length; i++) {
        var column = model[i];
        rowCount = 0;
        for (var ii = 0; ii < column.length; ii++) {
            var row = column[ii];
            if (row.type !== 'desert' && row.type !== 'sea' && row.type !== 'spacer') {
                rowCount++;
                var token = tokens.pop();                   // set the token equal to the last value in the array
                row.token = token;                          // assign the token in the model 
                //var id = (i + 1) + '-' + (rowCount);        // build the ID so we can select the appropriate element

                //if (!!document.getElementById(id)) {        // if this coordinate contains a valid hex type
                    document.getElementById(row.id).setAttribute('data-token', token);  // select the element and write the token value as an attribute
                //}
            }
        }
    }
}

//console.log(generateTokens(30));

var forestsCount = countHexesByType('forest');
var hillsCount = countHexesByType('hill');
var pasturesCount = countHexesByType('pasture');
var fieldsCount = countHexesByType('field');
var mountainsCount = countHexesByType('mountain');
var desertsCount = countHexesByType('desert');
var seasCount = countHexesByType('sea');
var spacersCount = countHexesByType('spacer');

var tokensCount = forestsCount + hillsCount + pasturesCount + fieldsCount + mountainsCount;

var tokens = generateTokens(tokensCount);
assignTokensToHexes(tokens);

console.log(model);