var globalPlayerId = -1;
var playerDeck;
var playedCards = 0;
var playerName = "";
var zombieOrDoctor = "";
var enteredGame = 0;

var gameBodyId = "gameBody";

var cancerCodeMap = {
    "Lung": "L",
    "Breast": "B",
    "Prostate": "P",
    "Colon": "C",
    "Pancreatic": "N",
    "Mouth": "M",
    "Uterus/Ovary": "U",
    "Cervical": "R"
}


var cancerCards = [
    "Has Lung Cancer",
    "Has Breast Cancer",
    "Has Prostate Cancer",
    "Has Colon Cancer",
    "Has Pancreatic Cancer",
    "Has Mouth Cancer",
    "Has Uterus/Ovary Cancer",
    "Has Cervical Cancer"
]

//Store the specific card names that we need to color: the ones that show up in medical history
var cellFactorCards = []
var humanFactorCards = []
var majorAttackCards = []
var indirectAttackCards = []
var preemptionCards = []
var treatmentCards = []

//Stores the colors we use to color the cards on both the card table and the medical history
var color1 = "#c20020"; //Red
var color2 = "#dba40d"; //Orange
var color3 = "#c45f12"; //Dark Orange
var color4 = "#b0b021"; //Gold
var color5 = "#751ec7"; //Purple
var color6 = "#000eab"; //Blue

window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
};

window.onunload = function() {
    var url = "/leavegame?playerId=" + this.globalPlayerId;
    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: url,
        success: function(data) {}
    })
}

function showInstructions() {
    var instructions = "Enter the game and have somebody else do the same thing. When you both have the wait message, try hitting the start game button and play away!";
    bootbox.alert(instructions);
}

function showRules() {
    var message = "<p style='font-weight:bold;font-size:22px;margin-bottom:0px;'>Cancer Zombie Attack!</p><br> In this card game, players take the roles of cancer causing zombies or doctors, fighting for the humans’ lives. <ul><li>Zombie players must accumulate mutagen points to turn normal cells cancerous, then use those cancer cells to attack the humans.</li><li>Doctors must prevent or catch the cancer before it can go any further, or try to treat it after it has spread.</li><li>If the doctors save even one human they win the game.</li></ul>";
    message += "<strong>Basic gameplay</strong><br><ul><li>On their turn, each player plays cards from their hand (max 2 for zombies), then discards as many as they want, and then ends their turn.  New cards are then drawn so every turn starts with 6 cards.</li><li>There are 52 cards in each deck.  The game is over after the second time through the zombie deck, or if all humans die.</li></ul>";
    message += "<strong>Zombie gameplay:</strong><ul><li>There are two classes of zombie cards: Mutagens and Attacks. Mutagens are played on the humans before cancers, Attacks are played only after there is a cancer.</li><li>Each Mutagen card says how many points it adds towards a type of cancer.  Once the human has 4  points towards any specific cancer, they get that cancer.</li><li>After a human has a cancer, zombies play Attack cards.  There are two types, Major Attacks and Indirect Attacks.</li><li>If two Major Attacks are not treated, the human with the cancer dies.  The doctor has one turn to treat the second major attack before the human dies.</li></ul>";
    message += "<strong>Doctor Gameplay</strong><ul><li>There are two classes of doctor cards: Pre-Emption and Treatments. Pre-emption cards are played before the human has cancer, Treatments are played only after there is a cancer.</li><li>Most treatments respond to a specific attack and are played after that attack.</li><li>Note: Surgery or radiation is required to cure most cancers.  These cards are valuable and must be played before the cancer spreads.  If there is a Major Attack, that must be treated before the cancer can be removed.";
    bootbox.alert({
        message: message,
        size: 'large'
    });
}

function startGame() {
    var startURL = "/startgame";
    if (enteredGame == 0) {
        document.getElementById("startResponse").innerHTML = "Enter the game first!";
        return;
    }

    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: startURL,
        success: function(data) {
            if (data == "Odd players!") {
                document.getElementById("startResponse").innerHTML = "Uneven player number!";
            } else {
                //Start was a success
                document.getElementById("startResponse").innerHTML = "Loading...";
            }
        }
    })
}

