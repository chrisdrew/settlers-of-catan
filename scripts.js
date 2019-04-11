function initialize() {

    this.gameState = {
        setupStep: 1,
        whoseTurn: null,
        dice: {
            die1: '',
            die2: '',
            sum: '',
        },
    };

    this.oldGameState = {
        setupStep: 1,
        whoseTurn: null,
        dice: {
            die1: '',
            die2: '',
            sum: '',
        },
    };

    this.boardModel = [];
    this.myPlayer = {};
    this.otherPlayer = {};
    this.conn = null;

    initializeBoard();

} 

function initializeBoard() {

    mapBoard();

    var forestsCount = countHexesByType('forest', this.boardModel);
    var hillsCount = countHexesByType('hill', this.boardModel);
    var pasturesCount = countHexesByType('pasture', this.boardModel);
    var fieldsCount = countHexesByType('field', this.boardModel);
    var mountainsCount = countHexesByType('mountain', this.boardModel);
    var desertsCount = countHexesByType('desert', this.boardModel);
    var seasCount = countHexesByType('sea', this.boardModel);
    var spacersCount = countHexesByType('spacer', this.boardModel);

    var tokensCount = forestsCount + hillsCount + pasturesCount + fieldsCount + mountainsCount;     // count how many tokens we need

    var tokens = generateTokens(tokensCount);           // generate the appropriate number of tokens
    assignTokensToHexes(tokens);                        // randomly assign tokens to hexes

    console.log(this.boardModel);
}

function mapBoard() {       // create an object model of the game board

    var boardDOM = document.querySelector('#hex-layer');        
    var columns = boardDOM.children;

    var rowCount = 0;

    for (var i = 0; i < columns.length; i++) {

        this.boardModel.push([]);                                     // create a new array for each column

        var rows = columns[i].children;

        rowCount = 0;

        for (var ii = 0; ii < rows.length; ii++) {

            var row = rows[ii];

            var type = row.getAttribute('data-type');

            this.boardModel[i].push({});

            if (type !== 'desert' && type !== 'sea' && type !== 'spacer') {

                rowCount++;

                var id = (i + 1) + '-' + (rowCount + 1);            // adding 1 to i and ii lets us start counting at col 1 and row 1
                row.id = id;

                this.boardModel[i][ii].id = id;
            }

            this.boardModel[i][ii].type = type;
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

function countHexesByType(type) {
    var count = 0;

    for (var i = 0; i < this.boardModel.length; i++) {
        var column = this.boardModel[i];
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
    
    for (var i = 0; i < this.boardModel.length; i++) {
        var column = this.boardModel[i];
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

document.querySelector('#player1').onclick = function () {
    initializeMyPlayer('player1');
};

document.querySelector('#player2').onclick = function () {
    initializeMyPlayer('player2');
};

function initializeMyPlayer(name) {
    this.myPlayer.name = name;
    console.log('my player has been created as ' + this.myPlayer.name);
    initializeMyPeer();

    this.otherPlayer.name = name === 'player1' ? 'player2' : 'player1';
    document.querySelector('#' + name).disabled = true;
    document.querySelector('#' + this.otherPlayer.name).style.display = 'none';
    document.querySelector('#connect').disabled = false;
}

function initializeMyPeer() {
    this.myPeer = new Peer(this.myPlayer.name, {
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
        this.gameState.whoseTurn = 'player1';
        conn.on('data', function (data) {
            this.oldGameState = this.gameState;     // keep the old game state
            this.gameState = data;                  // get the new game state
            console.log(this.gameState);
            updateGameState();
        }.bind(this));
        console.log(this.otherPlayer.name + ' has connected to your game!');
        updateGameState();
    }.bind(this));
}

document.querySelector('#connect').onclick = function () {
    connectToPeer();
};

function connectToPeer() {
    this.conn = myPeer.connect(this.otherPlayer.name);

    if (this.conn) {
        this.conn.send(this.myPlayer.name + ' joined your game!');
        document.querySelector('#connect').disabled = true;
    }
}

function updateGameState() {                  // update the entire state of the game for this client

    updateDiceRoll();

    if (this.gameState.whoseTurn !== this.oldGameState.whoseTurn) {     // if it's someone else's turn

        if (this.gameState.whoseTurn === this.myPlayer.name) {              // if it's my turn
            UpdateUI(true);
        } else {                                                            // if it's the other player's turn
            UpdateUI(false)
        }

    }

}

/* ENDING A TURN AND SETTING UP FOR THE NEXT TURN */

document.querySelector('#end-turn').onclick = function () {
    endTurn();
};

function endTurn() {

    var currentPlayer = null;
    var nextPlayer = null;

    if (this.gameState.setupStep < 5) {

        switch (this.gameState.setupStep) {
            case 1:                                 // player 1 gets setup turn 1 of 4
            case 2:                                 // player 2 gets setup turn 2 of 4
                currentPlayer = 'player1';
                nextPlayer = 'player2';
                this.gameState.setupStep++;
                break;
            case 3:                                 // player 2 gets setup turn 3 of 4
            case 4:                                 // player 1 gets setup turn 4 of 4
                currentPlayer = 'player2';
                nextPlayer = 'player1';
                this.gameState.setupStep++;
                break;
        }
        
    } else {
        currentPlayer = this.myPlayer.name;
        nextPlayer = this.otherPlayer.name;
    }

    if (this.conn) {
        this.oldGameState.whoseTurn = currentPlayer;        // update the old game state to reflect that it was just my turn
        this.gameState.whoseTurn = nextPlayer;              // update the new game state to show that it's the other player's turn now
        console.log('you\'ve ended your turn');
        this.conn.send(this.gameState);
        updateGameState();
    }
}

function UpdateUI(isItMyTurn) {
    var elements = document.querySelectorAll('.disabled-until-my-turn');

    for (var i = 0; i < elements.length; i++) {
        elements[i].disabled = !isItMyTurn;          // enable all UI for the player whose turn it is and disable all UI for the other player
    }
}

/* DICE ROLLING STUFF */

document.querySelector('#roll-dice').onclick = function() {  
    rollDice();
};

function rollDice() {

    if (this.conn) {
        this.gameState.dice.die1 = random(1,6);
        this.gameState.dice.die2 = random(1,6);
        this.gameState.dice.sum = this.gameState.dice.die1 + this.gameState.dice.die2;
        console.log('dice roll: ' + this.gameState.dice.die1 + ' ' + this.gameState.dice.die2);
        this.conn.send(this.gameState);
        updateGameState();
        getActivatedHexes();
    }
}

function updateDiceRoll() {                 // update the dice roll for this client
    document.querySelector('#dice').innerHTML = this.gameState.dice.die1 + ' ' + this.gameState.dice.die2;
}