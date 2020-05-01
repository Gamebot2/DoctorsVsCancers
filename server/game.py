from player import Player
from card import Card
from human import Human
import random

class Game:
    def __init__(self, id, player1, player2):
        self.id = id
        self.player1 = player1
        self.player2 = player2

        self.player_moving = 1

        #All types of decks, including discard piles, trash pile, and player decks
        self.human_cards = []
        self.cancer_deck = []
        self.zombie_deck = []
        self.doctor_deck = []
        self.doctor_discard_pile = []
        self.zombie_discard_pile = []
        self.trash_pile = []
        self.player1_deck = []
        self.player2_deck = []
        self.master_deck = []

        self.zombie_reshuffled = 0
        self.doctor_reshuffled = 0

        self.humans = []
        self.humans.append(Human(0, "Man 1", [], [], [], 0, 0, 0, 0, []))
        self.humans.append(Human(1, "Man 2", [], [], [], 0, 0, 0, 0, []))
        self.humans.append(Human(2, "Woman 1", [], [], [], 0, 0, 0, 0, []))
        self.humans.append(Human(3, "Woman 2", [], [], [], 0, 0, 0, 0, []))
        
        self.spec_map = {"L":"Lung Cancer", "B":"Breast Cancer","P":"Prostate Cancer","C":"Colon Cancer","N":"Pancreatic Cancer","M":"Mouth/Throat Cancer", "U":"Uterus/Ovary Cancer","R":"Cervical Cancer"}
        self.index_map = {"L": 0, "B": 1, "P": 2, "C": 3, "N": 4, "M": 5, "U": 6, "R":7}

        self.init_cancer_points()
        self.init_cards()


    # Getter and Setter Methods
    def get_id(self):
        return id

    def get_player1(self):
        return self.player1
    
    def get_player2(self):
        return self.player2
    
    # Functional Methods
    def init_cards(self):
        #Add the human cards
        self.human_cards.append(Card(0, "MAN 1", "BMAN1", "Base", "Human", 0, "", "", 0, [], [], ""))
        self.human_cards.append(Card(1, "MAN 2", "BMAN2", "Base", "Human", 0, "", "", 0, [], [], ""))
        self.human_cards.append(Card(2, "WOMAN 1", "BWOMAN1", "Base", "Human", 0, "", "", 0, [], [], ""))
        self.human_cards.append(Card(3, "WOMAN 2", "BWOMAN2", "Base", "Human", 0, "", "", 0, [], [], ""))

        #Add the cancer cards
        self.cancer_deck.append(Card(4, "Lung Cancer 1", "BLU1", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(5, "Lung Cancer 2", "BLU2", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(6, "Lung Cancer 3", "BLU3", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(7, "Breast Cancer 1", "BBR1", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(8, "Breast Cancer 2", "BBR2", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(9, "Breast Cancer 3", "BBR3", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(10, "Prostate Cancer 1", "BPR1", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(11, "Prostate Cancer 2", "BPR2", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(12, "Colon Cancer 1", "BCO1", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(13, "Colon Cancer 2", "BCO2", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(14, "Colon Cancer 3", "BCO3", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(15, "Pancreatic Cancer", "BPN", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(16, "Mouth and Throat Cancer", "BMT", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(17, "Uterus or Ovary Cancer", "BUT", "Base", "Cancer", 0, "", "", 0, [], [], ""))
        self.cancer_deck.append(Card(18, "Cervical Cancer", "BCR", "Base", "Cancer", 0, "", "", 0, [], [], ""))

        # TODO: Add the Zombie Deck Here
        self.zombie_deck.append(Card(19, "BRCA1 germline (inherited)", "Z1B1G", "Zombie", "MUTAGEN-CELL FACTOR", 1, "2 points towards breast or ovary", "BO", 2, ["Breast", "Uterus/Ovary"], [], ""))
        self.zombie_deck.append(Card(20, "BRCA2 germline (inherited)", "Z1B2G", "Zombie", "MUTAGEN-CELL FACTOR", 1, "2 points towards breast, prostate, or pancreas", "BPN", 2, ["Breast", "Prostate", "Pancreatic"], [], ""))
        self.zombie_deck.append(Card(21, "p53 germline (inherited)", "Z1PG", "Zombie", "MUTAGEN-CELL FACTOR", 1, "2 points towards breast", "B", 2, ["Breast"], [], ""))
        self.zombie_deck.append(Card(22, "Mismatch repair germline (inherited)", "Z1MMG", "Zombie", "MUTAGEN-CELL FACTOR", 1, "2 points towards colon or gyn", "CUR", 2, ["Colon", "Uterus/Ovary", "Cervical"], [], "")) #What the hell is Gyn
        self.zombie_deck.append(Card(23, "APC germline (inherited)", "Z1PG", "Zombie", "MUTAGEN-CELL FACTOR", 1, "3 points towards colon", "C", 3, ["Colon"], [], ""))
        self.zombie_deck.append(Card(24, "p53 somatic (not hereditary)", "Z1PS", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(25, "PTEN somatic (not hereditary)", "Z1PT", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(26, "VHL somatic (not hereditary)", "Z1VH", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(27, "KRAS somatic (not hereditary)", "Z1KR", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(28, "APC somatic (not hereditary)", "Z1APCS", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(29, "EGFR somatic (not hereditary)", "Z1EGF", "Zombie", "MUTAGEN-CELL FACTOR", 1, "2 points towards lung or colon", "LC", 2, ["Lung", "Colon"], [], ""))
        self.zombie_deck.append(Card(30, "HER2 somatic (not hereditary)", "Z1HR2", "Zombie", "MUTAGEN-CELL FACTOR", 1, "2 points towards breast", "B", 2, ["Breast"], [], ""))
        self.zombie_deck.append(Card(31, "Mismatch Repair somatic (not hereditary)", "Z1MMS", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(32, "BRCA1 somatic (not hereditary)", "Z1B1S", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(33, "BRCA2 somatic (not hereditary)", "Z1B2S", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(34, "Bad luck", "Z1BL1", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(35, "Bad luck", "Z1BL2", "Zombie", "MUTAGEN-CELL FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(36, "Too much food!", "Z1TF1", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(37, "Too much food!", "Z1TF2", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "1 point towards any cancer", "A", 1, ["Any"], [], ""))
        self.zombie_deck.append(Card(38, "Smoking", "Z1SM1", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "2 points towards lung or mouth", "LM", 2, ["Lung", "Mouth"], [], ""))
        self.zombie_deck.append(Card(39, "Smoking", "Z1SM2", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "2 points towards lung or mouth", "LM", 2, ["Lung", "Mouth"], [], ""))
        self.zombie_deck.append(Card(40, "Oral Tobacco", "Z1OT", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "2 points towards mouth", "M", 2, ["Mouth"], [], ""))
        self.zombie_deck.append(Card(41, "Barbecue", "Z1BBQ", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "1 point towards colon or pancreas", "CN", 1, ["Colon", "Pancreatic"], [], ""))
        self.zombie_deck.append(Card(42, "HPV", "Z1HP1", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "2 points towards mouth or cervical", "MR", 2, ["Mouth", "Cervical"], [], ""))
        self.zombie_deck.append(Card(43, "HPV", "Z1HP2", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "2 points towards mouth or cervical", "MR", 2, ["Mouth", "Cervical"], [], ""))
        self.zombie_deck.append(Card(44, "Family history breast", "Z1FHB", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "1 point towards breast", "B", 1, ["Breast"], [], ""))
        self.zombie_deck.append(Card(45, "Family history prostate", "Z1FHPR", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "1 point towards prostate", "P", 1, ["Prostate"], [], ""))
        self.zombie_deck.append(Card(46, "Family history colon", "Z1FHC", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "1 point towards colon", "C", 1, ["Colon"], [], ""))
        self.zombie_deck.append(Card(47, "Family history pancreatic", "Z1FHPC", "Zombie", "MUTAGEN-HUMAN FACTOR", 1, "1 point towards pancreatic", "N", 1, ["Pancreatic"], [], ""))

        #Zombie Deck: Major attack cards
        self.zombie_deck.append(Card(48, "Brain Metastasis", "Z2BR", "Zombie", "MAJOR ATTACK", 2, "Use in breast with HER2 or lung cancer", "BL", 0, ["Lung", "Breast"], [], "Hit by Brain Metastasis!"))
        self.zombie_deck.append(Card(49, "Lung Metastasis", "Z2LG1", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, colon, gyn cancers", "LBCUR", 0, ["Lung", "Breast", "Colon", "Uterus/Ovary", "Cervical"], [], "Hit by Lung Metastasis!"))
        self.zombie_deck.append(Card(50, "Lung Metastasis", "Z2LG2", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, colon, gyn cancers", "LBCUR", 0, ["Lung", "Breast", "Colon", "Uterus/Ovary", "Cervical"], [], "Hit by Lung Metastasisi!"))
        self.zombie_deck.append(Card(51, "Malignant Pleural Effusion", "Z2PL1", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast cancers", "LB", 0, ["Lung", "Breast"], [], "Hit by Malignant Pleural Effusion!"))
        self.zombie_deck.append(Card(52, "Malignant Pleural Effusion", "Z2PL2", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast cancers", "LB", 0, ["Lung", "Breast"], [], "Hit by Malignant Pleural Effusion!"))
        self.zombie_deck.append(Card(53, "Liver Metastasis", "Z2LV1", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, colon, gyn, pancreatic cancers", "LBCURN", 0, ["Lung", "Breast", "Colon", "Uterus/Ovary", "Cervical", "Pancreatic"], [], "Hit by Liver Metastasis!"))
        self.zombie_deck.append(Card(54, "Liver Metastasis", "Z2LV2", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, colon, gyn, pancreatic cancers", "LBCURN", 0, ["Lung", "Breast", "Colon", "Uterus/Ovary", "Cervical", "Pancreatic"], [], "Hit by Liver Metastasis!"))
        self.zombie_deck.append(Card(55, "Malignant Ascites", "Z2AS1", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, colon, gyn, pancreatic cancers", "LBCURN", 0, ["Lung", "Breast", "Colon", "Uterus/Ovary", "Cervical", "Pancreatic"], [], "Hit by Malignant Ascites!"))
        self.zombie_deck.append(Card(56, "Malignant Ascites", "Z2AS2", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, colon, gyn, pancreatic cancers", "LBCURN", 0, ["Lung", "Breast", "Colon", "Uterus/Ovary", "Cervical", "Pancreatic"], [], "Hit by Malignant Ascites!"))
        self.zombie_deck.append(Card(57, "Bone Metastasis", "Z2BO1", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, prostate, gyn cancers", "LBPUR", 0, ["Lung", "Breast", "Prostate", "Uterus/Ovary", "Cervical"], [], "Hit by Bone Metastasis!"))
        self.zombie_deck.append(Card(58, "Bone Metastasis", "Z2BO2", "Zombie", "MAJOR ATTACK", 2, "Use in lung, breast, prostate, gyn cancers", "LBPUR", 0, ["Lung", "Breast", "Prostate", "Uterus/Ovary", "Cervical"], [], "Hit by Bone Metastasis!"))
        self.zombie_deck.append(Card(59, "Invade Locally", "Z2IN1", "Zombie", "MAJOR ATTACK", 2, "Use in any tumor", "A", 0, ["Any"], [], "Invaded Locally!"))
        self.zombie_deck.append(Card(60, "Invade Locally", "Z2IN2", "Zombie", "MAJOR ATTACK", 2, "Use in any tumor", "A", 0, ["Any"], [], "Invaded Locally!"))
        self.zombie_deck.append(Card(61, "Bone Fracture", "Z2BF", "Zombie", "MAJOR ATTACK", 2, "Use after bone metastasis", "A", 0, ["Any"], [], "Hit by Bone Fracture!"))

        #Indirect attack cards
        self.zombie_deck.append(Card(62, "MDR Gene", "Z2MDR", "Zombie", "INDIRECT ATTACK", 2, "Blocks all chemotherapy", "", 0, [], [98, 99, 100, 101, 102], "MDR: Chemotherapy Blocked"))
        self.zombie_deck.append(Card(63, "Radiation Resistance", "Z2RR", "Zombie", "INDIRECT ATTACK", 2, "Blocks palliative radiation", "", 0, [], [109, 110], "Palliative Radiation Blocked"))
        self.zombie_deck.append(Card(64, "Fatigue", "Z2F1", "Zombie", "INDIRECT ATTACK", 2, "No medical treatment until better", "", 0, [], list(range(98, 108)), "No medical treatment until better"))
        self.zombie_deck.append(Card(65, "Fatigue", "Z2F2", "Zombie", "INDIRECT ATTACK", 2, "No medical treatment until better", "", 0, [], list(range(98, 108)), "No medical treatment until better"))
        self.zombie_deck.append(Card(66, "Pain", "Z2PN", "Zombie", "INDIRECT ATTACK", 2, "No medical treatment until better", "", 0, [], list(range(98, 108)), "No medical treatment until better"))
        self.zombie_deck.append(Card(67, "Depression", "Z2DP", "Zombie", "INDIRECT ATTACK", 2, "No treatment until better", "", 0, [], list(range(88, 115)), "No treatment until better"))
        self.zombie_deck.append(Card(68, "Lack of healthcare", "Z2HC1", "Zombie", "INDIRECT ATTACK", 2, "No treatment until better", "", 0, [], list(range(88, 115)), "No treatment until better"))
        self.zombie_deck.append(Card(69, "Lack of healthcare", "Z2HC2", "Zombie", "INDIRECT ATTACK", 2, "No treatment until better", "", 0, [], list(range(88, 115)), "No treatment until better"))

        # TODO: Add the Doctor Deck Here
        self.doctor_deck.append(Card(70, "Change your diet!", "D1DT1", "Doctor", "PRE-EMPTION", 1, "Blocks too much food", "", 0, [], [36, 37], "Can't eat too much!"))
        self.doctor_deck.append(Card(71, "Change your diet!", "D1DT2", "Doctor", "PRE-EMPTION", 1, "Blocks too much food", "", 0, [], [36, 37], "Can't eat too much!"))
        self.doctor_deck.append(Card(72, "Exercise!", "D1EX1", "Doctor", "PRE-EMPTION", 1, "Blocks too much food", "", 0, [], [36, 37], "Can't eat too much!"))
        self.doctor_deck.append(Card(73, "Exercise!", "D1EX2", "Doctor", "PRE-EMPTION", 1, "Blocks too much food", "", 0, [], [36, 37], "Can't eat too much!"))
        self.doctor_deck.append(Card(74, "Stop smoking!", "D1SS1", "Doctor", "PRE-EMPTION", 1, "Blocks smoking", "", 0, [], [38, 39], "Can't smoke!"))
        self.doctor_deck.append(Card(75, "Stop smoking!", "D1SS1", "Doctor", "PRE-EMPTION", 1, "Blocks smoking", "", 0, [], [38, 39], "Can't smoke!"))
        self.doctor_deck.append(Card(76, "Stop dipping!", "D1SD", "Doctor", "PRE-EMPTION", 1, "Blocks oral tobacco", "", 0, [], [40], "Can't dip oral tobacco!"))
        self.doctor_deck.append(Card(77, "Mammogram", "D1MG1", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards breast cancer", "B", 2, ["Breast"], [], ""))
        self.doctor_deck.append(Card(78, "Mammogram", "D1MG2", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards breast cancer", "B", 2, ["Breast"], [], ""))
        self.doctor_deck.append(Card(79, "CT Lung Cancer Screening", "D1MCT1", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards lung cancer", "L", 2, ["Lung"], [], ""))
        self.doctor_deck.append(Card(80, "PSA and Rectal Exam", "D1PS1", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards prostate cancer", "P", 2, ["Prostate"], [], ""))
        self.doctor_deck.append(Card(81, "PSA and Rectal Exam", "D1PS2", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards prostate cancer", "P", 2, ["Prostate"], [], ""))
        self.doctor_deck.append(Card(82, "Pap smear", "D1PP1", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards cervical cancer", "R", 2, ["Cervical"], [], ""))
        self.doctor_deck.append(Card(83, "Pap smear", "D1PP2", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards cervical cancer", "R", 2, ["Cervical"], [], ""))
        self.doctor_deck.append(Card(84, "ENT exam", "D1ENT", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards oral cancer", "O", 2, ["Mouth"], [], ""))
        self.doctor_deck.append(Card(85, "Colonoscopy", "D1CL1", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards colon cancer", "C", 2, ["Colon"], [], ""))
        self.doctor_deck.append(Card(86, "Colonoscopy", "D1CL2", "Doctor", "PRE-EMPTION", 1, "Minus 2 points towards colon cancer", "C", 2, ["Colon"], [], ""))
        self.doctor_deck.append(Card(87, "Genetic testing", "D1GT", "Doctor", "PRE-EMPTION", 1, "Show all cell factor cards", "", 0, [], [], ""))
        
        self.init_master_deck()

        # TODO: Add the player 1 deck from Zombie w/ shuffling
        random.shuffle(self.zombie_deck)
        for i in range(6):
            card = self.zombie_deck[i]
            self.player1_deck.append(card)
            self.zombie_deck.remove(card)

        # TODO: Add the player 2 deck from Doctor w/ shuffling
        random.shuffle(self.doctor_deck)
        for i in range(6):
            card = self.doctor_deck[i]
            self.player2_deck.append(card)
            self.doctor_deck.remove(card)

        # Adding the initial effects on the human players
        for i in range(len(self.humans)):
            human = self.humans[i]
            human.effects.append('Healthy')

    # Initializes the master deck for easy card retrieval
    def init_master_deck(self):
        self.master_deck.extend(self.human_cards)
        self.master_deck.extend(self.cancer_deck)
        self.master_deck.extend(self.zombie_deck)
        self.master_deck.extend(self.doctor_deck)

    #Order of cancer points: L, B, P, C, N, M, U, R
    def init_cancer_points(self):
        for i in range(len(self.humans)):
            human = self.humans[i]
            for i in range(8):
                human.cancer_points.append(0)

    # player_id, card_id, and human_card_id show which player playing which card on which human
    # specifier specifies extra choice like which cancer to put points towards
    def play_card(self, player_id, card_id, human_card_id, specifier):
        if card_id >= 19 and card_id <= 47:
            # ----------- CANCER CARDS THAT ADD POINTS FOR SPECIFIC CANCERS IN PHASE 1 -------
            cancer_points = self.get_cancer_points_by_human_id(human_card_id)
            index = self.parse_specifier(specifier)

            blocked_cards = self.get_blocked_cards_by_human_id(human_card_id)
            if card_id in blocked_cards:
                return "That card is blocked!"

            card = self.get_card_by_id(card_id)
            self.replace_card_zombie(card_id)

            if card.name == "HER2 somatic (not hereditary)":
                self.humans[human_card_id].her2 = 1

            cancer_points[index] = cancer_points[index] + card.point_effect
            if cancer_points[index] >= 4:
                #Human now has that cancer baby
                self.give_human_cancer(human_card_id, specifier)
                effects = self.get_effects_by_human_id(human_card_id)
                if "Healthy" in effects:
                    effects.remove("Healthy")
        elif card_id >= 48 and card_id <= 61:
            # ----------- ZOMBIE PHASE 2 MAJOR ATTACK CARDS ---------------
            # First need to return error if human doesn't have cancer specified
            if not self.check_human_cancer(human_card_id, specifier):
                return "This human does not have that cancer!"
            
            # Return error if the human is dead
            if self.check_dead(human_card_id):
                return "This human is already dead."
            
            card = self.get_card_by_id(card_id)
            if card.name == "Bone Fracture" and self.humans[human_card_id].bone_metastasis == 0:
                return "This human hasn't been hit by bone metastasis yet!"
            
            if card.name == "Brain Metastasis" and self.humans[human_card_id].her2 == 0:
                return "This human does not have HER2!"
            
            self.replace_card_zombie(card_id)

            # Assign the human the effect associated with card, and up major attacks. Check for death
            self.humans[human_card_id].add_attack(card.name, specifier, 0, card)

        elif card_id >= 62 and card_id <= 69:
            #--------- ZOMBIE PHASE 2 INDIRECT ATTACK CARDS: BLOCK CERTAIN TREATMENTS-----------
            card = self.get_card_by_id(card_id)

            # Return error if the human is dead
            if self.check_dead(human_card_id):
                return "This human is already dead."
            
            # Return error if that human already has the effect
            if card.effect_message in self.humans[human_card_id].effects:
                return "That effect is already present!"

            self.replace_card_zombie(card_id)
            card = self.get_card_by_id(card_id)

            # Adds the indirect attack effect and blocked cards for the appropriate human
            self.humans[human_card_id].add_attack(card.name, specifier, 1, card)

        elif card_id >= 70 and card_id <= 76:
            #--------- DOCTOR CARDS THAT BLOCK CERTAIN PHASE 1 CANCER CARDS ----------
            blocked_cards = self.get_blocked_cards_by_human_id(human_card_id)
            effects = self.get_effects_by_human_id(human_card_id)
            card = self.get_card_by_id(card_id)
            new_effect = card.effect_message

            if new_effect in effects:
                return "That effect is already present!"
            
            blocked_cards.extend(card.blocked_cards)
            effects.append(new_effect)

            self.replace_card_doctor(card_id)

        elif card_id >= 77 and card_id <= 86:
            #--------- DOCTOR CARDS THAT SUBTRACT POINTS TOWARDS CANCERS ----------
            cancer_points = self.get_cancer_points_by_human_id(human_card_id)
            index = self.parse_specifier(specifier)

            if cancer_points[index] == 0:
                return "Points already at 0: can't go lower!"

            card = self.get_card_by_id(card_id)
            self.replace_card_doctor(card_id)

            cancer_points[index] = cancer_points[index] - card.point_effect
            if cancer_points[index] < 0:
                cancer_points[index] = 0

        return "Success"
    
    def discard_card(self, player_id, card_id):
        if player_id == self.player1:
            #Zombie is discarding
            for i in range(len(self.player1_deck)):
                card = self.player1_deck[i]
                if card.id == card_id:
                    self.replace_card_zombie(card_id)
        else:
            #Doctor is discarding
            for i in range(len(self.player2_deck)):
                card = self.player2_deck[i]
                if card.id == card_id:
                    self.replace_card_doctor(card_id)
            print(self.player2_deck)
        return 1

    def replace_card_zombie(self, card_id):
        card = self.get_card_by_id(card_id)

        #Deck is empty: need to get stuff from discard pile and put it back in
        if len(self.zombie_deck) == 0:
            self.zombie_deck.extend(self.zombie_discard_pile)
            self.zombie_discard_pile.clear()
            self.zombie_reshuffled = self.zombie_reshuffled + 1
            print("Reshuffled " + str(self.zombie_reshuffled) + " times")

        new_card = self.zombie_deck[0]
        old_card_index = self.player1_deck.index(card)
        self.player1_deck[old_card_index] = new_card

        #TODO: Handle the case when zombie_deck is empty: either reshuffle or end game
        self.zombie_discard_pile.append(card)
        self.zombie_deck.remove(new_card)

    def replace_card_doctor(self, card_id):
        card = self.get_card_by_id(card_id)
        
        #Deck is empty: need to get stuff from discard pile and put it back in
        if len(self.doctor_deck) == 0:
            self.doctor_deck.extend(self.doctor_discard_pile)
            self.doctor_discard_pile.clear()
            self.doctor_reshuffled = self.doctor_reshuffled + 1
            print("Reshuffled doctor deck " + str(self.doctor_reshuffled) + " times")

        new_card = self.doctor_deck[0]
        old_card_index = self.player2_deck.index(card)
        self.player2_deck[old_card_index] = new_card

        self.doctor_discard_pile.append(card)
        self.doctor_deck.remove(new_card)
    
    def switch_player(self):
        if self.player_moving == 1:
            # Switching from Zombie phase to Doctor phase
            self.player_moving = 2
        else:
            # Switching from Doctor phase to Zombie phase
            self.player_moving = 1

            for i in range(4):
                if self.humans[i].about_to_die == 1:
                    # Kill this dude
                    self.kill_human(i)


    def kill_human(self, human_card_id):
        effects = self.get_effects_by_human_id(human_card_id)
        effects.clear()
        effects.append("Dead")
        self.humans[human_card_id].about_to_die = -1
    
    def check_dead(self, human_card_id):
        return self.humans[human_card_id].major_attacks == 2 and self.humans[human_card_id].about_to_die == -1

    def get_client_state(self, player_id):
        client_state = {}
        player_deck = []

        if player_id == self.player1:
            #Need to return the zombie state
            for i in range(len(self.player1_deck)):
                card = self.player1_deck[i]
                player_deck.append((card.id, card.name, card.description, card.options))
            client_state["player_type"] = "Zombie"
        else:
            #Need to return the doctor state
            for i in range(len(self.player2_deck)):
                card = self.player2_deck[i]
                player_deck.append((card.id, card.name, card.description, card.options))
            client_state["player_type"] = "Doctor"


        client_state["player_deck"] = player_deck   
        client_state["man1_effects"] = self.humans[0].effects
        client_state["man2_effects"] = self.humans[1].effects
        client_state["woman1_effects"] = self.humans[2].effects
        client_state["woman2_effects"] = self.humans[3].effects 

        client_state["man1_cancer_points"] = self.humans[0].cancer_points 
        client_state["man2_cancer_points"] = self.humans[1].cancer_points 
        client_state["woman1_cancer_points"] = self.humans[2].cancer_points 
        client_state["woman2_cancer_points"] = self.humans[3].cancer_points 

        client_state["zombie_discard_size"] = len(self.zombie_discard_pile)
        client_state["doctor_discard_size"] = len(self.doctor_discard_pile)

        client_state["zombie_deck_size"] = len(self.zombie_deck)
        client_state["doctor_deck_size"] = len(self.doctor_deck)

        # TODO: insert more things to return here
        return client_state
    
    # Assigns a human the effect of the appropriate cancer
    def give_human_cancer(self, human_card_id, specifier):
        effects = self.get_effects_by_human_id(human_card_id)
        effect = "Has " + self.spec_map[specifier]
        effects.append(effect)
    
    # Checks if a human has a specific cancer
    def check_human_cancer(self, human_card_id, specifier):
        index = self.parse_specifier(specifier)
        cancer_points = self.get_cancer_points_by_human_id(human_card_id)
        return cancer_points[index] >= 4

    # Returns appropriate card given just the card idea: searches all decks
    def get_card_by_id(self, card_id):
        for i in range(len(self.master_deck)):
            card = self.master_deck[i]
            if card.id == card_id:
                return card

    # Returns appropriate cancer points array for human card id provided
    def get_cancer_points_by_human_id(self, human_card_id):
        return self.humans[human_card_id].cancer_points
    
    # Returns the appropriate blocked cards array for the human card id provided
    def get_blocked_cards_by_human_id(self, human_card_id):
        return self.humans[human_card_id].blocked_cards

    # Returns appropriate effects array for human card id provided
    def get_effects_by_human_id(self, human_card_id):
        return self.humans[human_card_id].effects

    #Returns an index based on specifier provided with following order:
    #L, B, P, C, N, M, U, R
    #Lung, Breast, Prostate, Colon, Pancreatic, Mouth, Uterus, Cervical
    def parse_specifier(self, specifier):
        return self.index_map[specifier]

    # ToString
    def __str__(self):
        return "Game ID: " + str(self.id) + ", P1: " + str(self.player1) + " |  P2: " + str(self.player2)
