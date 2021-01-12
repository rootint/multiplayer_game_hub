# Made by RandoM, 2021
from flask import Flask, render_template, request, jsonify
from random import shuffle
import json
from flask.helpers import make_response

from flask.wrappers import Request

app = Flask(__name__)
app.config['SECRET_KEY'] = '#Extr3m3ly_Rand0M_s3creT_kEy_?/;'

# FIX NON-SQUARED FIELD
WIDTH = 16
HEIGHT = 16
MINES = 40
main_field = []
current_players_data = {}
player_amount = 11

class FieldGenerator:
    def __init__(self, width, height, mines):
        self.width = width
        self.height = height
        self.mines = mines
        self.field = [[0] * self.height for i in range(self.width)]
        self.mines_array = [(i, j) for i in range(self.width) for j in range(self.height)]

    def generate_mines(self):
        """
            generate_mines(self):
            Generates mines' position and puts them respectively on the field matrix.
        """
        shuffle(self.mines_array)
        for i in [self.mines_array[i] for i in range(self.mines)]:
            self.field[i[0]][i[1]] = 9

    def create_field(self):
        """
            create_field(self):
            Creates a field matrix with all mine surrounding numbers.
        """
        self.generate_mines()
        for i in range(len(self.field)):
            for j in range(len(self.field[i])):
                if self.field[i][j] != 9:
                    if i + 1 < self.width and self.field[i + 1][j] == 9:
                        self.field[i][j] += 1
                    if i - 1 >= 0 and self.field[i - 1][j] == 9:
                        self.field[i][j] += 1
                    if i + 1 < self.width and j + 1 < self.height and self.field[i + 1][j + 1] == 9:
                        self.field[i][j] += 1
                    if i + 1 < self.width and j - 1 >= 0 and self.field[i + 1][j - 1] == 9:
                        self.field[i][j] += 1
                    if i - 1 >= 0 and j - 1 >= 0 and self.field[i - 1][j - 1] == 9:
                        self.field[i][j] += 1
                    if j + 1 < self.height and self.field[i][j + 1] == 9:
                        self.field[i][j] += 1
                    if j - 1 >= 0 and self.field[i][j - 1] == 9:
                        self.field[i][j] += 1
                    if i - 1 >= 0 and j + 1 < self.height and self.field[i - 1][j + 1] == 9:
                        self.field[i][j] += 1

    def generate(self):
        self.create_field()
        while self.field[0][0] != 0 or self.field[-1][-1] != 0:
            self.field = [[0] * self.height for i in range(self.width)]
            self.create_field()
        return self.field


@app.route('/postdata', methods=['POST'])
def postdata():
    data = json.loads(request.form['data'])['data_dict']
    # print(data)
    current_players_data[data['ip']] = data
    print(current_players_data)
    return 'Data received', 200


@app.route('/change_nickname', methods=['POST'])
def change_nickname():
    data = json.loads(request.form['data'])
    print(data)
    current_players_data[data['ip']]['nickname'] = data['new_nickname']
    print(current_players_data)
    res = make_response()
    name = current_players_data[str(request.remote_addr)]['nickname']
    if current_players_data != {} and name != str(request.remote_addr):
        print('here', current_players_data[str(request.remote_addr)])
        res.set_cookie('last_used_name', name, max_age=60*60*24) # one-day cookie
        print('COOKIE CHANGED', request.cookies.get('last_user_name'))
    return res, 200


@app.route('/check_for_game_end', methods=['GET'])
def check_for_game_end():
    answer = {
        'game_ended': False, 
        'end_state': 'state', 
        'name': 'nickname',
        'ip': 'ip',
        'new_field': None
    }
    for i in current_players_data:
        if current_players_data[i]['game_state'] == 'won':
            answer['game_ended'] = True
            answer['ip'] = str(i)
            answer['name'] = current_players_data[i]['nickname']
            answer['end_state'] = 'won' 
            # current_players_data[i]['win_amount'] += 1
            break
        elif current_players_data[i]['game_state'] == 'lost':
            answer['game_ended'] = True
            answer['ip'] = str(i)
            answer['name'] = current_players_data[i]['nickname']
            answer['end_state'] = 'lost' 
            # for j in current_players_data:
            #     if j != i:
            #         current_players_data[j]['win_amount'] += 1
            break
    if answer['game_ended']:
        generate_field(WIDTH, HEIGHT, MINES)
        answer['new_field'] = main_field
    return jsonify(answer), 200


@app.route('/get_client_ip', methods=['GET'])
def send_client_ip():
    return jsonify({'ip': request.remote_addr}), 200


@app.route('/get_players_data', methods=['GET'])
def send_players_data():
    return jsonify(current_players_data), 200


@app.route('/get_minefield', methods=['GET'])
def get_minefield():
    global main_field
    return str(main_field)
    

@app.route('/on_player_exit', methods=['POST'])
def on_player_exit():
    data = request.form['data']
    print('LEFT!', data)
    # current_players_data.popitem(data)
    del current_players_data[data]
    # return str(main_field)
    return 'Data received', 200


@app.route('/cookie')
def cookie():
    name = current_players_data[str(request.remote_addr)]['nickname']
    print('here', current_players_data[str(request.remote_addr)])
    res = make_response('Setting a cookie')
    res.set_cookie('last_used_name', name, max_age=60*60*24) # one-day cookie
    return res


@app.route('/get_username')
def get_username():
    if request.cookies.get('last_used_name'):
        current_players_data[str(request.remote_addr)]['nickname'] = request.cookies.get('last_used_name')
        if str(request.remote_addr) in current_players_data:
            name = current_players_data[str(request.remote_addr)]['nickname']
        else:
            name = request.remote_addr
    else:
        name = request.remote_addr
    return name


@app.route('/generate')
def generate():
    generate_field(WIDTH, HEIGHT, MINES)
    return str(main_field)


@app.route('/get_field_measures')
def get_field_measures():
    return jsonify({"width": WIDTH, 
                    "height": HEIGHT, 
                    "mines": MINES})


@app.route('/')
def index():
    global player_amount
    # if request.remote_addr not in current_players_data.keys():
    #     player_amount += 1
    # nickname = request.remote_addr if len(current_players_data) == 0 else current_players_data[request.remote_addr]['nickname']
    nickname = request.remote_addr
    if len(nickname) > 15:
        nickname = nickname[:15] + '...'
    params = {
        "player_amount": player_amount
    }
    print('----PLAYER AMOUNT', player_amount, len(current_players_data), current_players_data.keys())
    # res = make_response(render_template('index.html', **params))
    # if not request.cookies.get('last_used_name'):
    #     print('COOKIE CHANGED', request.cookies.get('last_user_name'))
    #     res.set_cookie('last_used_name', str(request.remote_addr), max_age=60*60*24)
    #     print('COOKIE CHANGED', request.cookies.get('last_user_name'))
    # else:
    #     params['nickname'] = request.cookies.get('last_used_name')
    #     print('NICKNAME!!!!!', request.cookies.get('last_used_name'))
    return render_template('index.html', **params)
    # return res

def main():
    generate_field(WIDTH, HEIGHT, MINES)
    app.run(port=1337, host="127.0.0.1")
    # app.run(port=1337, host='192.168.1.8')
    # app.run(port=1337, host='192.168.1.2')
    # app.run(port=1337, host="25.66.130.126")
    # app.run(port=1337, host="0.0.0.0")
    # 46.146.186.210:1337
    

def generate_field(width, height, mines):
    global main_field
    generator = FieldGenerator(width, height, mines)
    main_field = generator.generate()


if __name__ == "__main__":
    main()
