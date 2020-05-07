from attack import Attack

class Human:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.effects = []
        self.blocked_cards = []
        self.cancer_points = []
        self.major_attacks = 0
        self.bone_metastasis = 0
        self.her2 = 0
        self.egfr = 0
        self.about_to_die = 0
        self.dead = 0
        self.attacks = []
        self.cards = []
        self.trash = []
        self.whipple = 0
    
    def add_attack(self, name, specifier, attack_type, card):

        #Major attack card case
        if card.id >= 48 and card.id <= 61:
            current_major_attacks = self.get_major_attack_number()
            if current_major_attacks == 0:
                #Add major attack
                attack = Attack(name, specifier, attack_type)
                self.attacks.append(attack)
                self.effects.append(card.effect_message)

                if card.name == "Bone Metastasis":
                    self.bone_metastasis = 1

            else:
                attack = Attack(name, specifier, attack_type)
                self.attacks.append(attack)
                self.effects.append(card.effect_message)

                self.effects.append("About to die!!!")
                self.about_to_die = 1
        #Indirect attack card case
        elif card.id >= 62 and card.id <= 69:
            attack = Attack(name, specifier, attack_type)
            self.attacks.append(attack)

            new_effect = card.effect_message
            
            self.blocked_cards.extend(card.blocked_cards)
            self.effects.append(new_effect)

    # Returns 1 if this human has an attack with that name and 0 if not
    def has_attack_with_name(self, name):
        print(self.attacks)
        for attack in self.attacks:
            if attack.name == name:
                return 1
        return 0

    def remove_attack_by_name(self, name, card_id):
        if card_id >= 108 and card_id <= 114:
            if self.about_to_die == 1:
                self.about_to_die = 0
        for i in range(len(self.attacks)):
            attack = self.attacks[i]
            if attack.name == name:
                self.attacks.remove(attack)
                self.remove_card_associated_with_attack(attack)
                self.reset_blocked_cards()
                self.reset_effects()
                break

    # Removes the associated cancer, card, and effect from this human, along with certain other cards
    def remove_cancer_by_name(self, name, index, short_name):
        # First find the cancer card and move it to the trash
        for card in self.cards:
            if card.name == name:
                self.trash.append(card)
                self.cards.remove(card)
                break
        

        for card in self.cards:
            if card.non_hereditary == 1:
                self.cards.remove(card)
                self.trash.append(card)
                self.cancer_points[index] = self.cancer_points[index] - card.point_effect
                if self.cancer_points[index] < 4:
                    self.reset_effects()
                    return

        # Reached here if we've removed non-hereditaries and cancer points is still too high
        for card in self.cards:
            if card.phase == 1 and card.major_type == "Zombie" and (short_name in card.options or "Any" in card.options):
                self.cards.remove(card)
                self.trash.append(card)
                self.cancer_points[index] = self.cancer_points[index] - card.point_effect
                if self.cancer_points[index] < 4:
                    self.reset_effects()
                    return 

        return "HOLY FUCK WHAT THE HELL HAPPENED HERE"

    
    def remove_attack_by_specifier(self, specifier):
        if self.about_to_die == 1:
            self.about_to_die = 0
        for i in range(len(self.attacks)):
            attack = self.attacks[i]
            if attack.specifier == specifier:
                self.attacks.remove(attack)
                self.remove_card_associated_with_attack(attack)
                self.reset_effects()
                break
    
    def remove_card_associated_with_attack(self, attack):
        for card in self.cards:
            if card.name == attack.name:
                self.trash.append(card)
                self.cards.remove(card)
                break
    
    def reset_effects(self):
        self.effects.clear()
        if self.dead == 1:
            self.effects.append("Dead")
            return

        for card in self.cards:
            if not card.effect_message == "":
                self.effects.append(card.effect_message)

        if self.about_to_die == 1:
            self.effects.append("About to Die!!!")
            return

        for i in range(len(self.cancer_points)):
            if self.cancer_points[i] >= 4:
                return
        self.effects.insert(0, "Healthy")

    
    # Resets the blocked cards to all cards blocked by cards that are on the human
    def reset_blocked_cards(self):
        self.blocked_cards.clear()
        for card in self.cards:
            if len(card.blocked_cards) > 0:
                self.blocked_cards.extend(card.blocked_cards)
        

    def get_major_attack_number(self):
        count = 0
        for card in self.cards:
            if card.minor_type == "MAJOR ATTACK":
                count = count + 1
        return count

        
