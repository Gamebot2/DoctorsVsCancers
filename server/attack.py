class Attack:
    def __init__(self, name, specifier, attack_type):
        self.name = name
        # Specifier is the one character code for which cancer the attack is associated with, empty for none
        self.specifier = specifier
        # Type is whether the attack is major or indirect: 0 = Major, 1 = Indirect
        self.type = attack_type