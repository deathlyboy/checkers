import os
import json
from flask import Flask, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send, emit, join_room


app = Flask(__name__)
app.config["SECRET_KEY"] = "oi23jjfj8932u0uj%&Y#*&YH#@*jjsoij"

base_dir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(base_dir, 'database.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
db = SQLAlchemy(app)

socketio = SocketIO(app, cors_allowed_origins="*")


class GamesDB(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    checkers = db.Column(db.JSON, nullable=False)
    curren_move_color = db.Column(db.String, nullable=False)
    must_hit = db.Column(db.JSON, nullable=False)


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.JSON, nullable=False, unique=True)


def gen_start_checkers_pos():
    checkers = []

    for row in range(0, 3):
        if row == 0 or row == 2:
            start = 1
        else:
            start = 0

        for square in range(start, 8, 2):
            checkers.append({"row": row, "square": square, "color": "black", "queen": False})

    for row in range(5, 8):
        if row == 6:
            start = 1
        else:
            start = 0

        for square in range(start, 8, 2):
            checkers.append({"row": row, "square": square, "color": "white", "queen": False})

    return checkers


@app.route("/api/get_checkers_pos/<game_id>")
def get_checkers_pos(game_id):
    with app.app_context():
        checkers = GamesDB.query.filter_by(id=game_id).all()[0].checkers

    return checkers


@app.route("/api/table_state/<game_id>")
def get_current_move_color(game_id):
    with app.app_context():
        game = GamesDB.query.filter_by(id=game_id).first()

    return {"checkers": game.checkers,
            "id": game.id,
            "curren_move_color": game.curren_move_color,
            "must_hit": game.must_hit}


@socketio.on('connect')
def handle_connect():
    print('Connected')


@socketio.on('join_room')
def handle_join_room(data):
    room_id = data['room_id']
    join_room(room_id)
    print('User', 'joined room', room_id)


@socketio.on('leave_room')
def handle_leave_room(data):
    room_id = data['room_id']
    leave_room(room_id)
    print('User', request.sid, 'left room', room_id)


@socketio.on('table_state')
def table_state(data):
    room_id = data['room_id']
    board_state = data['board_state']
    print('Received message:', board_state)

    with app.app_context():
        game = db.session.get(GamesDB, room_id)
        game.checkers = board_state["checkers"]
        game.curren_move_color = board_state["curren_move_color"]
        game.must_hit = board_state["must_hit"]
        db.session.commit()

    emit('table_state', board_state, broadcast=True, room=room_id)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/game/session/<game_id>/<color>")
def game(game_id, color):
    return render_template("index.html")


@app.route("/game/start/<color>")
def game_start(color):
    with app.app_context():
        checkers = GamesDB(checkers=gen_start_checkers_pos(), curren_move_color="white", must_hit={})
        db.session.add(checkers)
        db.session.commit()

        game_id = checkers.id

    return redirect(f"/game/session/{game_id}/{color}")



if __name__ == '__main__':
    with app.app_context():  # Устанавливаем контекст приложения
        db.create_all()

    socketio.run(app)