function enterGame() {
    var username = document.getElementById("userName").value;
    if (username == "") {
        bootbox.alert("Make sure to enter a name!");
        return;
    }

    playerName = username;
    var url = "/entergame?name=" + username;


    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: url,
        success: function(data) {
            document.getElementById("submitButton").disabled = true;
            globalPlayerId = data;
            enteredGame = 1;
        }
    })

    document.getElementById("waitMessage").style.display = "block";

    var id = setInterval(checkGame, 2000);

    function checkGame() {
        var checkURL = "/checkgame?playerId=" + globalPlayerId;
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: checkURL,
            success: function(data) {
                if (data == "False") {
                    //Do Nothing
                } else {
                    clearInterval(id);
                    console.log("Beginning the game!")
                    var initURL = "/initgame?playerId=" + globalPlayerId;
                    $.ajax({
                        type: 'GET',
                        crossDomain: true,
                        url: initURL,
                        success: function(data) {
                            //data stores the dictionary that contains the card names and ids

                            //Hide the form elements and show the game buttons
                            hideShowGame();
                            updateBoard(data);

                            cellFactorCards = data["cell_factor_cards"]
                            humanFactorCards = data["human_factor_cards"];
                            majorAttackCards = data["major_attack_cards"];
                            indirectAttackCards = data["indirect_attack_cards"];
                            preemptionCards = data["preemption_cards"];
                            treatmentCards = data["treatment_cards"];

                            document.getElementById("opponent").innerHTML = "Playing against <strong>" + data["opponent"] + "</strong>!";

                            var isTurn = data["is_turn"];
                            if (isTurn == 1) {
                                //It's my turn
                            } else {
                                //It's not my turn: poll the server until it's my turn
                                waitForTurn();
                            }

                        }
                    })
                }
            }
        })
    }

}

function endTurn() {
    clearStatuses();
    playedCards = 0;
    var endTurnURL = "/endmyturn?playerId=" + globalPlayerId;
    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: endTurnURL,
        success: function(data) {
            checkReset(data);
            if (data['success'] == 1) {
                updateBoard(data);
                waitForTurn();
            } else {
                alert('Please Log in again');
            }
        }
    })
}

function waitForTurn() {
    disableButtons();
    var id = setInterval(checkForTurn, 2500);

    function checkForTurn() {
        var checkURL = "/checkmyturn?playerId=" + globalPlayerId;
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: checkURL,
            success: function(data) {

                if (data == "Reset") {
                    clearInterval(id);
                }

                if (data["my_turn"] == "True") {
                    //Can stop waiting for turn
                    clearInterval(id);
                    enableButtons();
                }

                if (data["winner"] >= 0) {
                    clearInterval(id);
                }
                updateBoard(data);
            }
        })
    }
}

function playCard(cardIndex) {
    var card = playerDeck[cardIndex];
    var cardId = card[0];
    var humanCardId = 0;

    //TODO: Filter human options based on 
    // -Whether or not they're dead
    // -Whether or not they have an applicable cancer

    bootbox.prompt({
        title: "Cancer type selection",
        message: '<p>Please select an option below:</p>',
        inputType: 'radio',
        inputOptions: [{
            text: "Liam",
            value: 0
        }, {
            text: "Noah",
            value: 1
        }, {
            text: "Emma",
            value: 2
        }, {
            text: "Ava",
            value: 3
        }],
        callback: function(result) {
            if (result === null) return;

            humanCardId = result;
            var specifier = '';

            var options = card[3]
            if (options.length > 1) {
                //Need to prompt the user for what specific cancer they would like to play the card for
                var inputOptions = []
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    var code = cancerCodeMap[option];
                    var toAdd = { text: option, value: code };
                    if (canGetCancer(humanCardId, option)) {
                        inputOptions.push(toAdd);
                    }
                }
                if (inputOptions.length == 0) {
                    //No available options for this human
                    returnNoOptions();
                    return;
                }

                bootbox.prompt({
                    title: "Cancer type selection",
                    message: '<p>Please select an option below:</p>',
                    inputType: 'radio',
                    inputOptions: inputOptions,
                    callback: function(result) {
                        if (result === null) return;
                        //Result here stores the exact specifier we need
                        specifier = result;
                        sendPlayRequest(cardId, humanCardId, specifier, cardIndex);
                    }
                });
            } else if (options.length == 1) {
                //Either any (special case) or there's one option 
                var oneOption = options[0]
                if (oneOption == "Any") {
                    //Need to give the any dialog
                    var inputOptions = []
                    for (var option in cancerCodeMap) {
                        var code = cancerCodeMap[option];
                        var toAdd = { text: option, value: code };
                        if (canGetCancer(humanCardId, option)) {
                            inputOptions.push(toAdd);
                        }
                    }

                    bootbox.prompt({
                        title: "Cancer type selection",
                        message: '<p>Please select an option below:</p>',
                        inputType: 'radio',
                        inputOptions: inputOptions,
                        callback: function(result) {
                            if (result === null) return;
                            //Result here stores the exact specifier we need
                            specifier = result;
                            sendPlayRequest(cardId, humanCardId, specifier, cardIndex);
                        }
                    });
                } else {
                    specifier = cancerCodeMap[oneOption]
                    if (!canGetCancer(humanCardId, oneOption)) {
                        returnNoOptions();
                        return;
                    }
                    sendPlayRequest(cardId, humanCardId, specifier, cardIndex);
                }
            } else {
                //No options
                sendPlayRequest(cardId, humanCardId, specifier, cardIndex);
            }
        }
    });

}

