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
        for (var i = 0; i < height; i++) {
            var tmp1 = [], tmp2 = []
            for (var j = 0; j < width; j++) {
                tmp1.push(false)
                tmp2.push(false)
            }
            this.flagged.push(tmp1)
            this.opened.push(tmp2)
        }
        // console.log('constructor', this.field, this.width, this.height, this.mines, this.opened)
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

function get_field_from_server() {
    

    // $.get({
    //     url: "/get_minefield",
    //     success: function(data) {
    //         console.log(data)
    //         game.field = JSON.parse(data)
    //         console.log(game.field)
    //         console.log(game.field[0][4], game.field[4][0])
    //     }
    // })
}


function new_game() {
    field = [[0, 0, 0, 0, 0, 0, 0, 1, 9, 1, 0, 0, 0, 1, 9], 
    [0, 0, 1, 1, 1, 0, 1, 2, 2, 1, 0, 0, 0, 2, 2], 
    [0, 0, 1, 9, 1, 0, 1, 9, 1, 0, 0, 0, 0, 1, 9], 
    [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1], 
    [1, 1, 0, 0, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0], 
    [9, 1, 0, 0, 1, 9, 2, 9, 1, 0, 0, 0, 0, 0, 0], 
    [1, 1, 0, 0, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0], 
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [1, 2, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [9, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    game = new Game(field, WIDTH, HEIGHT, MINES)
    
    // get_field_from_server()
}

// Forced to do "player_left" because beforeunload doesn't always work, so this kinda improves reliability


//p5.js functions
function preload() {
    img.push(loadImage('/img/-10.jpg'))
    img.push(loadImage('/img/0.jpg'))
    img.push(loadImage("./img/1.jpg"))
    img.push(loadImage("2.jpg"))
    img.push(loadImage("img/3.jpg"))
    // img.push(loadImage("img/4.jpg"))
    // img.push(loadImage("img/5.jpg"))
    // img.push(loadImage("img/6.jpg"))
    // img.push(loadImage("img/7.jpg"))
    // img.push(loadImage("img/8.jpg"))
    // img.push(loadImage("img/mine.jpg"))
    // img.push(loadImage("img/flagged.jpg"))
    // img.push(loadImage("img/empty.jpg"))
    // img.push(loadImage("img/empty_safe.jpg"))
    console.log(img)
}

var game_launched = false
function setup() {
    // $.get({
    //     url: '/get_field_measures',
    //     success: function(data) {
            // WIDTH = data['width']
            // HEIGHT = data['height']
            // MINES = data['mines']
    WIDTH = 15
    HEIGHT = 10
    MINES = 10
    canvas = createCanvas(WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE)
    canvas.drawingContext.imageSmoothingEnabled = false
    canvas.parent('minefield')
    frameRate(FPS) 
    console.log('width, height, mines', WIDTH, HEIGHT, MINES)
    new_game()
    // get_client_ip()
    // Disable right-click on the field (for better flag-placement)
    document.oncontextmenu = function() { return false; }
    game_launched = true
    //     }
    // })
}

// var count = 0
// function draw() {
//     if (game_launched) {
//         push()
//         count += 1
//         if (!game.dead)
//             game.draw()
//         if (count == FPS / DATA_SENT_PER_SECOND) {
//             // send_data()
//             // get_players_data()
//             // on_game_end()
//             // display_chat_messages()
//             count = 0
//         }
//         pop()
//     }
// }

// Mouse control handling
let mouse_lock_right = false
let mouse_lock_left = false
function mousePressed() {
    if (mouseX > 0 && mouseY > 0 && mouseX < WIDTH * CELL_SIZE && mouseY < HEIGHT * CELL_SIZE) {
        console.log([Math.floor(mouseY / 30), Math.floor(mouseX / 30)])
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
