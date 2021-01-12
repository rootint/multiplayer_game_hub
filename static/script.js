// Made by RandoM, 2021
var MINES = 40, WIDTH = 16, HEIGHT = 16, CELL_SIZE = 30
let FPS = 20, DATA_SENT_PER_SECOND = 2

var img = []
var game_field, game_height = 10, game_width = 10
var last_triggered_event
var win_amount = 0
var nickname = ''
var client_ip = ''
var players_data = []

class Game {
    field = []
    height = 0
    width = 0
    flagged = []
    opened = []
    dead = false
    cell_size = 30
    mines = 0
    total_opened = 0
    current_state = 'nothing'
    total_flagged = 0

    constructor(field, height, width, mines) {
        this.field = field
        this.width = width
        this.height = height 
        this.mines = mines
        for (var i = 0; i < height; i++) {
            var tmp1 = [], tmp2 = []
            for (var j = 0; j < width; j++) {
                tmp1.push(false)
                tmp2.push(false)
            }
            this.flagged.push(tmp1)
            this.opened.push(tmp2)
        }
        // console.log('constructor', this.field, this.width, this.height, this.mines)
    }

    get_flags_around(x, y) {
        var num = 0
        if (y + 1 < this.height)
            num += (this.flagged[x][y + 1]) ? 1 : 0
        if (y - 1 >= 0) 
            num += (this.flagged[x][y - 1]) ? 1 : 0
        if (x + 1 < this.width)
            num += (this.flagged[x + 1][y]) ? 1 : 0
        if (x + 1 < this.width && y + 1 < this.height)
            num += (this.flagged[x + 1][y + 1]) ? 1 : 0
        if (x - 1 >= 0 && y + 1 < this.height)
            num += (this.flagged[x - 1][y + 1]) ? 1 : 0
        if (x - 1 >= 0)
            num += (this.flagged[x - 1][y]) ? 1 : 0
        if (x + 1 < this.width && y - 1 >= 0)
            num += (this.flagged[x + 1][y - 1]) ? 1 : 0
        if (x - 1 >= 0 && y - 1 >= 0)
            num += (this.flagged[x - 1][y - 1]) ? 1 : 0
        return num
    }

    open_adjacent_cells(x, y) {
        if (!this.flagged[x][y]) {
            if (this.field[x][y] == 0)
                this.zero_fill(x, y)
            this.opened[x][y] = true
        }
        if (this.opened[x][y] && this.field[x][y] == 9) {
            this.dead = true
            this.on_game_finish()
        }
    } 

    on_number_click(x, y) {
        if (this.field[x][y] == 0) {
            this.zero_fill(x, y)
        } else {
            if (this.opened[x][y] && this.field[x][y] == this.get_flags_around(x, y)) {
                if (x + 1 < this.width)
                    this.open_adjacent_cells(x + 1, y)
                if (x + 1 < this.width && y - 1 >= 0)
                    this.open_adjacent_cells(x + 1, y - 1)
                if (x + 1 < this.width && y + 1 < this.height)
                    this.open_adjacent_cells(x + 1, y + 1)
                if (x - 1 >= 0)
                    this.open_adjacent_cells(x - 1, y)
                if (x - 1 >= 0 && y + 1 < this.height)
                    this.open_adjacent_cells(x - 1, y + 1)
                if (x - 1 >= 0 && y - 1 >= 0)
                    this.open_adjacent_cells(x - 1, y - 1)
                if (y + 1 < this.height)
                    this.open_adjacent_cells(x, y + 1)
                if (y - 1 >= 0)
                    this.open_adjacent_cells(x, y - 1)
            } else {
                this.opened[x][y] = true
            }
        }
    }
        
