class Player:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.game_id = 0

    def get_id(self):
        return self.id

    def get_name(self):
        return self.name

    def get_game_id(self):
        return self.game_id
    
    def set_game_id(self, game_id):
        self.game_id = game_id
        return
    
    def __str__(self):
        return "Id: " + str(self.id) + ", Name: " + self.name + ", Game ID: " + str(self.game_id)