function initialize() {

    var boardModel = [];
    this.myPlayer = {};
    this.conn = null;

    initializeBoard(boardModel);
    initializeMyPlayer(myPlayer);
    initializeMyPeer(myPlayer);

} 

function initializeBoard(boardModel) {

    mapBoard(boardModel);

    var forestsCount = countHexesByType('forest', boardModel);
    var hillsCount = countHexesByType('hill', boardModel);
    var pasturesCount = countHexesByType('pasture', boardModel);
    var fieldsCount = countHexesByType('field', boardModel);
    var mountainsCount = countHexesByType('mountain', boardModel);
    var desertsCount = countHexesByType('desert', boardModel);
    var seasCount = countHexesByType('sea', boardModel);
    var spacersCount = countHexesByType('spacer', boardModel);

    var tokensCount = forestsCount + hillsCount + pasturesCount + fieldsCount + mountainsCount;     // count how many tokens we need

    var tokens = generateTokens(tokensCount);           // generate the appropriate number of tokens
    assignTokensToHexes(tokens, boardModel);            // randomly assign tokens to hexes

    console.log(boardModel);
}

function mapBoard(boardModel) {       // create an object model of the game board

    var boardDOM = document.querySelector('#hex-layer');        
    var columns = boardDOM.children;

    var rowCount = 0;

    for (var i = 0; i < columns.length; i++) {

        boardModel.push([]);                                     // create a new array for each column

        var rows = columns[i].children;

        rowCount = 0;

        for (var ii = 0; ii < rows.length; ii++) {

            var row = rows[ii];

            var type = row.getAttribute('data-type');

            boardModel[i].push({});

            if (type !== 'desert' && type !== 'sea' && type !== 'spacer') {

                rowCount++;

                var id = (i + 1) + '-' + (rowCount + 1);            // adding 1 to i and ii lets us start counting at col 1 and row 1
                row.id = id;

                boardModel[i][ii].id = id;
            }

            boardModel[i][ii].type = type;
        }

    }
}

function random(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function convertNodeListToArray(nodelist) {
    var arr = [].slice.call(nodelist);
    return arr;
}

function countHexesByType(type, boardModel) {
    var count = 0;

    for (var i = 0; i < boardModel.length; i++) {
        var column = boardModel[i];
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

function assignTokensToHexes(tokens, boardModel) {
    var rowCount = 0;
    
    for (var i = 0; i < boardModel.length; i++) {
        var column = boardModel[i];
        rowCount = 0;
        for (var ii = 0; ii < column.length; ii++) {
            var row = column[ii];
            if (row.type !== 'desert' && row.type !== 'sea' && row.type !== 'spacer') {
                rowCount++;
                var token = tokens.pop();                   // set the token equal to the last value in the array
                row.token = token;                          // assign the token in the boardModel 
                //var id = (i + 1) + '-' + (rowCount);        // build the ID so we can select the appropriate element

                //if (!!document.getElementById(id)) {        // if this coordinate contains a valid hex type
                    document.getElementById(row.id).setAttribute('data-token', token);  // select the element and write the token value as an attribute
                //}
            }
        }
    }
}

function initializeMyPlayer(myPlayer) {
    var name = prompt('Enter your name:');
    myPlayer.name = name;
}

function initializeMyPeer(myPlayer) {
    this.myPeer = new Peer(myPlayer.name, {
        key: 'lwjd5qra8257b9',
        config: {'iceServers': [
            {
                url: 'stun:stun.l.google.com:19302'
            },
            {
                url: 'turn:turn.bistri.com:80',
                username: 'homeo',
                credential: 'homeo'
            }
        ]}
    });

    this.myPeer.on('open', function () {
        console.info('my peer has been initialized');
        initializeConnection();
    });
}

function initializeConnection() {
    this.myPeer.on('connection', function (conn) {
        conn.on('data', function (data) {
            alert(data);
        });
        console.log('peer connection established')
    });
}

document.querySelector('#connect').onclick = function () {
    connectToPeer(this.myPlayer);
}.bind(this);

function connectToPeer(myPlayer) {
    var otherPlayer = prompt('Join a player:');
    this.conn = this.myPeer.connect(otherPlayer);

    this.conn.on('open', function () {
        this.conn.send(this.myPlayer.name + ' joined your game!');
    }.bind(this));
}

document.querySelector('#ping').onclick = function () {
    ping(this.conn);
}.bind(this);

function ping(conn) {
    if (conn) {
        conn.send('pinged by ' + this.myPlayer.name);
    }
}