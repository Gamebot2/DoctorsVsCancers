var playersIn = [];

function startGames() {
    var startGamesURL = "/startgame";
    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: startGamesURL,
        success: function(data) {
            setNameData(data);
        }
    })
}

function resetGames() {
    var resetGamesURL = "/reset_games";
    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: resetGamesURL,
        success: function(data) {
            setNameData(data);
        }
    })
}

function setNameData(data) {
    setArrayData(data["matched_players"], "matchedNames", "Currently Playing");
    setArrayData(data["unmatched_players"], "unmatchedNames", "In Lobby");
}

//Sets the innerHTML of the element w/ ID to a toString version of the array
function setArrayData(array, id, label) {
    document.getElementById(id).innerHTML = label + ": " + array.join(", ");
}

var id = setInterval(updateLobbyState, 3000);

function updateLobbyState() {
    var lobbyURL = "/lobbystate";
    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: lobbyURL,
        success: function(data) {
            setNameData(data);
        }
    })
}