// Made by RandoM, 2021
const FPS = 20, DATA_SENT_PER_SECOND = 2
var MINES = 40, WIDTH = 16, HEIGHT = 16, CELL_SIZE = 30

var img = []
var game_field, game_height = 10, game_width = 10
var last_triggered_event
var win_amount = 0
var nickname = ''
var shortened_nickname = ''
var client_ip = ''
var players_data = []
var chat_messages = []

$(document).ready(() => {
    console.log('im ready')
    $('#chat_body').scrollTop($('#chat_body')[0].scrollHeight);
})

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

    constructor(field, width, height, mines) {
        this.field = field
        this.width = width
        this.height = height 
        this.mines = mines
        for (var i = 0; i < width; i++) {
            var tmp1 = [], tmp2 = []
            for (var j = 0; j < height; j++) {
                tmp1.push(false)
                tmp2.push(false)
            }
            this.flagged.push(tmp1)
            this.opened.push(tmp2)
        }
        console.log('constructor', this.field, this.width, this.height, this.mines, this.opened)
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
        this.flagged[x][y] = false
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

    open_cell(x, y) {
        if (!this.dead) {
            if (!this.flagged[x][y]) {
                if (this.field[x][y] == 9) {
                    this.on_game_finish()
                    this.dead = true
                } else if (this.field[x][y] == 0) {
                    this.zero_fill(x, y)
                }
                if (this.opened[x][y])
                    this.on_number_click(x, y)
                this.opened[x][y] = true
            }
        }
    }

    flag_cell(x, y) {
        if (this.opened[x][y]) {
            this.on_number_click(x, y)
        } else if (!this.dead && !this.opened[x][y]) {
            this.flagged[x][y] = !this.flagged[x][y]
        }
    }

    draw() {
        this.total_opened = 0
        this.total_flagged = 0
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
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

function get_field_from_server() {
    $.get({
        url: "/get_minefield",
        success: function(data) {
            console.log(data)
            game.field = JSON.parse(data)
            console.log(game.field)
            console.log(game.field[0][4], game.field[4][0])
        }
    })
}



function display_others_data() {
    for (var i = 0; i < 11; i++) {
        // document.getElementById('nickname_title' + i).innerHTML = ''
        document.getElementById('nickname_card' + i).style.visibility = 'hidden'
    }
    for (var i = 0; i < players_data.length; i++) {
        var current_player = players_data[i]
        var nickname_title_label = document.getElementById('nickname_title' + i.toString())
        // var nickname_label = document.getElementById('nickname_label' + i.toString())
        var opened_percent = round((current_player['total_opened'] / (WIDTH * HEIGHT - MINES)) * 100)
        // var flagged_percent = round((current_player['total_flagged'] / MINES) * 100)
        // fixes the weird blinking on 0 flags
        if (current_player['total_flagged'] == 0) {
            $('#nickname_flagged_bar' + i).css('width', '0%')    
        }
        if (current_player['game_state'] == 'lost') {
            $('#nickname_card' + i).addClass('bg-danger')
        } else if (current_player['game_state'] == 'nothing') {
            $('#nickname_card' + i).removeClass('bg-danger')
            $('#nickname_card' + i).removeClass('bg-success')
        } else {
            $('#nickname_card' + i).addClass('bg-success')
        }
        // console.log(opened_percent, flagged_percent, MINES)
        $('#nickname_opened_bar' + i).css('width', opened_percent + '%')
        $('#nickname_flagged_label' + i).html(current_player['total_flagged'] + ' / ' + MINES)
        document.getElementById('nickname_card' + i).style.visibility = 'visible'
        nickname_title_label.innerHTML = current_player['nickname']
        // $('#nickname_flagged_label' + i).css('width', flagged_percent + '%')
        // nickname_label.innerHTML = current_player['nickname']
        // $('#nickname_label' + i).innerHTML = current_player['nickname']
        // tmp.innerHTML = current_player['nickname'] + '  ' +
        //                 current_player['total_opened'] + '  ' + 
        //                 current_player['game_state'] + '  ' + 
        //                 current_player['total_flagged'] + '  ' +
        //                 current_player['win_amount']
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
                // if (last_triggered_event[1] == 'won') {
                //     // alert(data['name'] + ' Won')
                // }
                players_data = []
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
    shortened_nickname = shorten_nickname(nickname)
}

function shorten_nickname() {

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
            // amount_prev = players_data.length
            players_data = []
            for (var i in data) {
                // players_data = data
                players_data.push(data[i])
                if (data[i]['ip'] == client_ip) {
                    // win_amount = data[i]['win_amount']
                    document.getElementById('navbar-nickname').innerHTML = data[i]['nickname']
                    // console.log(data[i]['nickname'])
                    // console.log(data)
                }
                // console.log(data[i]['nickname'])
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

// Forced to do "player_left" because beforeunload doesn't always work, so this kinda improves reliability
var player_left = false
function on_player_leave() {
    if (!player_left) {
        $.post("/on_player_exit", {
            data: client_ip
        })
        player_left = true
    }
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
            console.log('width, height, mines', WIDTH, HEIGHT, MINES)
            new_game()
            get_client_ip()
            // Disable right-click on the field (for better flag-placement)
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
            display_chat_messages()
            count = 0
        }
        pop()
    }
}

// Mouse control handling
let mouse_lock_right = false
let mouse_lock_left = false
function mousePressed() {
    if (mouseX > 0 && mouseY > 0 && mouseX < WIDTH * CELL_SIZE && mouseY < HEIGHT * CELL_SIZE) {
        console.log([Math.floor(mouseX / 30), Math.floor(mouseY / 30)])
        if (mouseButton == RIGHT) {
            mouse_lock_right = true
            game.flag_cell(Math.floor(mouseX / 30), Math.floor(mouseY / 30))
        }
        if (mouseButton == LEFT) {
            mouse_lock_left = true
            game.open_cell(Math.floor(mouseX / 30), Math.floor(mouseY / 30))
        }
    }
}

function mouseReleased() {
    mouse_lock_right = false
    mouse_lock_left = false
}

// Chat handling
$(document).on("keyup", (event) => {
    if (event.keyCode === 13) { 
        $("#send_message_btn").click(); 
    } 
})

function send_message() {
    if ($('#chat_input').val() == '/force_restart') {
        $.get({
            url: "/force_restart",
            success: (data) => {
                location.reload()
                $.post("/send_message", {
                    data: JSON.stringify([nickname, 'SHIFT F5']),
                })
            }
        })
    } else if ($('#chat_input').val() == '/change_game_end') {
        $.get({
            url: "/change_end_state",
            success: (data) => {
                location.reload()
            }
        })
        $('#chat_input').val('')
    }  else if ($('#chat_input').val() != '') {
        $.post("/send_message", {
            data: JSON.stringify([nickname, $('#chat_input').val()]),
        })
        $('#chat_input').val('')
    }   
}

function display_chat_messages() {
    $.get({
        url: "/get_messages_list",
        success: (data) => {
            chat_messages = data
            // [['R', 'asdasd'], ['F', 'adasdasd']]
            // console.log(chat_messages)
            for (var i = 0; i < 20; i++) {
                $('#chat_bubble' + i).css("visibility", "hidden")
            }
            var i = 0
            for (var message in chat_messages) {
                i += 1
                // console.log(message)
                $('#chat_bubble' + (20 - i)).css("visibility", "visible")
                $('#chat_message_sender' + (20 - i)).html('<i>' + chat_messages[message][0] + '</i>')
                $('#chat_message_content' + (20 - i)).html(chat_messages[message][1])
            }
        }
    })
}