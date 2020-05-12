from flask import Flask, render_template, send_file, Response, request, jsonify
from game import Game
from player import Player
from flask_cors import CORS
import os
import random

app = Flask(__name__, static_url_path='/static', static_folder=os.path.join("../","client","static"))
CORS(app)

all_players = [] # Array of all player objects period
players_unmatched = []  # Array of all player objects that are not yet matched
players_matched = [] #Array of players that have been matched
games = []  # Array that contains game objects
games_started = []


@app.route('/', methods=['GET'])
def render_index():
    return send_file(os.path.join("../","client","index.html"))

@app.route('/background')
def get_background():
    return send_file(os.path.join("../","client","assets","homescreenbackground.png"))

# Adds a new player to the lobby (requires the url parameter to start the game for)
@app.route('/entergame', methods = ['POST'])
def enter_game():
    id = getID()
    name = request.args['name']
    p = Player(id, name)
    all_players.append(p)
    players_unmatched.append(p)

    print_players()
    print('Player ' + str(len(all_players)-1) + ' has entered the game')
    return str(id)

# Begins the game by pairing off all players and initializing the game array
@app.route('/startgame')
def start_game():

    if(len(players_unmatched) % 2 == 1):
        return "Odd players!"

    player_names = []

    # random.shuffle(players)
    for i in range(0, len(players_unmatched)):
        if i % 2 == 0:
            player1 = players_unmatched[i]
            player2 = players_unmatched[i+1]
            g = Game(len(games), player1.id, player2.id)
            g.set_names(player1.name, player2.name)
            games.append(g)
            print_games()

            players_matched.append(player1)
            players_matched.append(player2)

            # Also set Game Ids for both players
            player1.set_game_id(g.id)
            player2.set_game_id(g.id)

            player_names.append(player1.name)
            player_names.append(player2.name)
    

    games_started.append('Hello')

    matched_names = []
    for i in range(len(players_matched)):
        player = players_matched[i]
        if player in players_unmatched:
            players_unmatched.remove(player)
        matched_names.append(player.name)
    

    return {"players_just_matched": player_names, "all_matched_players": matched_names }

# Reset all games so the app can be used again
@app.route('/reset_games')
def reset_games():
    games_started.clear()

# Player is leaving their game
@app.route('/leavegame')
def leave_game():
    player_id = request.args['playerId']
    print("LEAVING GAME: " + str(player_id))
    return "Task failed successfully"

# Checks if the games have begun yet
@app.route('/checkgame')
def check_game():
    player_id = request.args['playerId']
    game = get_game(int(player_id))
    if(game == None):
        return jsonify("False")
    else:
        return jsonify("True")

# Client application received a "True" from check_game: need to provide initial game data
@app.route('/initgame')
def init_game():
    player_id = int(request.args['playerId'])
    game = get_game(player_id)
    client_state = game.get_client_state(player_id)
    if game.player1 == player_id:
        client_state["is_turn"] = 1
        client_state["opponent"] = game.player2_name
    else:
        client_state["is_turn"] = 0
        client_state["opponent"] = game.player1_name
    return jsonify(client_state)

# Method for clients to repeatedly poll to see if it's their turn yet
@app.route('/checkmyturn')
def check_turn():
    player_id = int(request.args['playerId'])
    game = get_game(player_id)
    client_state = game.get_client_state(player_id)
    if(game.player1 == player_id):
        if(game.player_moving == 1):
            client_state["my_turn"] = "True"
        else:
            client_state["my_turn"] = "False"
    else:
        if(game.player_moving == 2):
            client_state["my_turn"] = "True"
        else:
            client_state["my_turn"] = "False"
    return jsonify(client_state)

# Method for clients to end their turn in their game
@app.route('/endmyturn')
def end_turn():
    player_id = int(request.args['playerId'])
    game = get_game(player_id)
    game.switch_player()
    client_state = game.get_client_state(player_id)
    client_state['success'] = 1
    return jsonify(client_state)

# Client application is playing a card: need to process the card played
# Parameters: playerId, cardId, humanCardId in [-1,0...3]
@app.route('/playcard', methods=['POST'])
def play_card():
    player_id = int(request.args['playerId'])
    card_id = int(request.args['cardId'])
    human_card_id = int(request.args['humanCardId'])
    specifier = request.args['specifier']
    game = get_game(player_id)
    message = game.play_card(player_id, card_id, human_card_id, specifier)
    if(message == "Success"):
        return jsonify(game.get_client_state(player_id))
    else:
        return jsonify(message)

# Client application is discarding a card: need to place in discard pile
# Parameters: playerId, cardId
@app.route('/discardcard', methods=['POST'])
def discard_card():
    player_id = int(request.args['playerId'])
    card_id = int(request.args['cardId'])
    game = get_game(player_id)
    success = game.discard_card(player_id, card_id)
    if(success == 1):
        return jsonify(game.get_client_state(player_id))
    else:
        return jsonify(False)

def get_game(player_id):
    for i in range(len(games)):
        game = games[i]
        if game.player1 == player_id or game.player2 == player_id:
            return game

def getID():
    if(len(all_players) == 0):
        return 0
    last_player = all_players[-1]
    return last_player.id + 1

# DEBUGGING ROUTINES

def print_games():
    for i in range(0, len(games)):
        print(str(games[i]))


def print_players():
    for i in range(0, len(all_players)):
        print(str(all_players[i]))


@app.route('/testinput')
def test_input():
    url = request.args['url']
    return jsonify(url)