    on_game_finish() {
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                this.opened[i][j] = true
            }
        }
        this.current_state = 'lost'
    }

    on_game_win() {
        game.dead = true
        this.current_state = 'won'
    }

    zero_fill(x, y) {
        if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1)
            return
        if (this.field[x][y] == 9)
            return
        if (this.opened[x][y])
            return
        this.opened[x][y] = true
        if (this.field[x][y] == 0) {
            this.zero_fill(x, y + 1)
            this.zero_fill(x, y - 1)
            this.zero_fill(x + 1, y)
            this.zero_fill(x - 1, y)
            this.zero_fill(x + 1, y + 1)
            this.zero_fill(x + 1, y - 1)
            this.zero_fill(x - 1, y + 1)
            this.zero_fill(x - 1, y - 1)
        }
    }

    draw_cell(x, y) {
        if (((x == 0 && y == 0) || (x == WIDTH - 1 && y == HEIGHT - 1)) && !this.opened[x][y]) 
            image(img[12], x * this.cell_size + 1, y * this.cell_size + 1, this.cell_size - 2, this.cell_size - 2)
        else if (!this.flagged[x][y] && this.opened[x][y])
            image(img[this.field[x][y]], x * this.cell_size + 1, y * this.cell_size + 1, this.cell_size - 2, this.cell_size - 2)
        else if (this.flagged[x][y])
            image(img[10], x * this.cell_size + 1, y * this.cell_size + 1, this.cell_size - 2, this.cell_size - 2)
        else 
            image(img[11], x * this.cell_size + 1, y * this.cell_size + 1, this.cell_size - 2, this.cell_size - 2)     
    }

    open_cell(xy) {
        if (!this.dead) {
            if (!this.flagged[xy[0]][xy[1]]) {
                if (this.field[xy[0]][xy[1]] == 9) {
                    this.on_game_finish()
                    this.dead = true
                } else if (this.field[xy[0]][xy[1]] == 0) {
                    this.zero_fill(xy[0], xy[1])
                }
                if (this.opened[xy[0]][xy[1]])
                    this.on_number_click(xy[0], xy[1])
                this.opened[xy[0]][xy[1]] = true
            }
        }
    }

    flag_cell(xy) {
        if (!this.dead && !this.opened[xy[0]][xy[1]]) {
            this.flagged[xy[0]][xy[1]] = !this.flagged[xy[0]][xy[1]]
        }
    }

    draw() {
        this.total_opened = 0
        this.total_flagged = 0
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                this.draw_cell(i, j)
                if (this.opened[i][j]) {
                    this.total_opened += 1
                }
                if (this.flagged[i][j]) {
                    this.total_flagged += 1
                }
            }
        }
        if (this.total_opened == this.width * this.height - this.mines) 
            this.on_game_win()
    }
}

function send_data() {
    data_dict = {
        "nickname": nickname,
        "ip": client_ip,
        "total_opened": game.total_opened,
        "total_flagged": game.total_flagged,
        "game_state": game.current_state,
        "win_amount": win_amount
    }
    $.post("/postdata", {
        data: JSON.stringify({data_dict})
    })
}

function generate_field() {
    new_game()
    return new Promise(function(resolve, reject) {
        $.get({
            url: "/generate",
            success: function(data) {
                resolve(data)
            }
        })
    }).then(function(result) {
        game.field = JSON.parse(result)
    })
}

function get_field_from_server() {
    $.get({
        url: "/get_minefield",
        success: function(data) {
            console.log(data)
            game.field = JSON.parse(data)
        }
    })

}

function display_others_data() {
    for (var i = 0; i < players_data.length; i++) {
        var current_player = players_data[i]
        var tmp = document.getElementById('nickname' + i)
        tmp.innerHTML = current_player['nickname'] + '  ' +
                        current_player['total_opened'] + '  ' + 
                        current_player['game_state'] + '  ' + 
                        current_player['total_flagged'] + '  ' +
                        current_player['win_amount']
    }
}

function on_game_end() {
    $.get({
        url: '/check_for_game_end',
        success: function(data) {
            if (data['game_ended']) {
                game.field = data['new_field']
                last_triggered_event = [data['name'], data['end_state']]
                // console.log(data)
                if (last_triggered_event[1] == 'won') {
                    alert(data['name'] + ' WON')
                } else {
                    alert(data['name'] + ' LOST')
                }
                new_game()
            }
        }
    })
}

function send_nickname() {
    nickname = document.getElementById('nickname_input').value
    // console.log(nickname)
    $.post("/change_nickname", {
        data: JSON.stringify({"ip": client_ip, "new_nickname": nickname})
    })
    send_data()
    display_nickname = nickname.split(' ')[0]
    if (display_nickname.length > 15) {
        document.getElementById('navbar-nickname').innerHTML = display_nickname.slice(0, 15) + '...'
    } else {
        document.getElementById('navbar-nickname').innerHTML = display_nickname
    }   
}