function canGetCancer(humanCardId, option) {
    if (humanCardId == 0 || humanCardId == 1) { //Man
        if (option == "Breast" || option == "Uterus/Ovary" || option == "Cervical") {
            return false;
        }
    }

    if (humanCardId == 2 || humanCardId == 3) { //Woman
        if (option == "Prostate") {
            return false;
        }
    }
    return true;
}

function returnNoOptions() {
    bootbox.alert("This human can't get that cancer!");
}

function sendPlayRequest(cardId, humanCardId, specifier, cardIndex) {
    var playURL = "/playcard?playerId=" + globalPlayerId + "&cardId=" + cardId + "&humanCardId=" + humanCardId + "&specifier=" + specifier;
    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: playURL,
        success: function(data) {
            if (data == "Reset") {
                bootbox.alert("Please refresh and log in again.");
                return;
            }
            if (data["man1_cancer_points"] != null) {
                updateBoardNotDeck(data);
                handlePlayEnd(cardIndex);
                checkVictory(data);
            } else {
                bootbox.alert(data);
                return;
            }
        }
    })
}

//Handles the end of the play command: what to do after a successful response
function handlePlayEnd(cardIndex) {
    //Card has finished being played: now need to disable card controls, display a played message, and count played cards
    playedCards++;

    if (playedCards == 2 && zombieOrDoctor == "Zombie") {
        disablePlayButtons();
    }

    if (playedCards == 6 && zombieOrDoctor == "Doctor") {
        disablePlayButtons();
    }

    buttonLabel = cardIndex + 1;
    playButtonId = "card" + buttonLabel + "Button";
    discardButtonId = "card" + buttonLabel + "Discard";
    statusId = "card" + buttonLabel + "Status";

    document.getElementById(playButtonId).disabled = true;
    document.getElementById(discardButtonId).disabled = true;
    document.getElementById(statusId).innerHTML = "(Played)";
}

function discardCard(cardIndex) {
    var card = playerDeck[cardIndex];
    var cardId = card[0];

    var discardURL = "/discardcard?playerId=" + globalPlayerId + "&cardId=" + cardId;
    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: discardURL,
        success: function(data) {
            updateBoardNotDeck(data);
            handleDiscardEnd(cardIndex);
        }
    })

}

//Handles the aftermath of discarding a card on the client side
function handleDiscardEnd(cardIndex) {
    buttonLabel = cardIndex + 1;
    playButtonId = "card" + buttonLabel + "Button";
    discardButtonId = "card" + buttonLabel + "Discard";
    statusId = "card" + buttonLabel + "Status";

    document.getElementById(playButtonId).disabled = true;
    document.getElementById(discardButtonId).disabled = true;
    document.getElementById(statusId).innerHTML = "(Discarded)";
}

//Updates the state of the game board in correspondence with the client data passed from server
function updateBoard(data) {

    checkReset(data);

    //Just updates the deck and lets next function do the rest
    var deck = data["player_deck"]
    playerDeck = deck;

    //Populate the player's card information
    for (var i = 1; i <= 6; i++) {
        var titleId = "card" + i + "Title";
        document.getElementById(titleId).innerHTML = deck[i - 1][1];

        var descriptionId = "card" + i + "Desc";
        document.getElementById(descriptionId).innerHTML = deck[i - 1][2];

        var typeId = "card" + i + "Type";
        document.getElementById(typeId).innerHTML = deck[i - 1][4];

        var noteId = "card" + i + "Notes";
        document.getElementById(noteId).innerHTML = deck[i - 1][5];

        colorByType(titleId, descriptionId, typeId, noteId, deck[i - 1][4]);
    }


    //Style heading color depending on playerType
    var playerType = data["player_type"]
    setColors(playerType);

    updateBoardNotDeck(data);
}

