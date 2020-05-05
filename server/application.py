from flask import Flask, render_template, send_file, Response, request, jsonify
from game import Game
from player import Player
from flask_cors import CORS
import os
import random

app = Flask(__name__, static_url_path='/static', static_folder=os.path.join("../","client","static"))
CORS(app)

players = []  # Array of all player objects
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
    id = len(players)
    name = request.args['name']
    p = Player(id, name)
    players.append(p)

    print_players()
    print('Player ' + str(len(players)-1) + ' has entered the game')
    return str(id)

# Begins the game by pairing off all players and initializing the game array
@app.route('/startgame')
def start_game():
    if(len(players)%2 == 1): 
        return "Odd players!"

    # random.shuffle(players)
    for i in range(0, len(players)):
        if i % 2 == 0:
            player1 = players[i]
            player2 = players[i+1]
            g = Game(len(games), player1.id, player2.id)
            games.append(g)
            print_games()

            # Also set Game Ids for both players
            player1.set_game_id(g.id)
            player2.set_game_id(g.id)

    games_started.append('Hello')
    return 'Starting ' + str(len(games)) + ' games. Have fun!'

# Reset all games so the app can be used again
@app.route('/reset_games')
def reset_games():
    games_started.clear()

# Checks if the games have begun yet
@app.route('/checkgame')
def check_game():
    if(len(games_started) == 0):
        return "False"
    else:
        return "True"

# Client application received a "True" from check_game: need to provide initial game data
@app.route('/initgame')
def init_game():
    player_id = int(request.args['playerId'])
    game = get_game(player_id)
    client_state = game.get_client_state(player_id)
    if game.player1 == player_id:
        client_state["is_turn"] = 1
    else:
        client_state["is_turn"] = 0
    return client_state

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
    return client_state

# Method for clients to end their turn in their game
@app.route('/endmyturn')
def end_turn():
    player_id = int(request.args['playerId'])
    game = get_game(player_id)
    game.switch_player()
    client_state = game.get_client_state(player_id)
    client_state['success'] = 1
    return client_state

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
        return game.get_client_state(player_id)
    else:
        return message

# Client application is discarding a card: need to place in discard pile
# Parameters: playerId, cardId
@app.route('/discardcard', methods=['POST'])
def discard_card():
    player_id = int(request.args['playerId'])
    card_id = int(request.args['cardId'])
    game = get_game(player_id)
    success = game.discard_card(player_id, card_id)
    if(success == 1):
        return game.get_client_state(player_id)
    else:
        return False

def get_game(player_id):
    return games[players[player_id].game_id]

# DEBUGGING ROUTINES

def print_games():
    for i in range(0, len(games)):
        print(str(games[i]))


def print_players():
    for i in range(0, len(players)):
        print(str(players[i]))


@app.route('/testinput')
def test_input():
    url = request.args['url']
    return url