function get_client_ip() {
    $.get({
        url: '/get_client_ip', 
        success: function(data) {
            console.log(data)
            nickname = data['ip']
            client_ip = data['ip']
            send_data()
            get_user_nickname()
        }
    })
}

function get_user_nickname() {
    $.get({
        url: '/get_username',
        success: function(data) {
            nickname = data
        }
    })
}


function get_players_data() {
    $.get({
        url: '/get_players_data',
        success: function(data) {
            amount_prev = players_data.length
            players_data = []
            for (var i in data) {
                // players_data = data
                players_data.push(data[i])
                if (data[i]['ip'] == client_ip) {
                    win_amount = data[i]['win_amount']
                    // console.log(data)
                }
            }
            // if (amount_prev != players_data.length && players_data.length != 1) {
            //     alert('new player joined, reloading the page' + players_data)
            //     location.reload()
            // }
            // console.log(players_data)
            display_others_data()
        }
    })
}

function new_game() {
    game = new Game(game_field, WIDTH, HEIGHT, MINES)
    get_field_from_server()
}

//p5.js functions
function preload() {
    img.push(loadImage("./static/img/0.jpg"))
    img.push(loadImage("./static/img/1.jpg"))
    img.push(loadImage("./static/img/2.jpg"))
    img.push(loadImage("./static/img/3.jpg"))
    img.push(loadImage("./static/img/4.jpg"))
    img.push(loadImage("./static/img/5.jpg"))
    img.push(loadImage("./static/img/6.jpg"))
    img.push(loadImage("./static/img/7.jpg"))
    img.push(loadImage("./static/img/8.jpg"))
    img.push(loadImage("./static/img/mine.jpg"))
    img.push(loadImage("./static/img/flagged.jpg"))
    img.push(loadImage("./static/img/empty.jpg"))
    img.push(loadImage("./static/img/empty_safe.jpg"))
}

var game_launched = false
function setup() {
    $.get({
        url: '/get_field_measures',
        success: function(data) {
            WIDTH = data['width']
            HEIGHT = data['height']
            MINES = data['mines']
            canvas = createCanvas(WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE)
            canvas.drawingContext.imageSmoothingEnabled = false
            canvas.parent('minefield')
            frameRate(FPS) 
            console.log('width', WIDTH, HEIGHT)
            new_game()
            get_client_ip()
            // Disable right-click on the field (for better flag-placing)
            document.oncontextmenu = function() { return false; }
            game_launched = true
        }
    })
}

var count = 0
function draw() {
    if (game_launched) {
        push()
        count += 1
        if (!game.dead)
            game.draw()
        if (count == FPS / DATA_SENT_PER_SECOND) {
            send_data()
            get_players_data()
            on_game_end()
            count = 0
        }
        pop()
    }
}

// Mouse control functions
let mouse_lock_right = false
let mouse_lock_left = false
var mouse_is_inverted = false
function mousePressed() {
    if (mouseX > 0 && mouseY > 0 && mouseX < WIDTH * CELL_SIZE && mouseY < HEIGHT * CELL_SIZE) {
        if (!mouse_is_inverted) {
            if (mouseButton == RIGHT) {
                mouse_lock_right = true
                game.flag_cell([Math.floor(mouseX / 30), Math.floor(mouseY / 30)])
            }
            if (mouseButton == LEFT) {
                mouse_lock_left = true
                game.open_cell([Math.floor(mouseX / 30), Math.floor(mouseY / 30)])
            }
        } else {
            if (mouseButton == LEFT) {
                mouse_lock_right = true
                game.flag_cell([Math.floor(mouseX / 30), Math.floor(mouseY / 30)])
            }
            if (mouseButton == RIGHT) {
                mouse_lock_left = true
                game.open_cell([Math.floor(mouseX / 30), Math.floor(mouseY / 30)])
            }
        }
    }
}

function mouseReleased() {
    mouse_lock_right = false
    mouse_lock_left = false
}