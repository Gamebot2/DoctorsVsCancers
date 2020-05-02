class Attack:
    def __init__(self, name, specifier, attack_type):
        self.name = name
        self.specifier = specifier
        self.type = attack_type # 0 for Major attack, 1 for minor