//Updates the state of the game board but not the deck in the player's hands
function updateBoardNotDeck(data) {

    checkReset(data);
    checkVictory(data);

    var man1CancerPoints = data["man1_cancer_points"];
    var man2CancerPoints = data["man2_cancer_points"];
    var woman1CancerPoints = data["woman1_cancer_points"];
    var woman2CancerPoints = data["woman2_cancer_points"];

    document.getElementById("gameAnnouncement").innerHTML = "Note: " + data["announcement"];
    document.getElementById("zombieDeckSize").innerHTML = "Zomb Deck: <strong>" + data["deck_sizes"][0] + "</strong>";
    document.getElementById("doctorDeckSize").innerHTML = "Doc Deck: <strong>" + data["deck_sizes"][1] + "</strong>";
    document.getElementById("zombieDiscardSize").innerHTML = "Zomb Discard: <strong>" + data["deck_sizes"][2] + "</strong>";
    document.getElementById("doctorDiscardSize").innerHTML = "Doc Discard: <strong>" + data["deck_sizes"][3] + "</strong>";


    for (var i = 0; i < 8; i++) {
        var id0 = "0points" + i;
        updateBasedOnValueMan(id0, man1CancerPoints, i);

        var id1 = "1points" + i;
        updateBasedOnValueMan(id1, man2CancerPoints, i);

        var id2 = "2points" + i;
        updateBasedOnValueWoman(id2, woman1CancerPoints, i);

        var id3 = "3points" + i;
        updateBasedOnValueWoman(id3, woman2CancerPoints, i);
    }

    updateCardNames(data);
}

// Updates the card names divs with the given data
function updateCardNames(data) {

    var man1Cards = data["man1_effects"];
    var newHTML = "<strong>Liam: </strong>";
    for (var i = 0; i < man1Cards.length; i++) {
        var cardName = man1Cards[i];
        cardName = modifyCardName(cardName, 0);
        newHTML = newHTML + cardName;
        if (i < man1Cards.length - 1) {
            newHTML = newHTML + " | ";
        }
    }
    document.getElementById("man1Cards").innerHTML = newHTML;

    var man2Cards = data["man2_effects"];
    var newHTML = "<strong>Noah: </strong>";
    for (var i = 0; i < man2Cards.length; i++) {
        var cardName = man2Cards[i];
        cardName = modifyCardName(cardName, 1);
        newHTML = newHTML + cardName;
        if (i < man2Cards.length - 1) {
            newHTML = newHTML + " | ";
        }
    }
    document.getElementById("man2Cards").innerHTML = newHTML;

    var woman1Cards = data["woman1_effects"];
    var newHTML = "<strong>Emma: </strong>";
    for (var i = 0; i < woman1Cards.length; i++) {
        var cardName = woman1Cards[i];
        cardName = modifyCardName(cardName, 2);
        newHTML = newHTML + cardName;
        if (i < woman1Cards.length - 1) {
            newHTML = newHTML + " | ";
        }
    }
    document.getElementById("woman1Cards").innerHTML = newHTML;

    var woman2Cards = data["woman2_effects"];
    var newHTML = "<strong>Ava: </strong>";
    for (var i = 0; i < woman2Cards.length; i++) {
        var cardName = woman2Cards[i];
        cardName = modifyCardName(cardName, 3);
        newHTML = newHTML + cardName;
        if (i < woman2Cards.length - 1) {
            newHTML = newHTML + " | ";
        }
    }
    document.getElementById("woman2Cards").innerHTML = newHTML;

}


function clearStatuses() {
    for (i = 1; i <= 6; i++) {
        id = "card" + i + "Status";
        document.getElementById(id).innerHTML = "";
    }
}

function enableButtons() {
    var buttons = document.querySelectorAll('button');
    for (i = 0; i < buttons.length; i++) {
        button = buttons[i];
        button.disabled = false;
    }
}

function disableButtons() {
    var buttons = document.querySelectorAll('button');
    for (i = 0; i < buttons.length; i++) {
        button = buttons[i];
        button.disabled = true;
    }
}

function disablePlayButtons() {
    for (i = 1; i <= 6; i++) {
        id = "card" + i + "Button";
        document.getElementById(id).disabled = true;
    }
}

function hideShowGame() {
    document.getElementById("enterForm").style.display = "none";
    document.getElementById("waitMessage").style.display = "none";
    document.getElementById("homeScreen").style.display = "none";
    document.getElementById(gameBodyId).style.display = "block";
}

function setColors(playerType) {
    if (playerType == "Zombie") {
        document.getElementById("playerInfo").style.color = "#ff0000";
        document.getElementById("playerInfo").innerHTML = playerName + ", you are a ZOMBIE";
        zombieOrDoctor = "Zombie";
    } else {
        document.getElementById("playerInfo").style.color = "#0000ff";
        document.getElementById("playerInfo").innerHTML = playerName + ", you are a DOCTOR";
        zombieOrDoctor = "Doctor";
    }
}

