
# import sqlite3
# from werkzeug.security import generate_password_hash, check_password_hash

# db = sqlite3.connect('db/main.db')
# cursor = db.cursor()
# query = """SELECT * FROM users"""
# # print(generate_password_hash('D1337_47'))
# # print(check_password_hash(generate_password_hash('RNDRandoM'), 'RNDRandoM'))
# # query = """INSERT INTO users (login, nickname, password, dark_mode) VALUES ('rnd_random', 'R', 'pbkdf2:sha256:150000$DSunWChY$ac5032d806b225080b87a98cba838199cee581846127eadf164290bba62f9496', true)"""
# result = list(cursor.execute(query).fetchall())
# print(result)
# db.commit()
# db.close()

import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

class Database:
    def __init__(self):
        self.db = sqlite3.connect('db/main.db')
        self.cursor = self.db.cursor()

    def get_player_by_login(self, login):
        query = f'''SELECT login, nickname, dark_mode FROM users WHERE login=\'{login}\''''
        result = list(self.cursor.execute(query).fetchall())
        if len(result) == 0:
            return (False, '')
        else:
            return (True, result)

    def add_player(self, login, nickname, password, dark_mode=False):
        query = f'''INSERT INTO users (login, nickname, password, dark_mode) VALUES ({login}, {nickname}, {generate_password_hash(password)}, {dark_mode})'''
        self.cursor.execute(query)
        self.db.commit()
