from attack import Attack

class Human:
    def __init__(self, id, name, effects, blocked_cards, cancer_points, major_attacks, bone_metastasis, her2, about_to_die, attacks):
        self.id = id
        self.name = name
        self.effects = effects
        self.blocked_cards = blocked_cards
        self.cancer_points = cancer_points
        self.major_attacks = major_attacks
        self.bone_metastasis = bone_metastasis
        self.her2 = her2
        self.about_to_die = about_to_die
        self.attacks = attacks
    
    def add_attack(self, name, specifier, attack_type, card):

        #Major attack card case
        if card.id >= 48 and card.id <= 61:
            current_major_attacks = len(self.attacks)
            if current_major_attacks == 0:
                #Add major attack
                attack = Attack(name, specifier, attack_type)
                self.attacks.append(attack)
                self.effects.append(card.effect_message)

                if card.name == "Bone Metastasis":
                    self.bone_metastasis = 1

            else:
                self.effects.append("About to die!!!")
                self.about_to_die = 1
        #Indirect attack card case
        elif card.id >= 62 and card.id <= 69:
            new_effect = card.effect_message
            
            self.blocked_cards.extend(card.blocked_cards)
            self.effects.append(new_effect)

    def get_major_attack_number(self):
        return len(self.attacks)
        
