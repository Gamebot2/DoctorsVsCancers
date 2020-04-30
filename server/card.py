class Card:
    def __init__(self, id, name, code, major_type, minor_type, phase, description, notes, point_effect, options, blocked_cards, effect_message):
        self.id = id
        self.name = name
        self.code = code
        self.major_type = major_type
        self.minor_type = minor_type
        self.phase = phase
        self.description = description
        self.notes = notes
        self.point_effect = point_effect
        self.options = options
        self.blocked_cards = blocked_cards
        self.effect_message = effect_message
        

    def __str__(self):
        return "ID: " + str(self.id) + ", Card Name: " + str(self.name)