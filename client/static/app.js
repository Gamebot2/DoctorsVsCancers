window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
};

var globalPlayerId = 0;
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
    "Cervical": "C"
}

function enterGame() {
    var username = document.getElementById("userName").value;
    playerName = username;
    console.log(username);
    var url = "/entergame?name=" + username;

    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: url,
        success: function(data) {
            console.log(data)
            globalPlayerId = data;
        }
    })

    document.getElementById("waitMessage").style.display = "block";

    var id = setInterval(checkGame, 2000);

    function checkGame() {
        var checkURL = "/checkgame";
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: checkURL,
            success: function(data) {
                console.log(data)
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
                            console.log(data);

                            //Hide the form elements and show the game buttons
                            hideShowGame();
                            updateBoard(data);

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
            console.log("Response from endTurn: " + data)
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
                console.log("Respone from waitTurn: " + data)
                if (data["my_turn"] == "True") {
                    //Can stop waiting for turn
                    clearInterval(id);
                    enableButtons();
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
                console.log(inputOptions);
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
            console.log(data);
            if (data["man1_cancer_points"] != null) {
                updateBoardNotDeck(data);
                handlePlayEnd(cardIndex);
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
    console.log("Discard URL: " + discardURL);
    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: discardURL,
        success: function(data) {
            console.log(data);
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

    //Style card color depending on playerType
    var playerType = data["player_type"]
    setColors(playerType);

    updateBoardNotDeck(data);
    updateDeckSizes(data);
}

//Updates the state of the game board but not the deck in the player's hands
function updateBoardNotDeck(data) {
    var man1CancerPoints = data["man1_cancer_points"];
    var man2CancerPoints = data["man2_cancer_points"];
    var woman1CancerPoints = data["woman1_cancer_points"];
    var woman2CancerPoints = data["woman2_cancer_points"];

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

    updateEffects(data);

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

// Updates the two discard pile size categories
function updateDeckSizes(data) {
    var zombieString = "Zombie Discard Pile Size: <strong>" + data["zombie_discard_size"] + "</strong>";
    document.getElementById("zombieSize").innerHTML = zombieString;

    var doctorString = "Doctor Discard Pile Size: <strong>" + data["doctor_discard_size"] + "</strong";
    document.getElementById("doctorSize").innerHTML = doctorString;

    var zombieString2 = "Zombie Deck Size: <strong>" + data["zombie_deck_size"] + "</strong>";
    document.getElementById("zombieDeckSize").innerHTML = zombieString2;

    var doctorString2 = "Doctor Deck Size: <strong>" + data["doctor_deck_size"] + "</strong>";
    document.getElementById("doctorDeckSize").innerHTML = doctorString2;
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
    document.getElementById("playTable").style.display = "block";
    document.getElementById("humanTable").style.display = "block";
    document.getElementById("effectTable").style.display = "block";
    document.getElementById("playerInfo").style.display = "block";

    document.getElementById("gameHeading").style.display = "block";
    document.getElementById("card1Button").style.display = 'inline';
    document.getElementById("card2Button").style.display = 'inline';
    document.getElementById("card3Button").style.display = 'inline';
    document.getElementById("card4Button").style.display = 'inline';
    document.getElementById("card5Button").style.display = 'inline';
    document.getElementById("card6Button").style.display = 'inline';

    document.getElementById("card1Discard").style.display = 'inline';
    document.getElementById("card2Discard").style.display = 'inline';
    document.getElementById("card3Discard").style.display = 'inline';
    document.getElementById("card4Discard").style.display = 'inline';
    document.getElementById("card5Discard").style.display = 'inline';
    document.getElementById("card6Discard").style.display = 'inline';
}

function setColors(playerType) {
    if (playerType == "Zombie") {
        document.getElementById("card1Desc").style.color = "#ff0000";
        document.getElementById("card2Desc").style.color = "#ff0000";
        document.getElementById("card3Desc").style.color = "#ff0000";
        document.getElementById("card4Desc").style.color = "#ff0000";
        document.getElementById("card5Desc").style.color = "#ff0000";
        document.getElementById("card6Desc").style.color = "#ff0000";

        document.getElementById("playerInfo").style.color = "#ff0000";
        document.getElementById("playerInfo").innerHTML = playerName + ", you are a ZOMBIE";

    } else {
        document.getElementById("card1Desc").style.color = "#0000ff";
        document.getElementById("card2Desc").style.color = "#0000ff";
        document.getElementById("card3Desc").style.color = "#0000ff";
        document.getElementById("card4Desc").style.color = "#0000ff";
        document.getElementById("card5Desc").style.color = "#0000ff";
        document.getElementById("card6Desc").style.color = "#0000ff";

        document.getElementById("playerInfo").style.color = "#0000ff";
        document.getElementById("playerInfo").innerHTML = playerName + ", you are a DOCTOR";
    }
}