function checkVictory(data) {
    if (data["winner"] >= 0) {
        if (data["winner"] == globalPlayerId) {
            // We won
            document.getElementById(gameBodyId).style.display = "none";
            if (zombieOrDoctor == "Zombie") {
                document.getElementById("zombieScreen").style.display = "block";
            } else {
                document.getElementById("doctorScreen").style.display = "block";
            }

            //document.getElementById("victoryMessage").innerHTML = "Congrats " + playerName + ", you won!";
        } else {
            // We lost
            document.getElementById(gameBodyId).style.display = "none";
            if (data["player_type"] == "Zombie") {
                document.getElementById("doctorScreen").style.display = "block";
            } else {
                document.getElementById("zombieScreen").style.display = "block";
            }
            //document.getElementById("defeatMessage").innerHTML = "Sorry " + playerName + ", you lost.";
        }

        return 1;
    }
    return 0;
}

function checkReset(data) {
    if (data == "Reset") {
        console.log(data);
        bootbox.alert("Games have been reset: please refresh and log in again!");
    }
}

//Colors the element with titleId using the minor type as a conditional
function colorByType(titleId, descriptionId, typeId, noteId, minor_type) {
    var color = "";
    if (minor_type == "MUTAGEN-CELL FACTOR") {
        color = color1;
    } else if (minor_type == "MUTAGEN-HUMAN FACTOR") {
        color = color2;
    } else if (minor_type == "MAJOR ATTACK") {
        color = color3;
    } else if (minor_type == "INDIRECT ATTACK") {
        color = color4;
    }

    if (minor_type == "PRE-EMPTION") {
        color = color5;
    } else if (minor_type == "TREATMENT") {
        color = color6;
    }

    document.getElementById(titleId).style.color = color;
    document.getElementById(descriptionId).style.color = color;
    document.getElementById(typeId).style.color = color;
    document.getElementById(noteId).style.color = color;
}

function modifyCardName(cardName, id) {
    if (cancerCards.includes(cardName)) {
        return "<p class='warningCard'>" + cardName + "</p>";
    }

    if (cardName == "Healthy") {
        return cardName;
    }

    if (cellFactorCards.includes(cardName)) {
        return "<p style='display:inline;color:" + color1 + ";'>" + cardName + "</p>";
    }
    if (humanFactorCards.includes(cardName)) {
        return "<p style='display:inline;color:" + color2 + ";'>" + cardName + "</p>";
    }
    if (majorAttackCards.includes(cardName)) {
        return "<p style='display:inline;color:" + color3 + ";'>" + cardName + "</p>";
    }
    if (indirectAttackCards.includes(cardName)) {
        return "<p style='display:inline;color:" + color4 + ";'>" + cardName + "</p>";
    }
    if (preemptionCards.includes(cardName)) {
        return "<p style='display:inline;color:" + color5 + ";'>" + cardName + "</p>";
    }
    if (treatmentCards.includes(cardName)) {
        return "<p style='display:inline;color:" + color6 + ";'>" + cardName + "</p>";
    }

    if (cardName == "Dead") {
        markDead(id);
    }

    return cardName;
}

function markDead(id) {
    var humanId = "human" + id;
    document.getElementById(humanId).style.textDecoration = "line-through";

    for (var i = 0; i < 8; i++) {
        var actualId = id + "points" + i;
        document.getElementById(actualId).style.backgroundColor = "#a63f55";
        document.getElementById(actualId).innerHTML = "";
    }
}

function updateBasedOnValueMan(id, cancerPoints, i) {
    if (cancerPoints[i] != 0) {
        document.getElementById(id).innerHTML = cancerPoints[i];
        document.getElementById(id).style.backgroundColor = "#ffffff";
        if (cancerPoints[i] >= 4) {
            document.getElementById(id).style.backgroundColor = "#a63f55";
        }
    } else {
        document.getElementById(id).innerHTML = "";
        document.getElementById(id).style.backgroundColor = "#cccccc";
        if (i == 1 || i == 6 || i == 7) {
            document.getElementById(id).style.backgroundColor = "#666666";
        }
    }
}

function updateBasedOnValueWoman(id, cancerPoints, i) {
    if (cancerPoints[i] != 0) {
        document.getElementById(id).innerHTML = cancerPoints[i];
        document.getElementById(id).style.backgroundColor = "#ffffff";
        if (cancerPoints[i] >= 4) {
            document.getElementById(id).style.backgroundColor = "#a63f55";
        }
    } else {
        document.getElementById(id).innerHTML = "";
        document.getElementById(id).style.backgroundColor = "#cccccc";
        if (i == 2) {
            document.getElementById(id).style.backgroundColor = "#666666";
        }
    }
}