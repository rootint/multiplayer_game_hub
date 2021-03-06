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
