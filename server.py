# Made by RandoM, 2021
from flask import Flask, render_template, request, jsonify, Blueprint
from random import shuffle
import json
from flask.helpers import make_response
from flask.wrappers import Request
from database import Database

app = Flask(__name__)
app.config['SECRET_KEY'] = '#Extr3m3ly_Rand0M_s3creT_kEy_?/;'

@app.route('/')
def index():
    params = {}
    return render_template('index.html', **params)

def main():
    database = Database()
    print(database.get_player_by_login('rnd_random'))
    app.run(port=1337, host="0.0.0.0")
    # 46.146.186.210:1337

if __name__ == "__main__":
    main()
