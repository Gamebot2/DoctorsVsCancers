var globalPlayerId = -1;
var playerDeck;
var playedCards = 0;
var playerName = "";

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


function enterGame() {
    var username = document.getElementById("userName").value;
    playerName = username;
    var url = "/entergame?name=" + username;


    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: url,
        success: function(data) {
            document.getElementById("submitButton").disabled = true;
            globalPlayerId = data;
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
            if (data['success'] == 1) {
                updateBoard(data);
                waitForTurn();
            } else {
                alert('WHYYYYYYYYY');
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
            text: "Man 1",
            value: 0
        }, {
            text: "Man 2",
            value: 1
        }, {
            text: "Woman 1",
            value: 2
        }, {
            text: "Woman 2",
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

    if (playedCards == 2) {
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

    //Just updates the deck and lets next function do the rest
    var deck = data["player_deck"]
    playerDeck = deck;

    //Populate the card titles row
    document.getElementById("card1Title").innerHTML = deck[0][1];
    document.getElementById("card2Title").innerHTML = deck[1][1];
    document.getElementById("card3Title").innerHTML = deck[2][1];
    document.getElementById("card4Title").innerHTML = deck[3][1];
    document.getElementById("card5Title").innerHTML = deck[4][1];
    document.getElementById("card6Title").innerHTML = deck[5][1];

    //Populate the card descriptions
    document.getElementById("card1Desc").innerHTML = deck[0][2];
    document.getElementById("card2Desc").innerHTML = deck[1][2];
    document.getElementById("card3Desc").innerHTML = deck[2][2];
    document.getElementById("card4Desc").innerHTML = deck[3][2];
    document.getElementById("card5Desc").innerHTML = deck[4][2];
    document.getElementById("card6Desc").innerHTML = deck[5][2];

    //Populate the card types
    for (var i = 1; i <= 6; i++) {
        var type = "card" + i + "Type";
        document.getElementById(type).innerHTML = deck[i - 1][4];

        var titleId = "card" + i + "Title";
        var descriptionId = "card" + i + "Desc";
        colorByType(titleId, descriptionId, deck[i - 1][4]);
    }


    //Style card color depending on playerType
    var playerType = data["player_type"]
    setColors(playerType);

    updateBoardNotDeck(data);
}

//Updates the state of the game board but not the deck in the player's hands
function updateBoardNotDeck(data) {

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
        if (man1CancerPoints[i] != 0) {
            document.getElementById(id0).innerHTML = man1CancerPoints[i];
            document.getElementById(id0).style.backgroundColor = "#ffffff";

        } else {
            document.getElementById(id0).innerHTML = "";
            document.getElementById(id0).style.backgroundColor = "#cccccc";
            if (i == 1 || i == 6 || i == 7) {
                document.getElementById(id0).style.backgroundColor = "#666666";
            }
        }

        var id1 = "1points" + i;
        if (man2CancerPoints[i] != 0) {
            document.getElementById(id1).innerHTML = man2CancerPoints[i];
            document.getElementById(id1).style.backgroundColor = "#ffffff";

        } else {
            document.getElementById(id1).innerHTML = "";
            document.getElementById(id1).style.backgroundColor = "#cccccc";
            if (i == 1 || i == 6 || i == 7) {
                document.getElementById(id1).style.backgroundColor = "#666666";
            }
        }

        var id2 = "2points" + i;
        if (woman1CancerPoints[i] != 0) {
            document.getElementById(id2).innerHTML = woman1CancerPoints[i];
            document.getElementById(id2).style.backgroundColor = "#ffffff";
        } else {
            document.getElementById(id2).innerHTML = "";
            document.getElementById(id2).style.backgroundColor = "#cccccc";
            if (i == 2) {
                document.getElementById(id2).style.backgroundColor = "#666666";
            }
        }

        var id3 = "3points" + i;
        if (woman2CancerPoints[i] != 0) {
            document.getElementById(id3).innerHTML = woman2CancerPoints[i];
            document.getElementById(id3).style.backgroundColor = "#ffffff";
        } else {
            document.getElementById(id3).innerHTML = "";
            document.getElementById(id3).style.backgroundColor = "#cccccc";
            if (i == 2) {
                document.getElementById(id3).style.backgroundColor = "#666666";
            }
        }
    }

    //updateEffects(data);
    updateCardNames(data);

}

//Colors the element with titleId using the minor type as a conditional
function colorByType(titleId, descriptionId, minor_type) {
    var color = "";
    if (minor_type == "MUTAGEN-CELL FACTOR") {
        color = "#ff0000";
    } else if (minor_type == "MUTAGEN-HUMAN FACTOR") {
        color = "00ff00";
    } else if (minor_type == "MAJOR ATTACK") {
        color = "0000ff";
    } else if (minor_type == "INDIRECT ATTACK") {
        color = "ff00ff";
    }

    if (minor_type == "PRE-EMPTION") {
        color = "ff0000";
    } else if (minor_type == "TREATMENT") {
        color = "0000ff";
    }

    console.log(document.getElementById(descriptionId).innerHTML);

    document.getElementById(titleId).style.color = color;
    document.getElementById(descriptionId).style.color = color;
}


//Updates the effect board with the data provided
function updateEffects(data) {
    var man1Effects = data["man1_effects"];
    var man1EffectString = "Man 1: ";
    for (var i = 0; i < man1Effects.length; i++) {
        man1EffectString += man1Effects[i];
        if (i != man1Effects.length - 1) {
            man1EffectString += ", ";
        }
    }
    document.getElementById("man1Effects").innerHTML = man1EffectString;

    var man2Effects = data["man2_effects"];
    var man2EffectString = "Man 2: ";
    for (var i = 0; i < man2Effects.length; i++) {
        man2EffectString += man2Effects[i];
        if (i != man2Effects.length - 1) {
            man2EffectString += ", ";
        }
    }
    document.getElementById("man2Effects").innerHTML = man2EffectString;

    var woman1Effects = data["woman1_effects"];
    var woman1EffectString = "Woman 1: ";
    for (var i = 0; i < woman1Effects.length; i++) {
        woman1EffectString += woman1Effects[i];
        if (i != woman1Effects.length - 1) {
            woman1EffectString += ", ";
        }
    }
    document.getElementById("woman1Effects").innerHTML = woman1EffectString;

    var woman2Effects = data["woman2_effects"];
    var woman2EffectString = "Woman 2: ";
    for (var i = 0; i < woman2Effects.length; i++) {
        woman2EffectString += woman2Effects[i];
        if (i != woman2Effects.length - 1) {
            woman2EffectString += ", ";
        }
    }
    document.getElementById("woman2Effects").innerHTML = woman2EffectString;
}

// Updates the card names divs with the given data
function updateCardNames(data) {

    var man1Cards = data["man1_effects"];
    var newHTML = "<strong>Man1: </strong>";
    for (var i = 0; i < man1Cards.length; i++) {
        var cardName = man1Cards[i];
        newHTML = newHTML + cardName;
        if (i < man1Cards.length - 1) {
            newHTML = newHTML + " | ";
        }
    }
    document.getElementById("man1Cards").innerHTML = newHTML;

    var man2Cards = data["man2_effects"];
    var newHTML = "<strong>Man2: </strong>";
    for (var i = 0; i < man2Cards.length; i++) {
        var cardName = man2Cards[i];
        newHTML = newHTML + cardName;
        if (i < man2Cards.length - 1) {
            newHTML = newHTML + " | ";
        }
    }
    document.getElementById("man2Cards").innerHTML = newHTML;

    var woman1Cards = data["woman1_effects"];
    var newHTML = "<strong>Wmn1: </strong>";
    for (var i = 0; i < woman1Cards.length; i++) {
        var cardName = woman1Cards[i];
        newHTML = newHTML + cardName;
        if (i < woman1Cards.length - 1) {
            newHTML = newHTML + " | ";
        }
    }
    document.getElementById("woman1Cards").innerHTML = newHTML;

    var woman2Cards = data["woman2_effects"];
    var newHTML = "<strong>Wmn2: </strong>";
    for (var i = 0; i < woman2Cards.length; i++) {
        var cardName = woman2Cards[i];
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
    document.getElementById("gameBody").style.display = "block";
}

function setColors(playerType) {
    if (playerType == "Zombie") {
        document.getElementById("playerInfo").style.color = "#ff0000";
        document.getElementById("playerInfo").innerHTML = playerName + ", you are a ZOMBIE";
    } else {
        document.getElementById("playerInfo").style.color = "#0000ff";
        document.getElementById("playerInfo").innerHTML = playerName + ", you are a DOCTOR";
    }
}

function checkVictory(data) {
    if (data["winner"] >= 0) {
        if (data["winner"] == globalPlayerId) {
            // We won
            console.log("GG I WON!!!!!");
            document.getElementById("gameBody").style.display = "none";
            document.getElementById("victoryScreen").style.display = "block";
            if (data["player_type"] == "Zombie") {
                document.getElementById("victoryScreen").backgroundColor = "#a83246";
            } else {
                document.getElementById("victoryScreen").backgroundColor = "#3257a8";
            }

            document.getElementById("victoryMessage").innerHTML = "Congrats " + playerName + ", you won!";
        } else {
            // We lost
            console.log("OH SHIT I LOST!!!!");
            document.getElementById("gameBody").style.display = "none";
            document.getElementById("defeatScreen").style.display = "block";
            if (data["player_type"] == "Zombie") {
                document.getElementById("defeatScreen").backgroundColor = "#a83246";
            } else {
                document.getElementById("defeatScreen").backgroundColor = "#3257a8";
            }
            document.getElementById("defeatMessage").innerHTML = "Sorry " + playerName + ", you lost.";
        }

        return 1;
    }
    return 0;
}