import socket
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

host = {'sid': None, 'id': None}
clients = {}
thisGameState = 'Login'

# Route connecting -------------------------------------------------------------

@app.route('/')
def index():
    return render_template('index.html', host='NO')
@app.route('/host')
def index_host():
    return render_template('index.html', host='YES')

# Route connecting -------------------------------------------------------------
# Registering host --------------------------------------------------------------

@socketio.on('register_host')
def handle_register_host(id):
    global host, clients, thisGameState

    if host['id'] is None :
        print('register_host True', id,'\n',clients,'\n')
        host['sid'] = request.sid
        host['id'] = id
        emit('return_register_host', [True, request.sid, id, thisGameState], room=request.sid)
    else:
        print('register_host False', id,'\n',clients,'\n')
        emit('return_register_host', [False, host['sid'], host['id'], thisGameState], room=request.sid)
# Registering host --------------------------------------------------------------
# Registring player ----------------------------------------------------------------

@socketio.on('register_name_and_id')
def handle_register_name_and_id(data):
    global host, clients, thisGameState
    print('register_name_and_id', data,'\n',clients,'\n')

    id, name = data

    if host['id'] is None :
        print('Host does not exits','\n',clients,'\n')
        emit('return_register_name_and_id', ['NoHost', None, None, None], room=request.sid)
        return

    for _,e in clients.items():
        if name == e['name']:
            if e['id'] is not None:
                print('Name already in use.','\n',clients,'\n')
                emit('return_register_name_and_id', ['NameInUse', e['name'], e['id'], thisGameState], room=request.sid)
                return
            else:
                print('Asking host to register name.','\n',clients,'\n')
                emit('asking_host_to_register', [request.sid, id, name], room=host['sid'])
                return

    if thisGameState != 'Login':
        print('Game Already started.','\n',clients,'\n')
        emit('return_register_name_and_id', ['GameStarted', None, None, None], room=request.sid)
        return

            
    print('Asking host to register name.','\n',clients,'\n')
    emit('asking_host_to_register', [request.sid, id, name], room=host['sid'])


@socketio.on('host_registering_name_and_id')
def handle_host_registering_name_and_id(data):
    global host, clients, thisGameState
    print('host_registering_name_and_id', data,'\n',clients,'\n')

    sid, id, name = data
    for csid in clients:
        if clients[csid]['name'] == name:
            del clients[csid]
            break
    clients[sid] = {'name': name, 'id': id}
    emit('add_name', [request.sid, id, name], room=host['sid'])
    
# Registring player ----------------------------------------------------------------
# Other functions ----------------------------------------------------------------

@socketio.on('reset_game')
def handle_reset_game(gameState):
    global host, clients, thisGameState
    clients = {}
    thisGameState = gameState
    print('reset_clients', thisGameState, '\n',clients,'\n')

@socketio.on('change_game_state')
def handle_change_game_state(gameState):
    global host, clients, thisGameState
    print('change_game_state', gameState,'\n',clients,'\n')

    thisGameState = gameState

# Other functions ----------------------------------------------------------------
# emit functions ---------------------------------------------------------------------------

@socketio.on('emit_back_to_login')
def handle_emit_back_to_login(elements):
    global host, clients, thisGameState
    emit('back_to_login', elements, broadcast=True)
    
@socketio.on('emit_to_host')
def handle_emit_to_host(elements):
    global host, clients, thisGameState

    host_sid = host['sid']
    if(host_sid is None):
        print('***HOST DOES NOT EXIST!!!***','\n',clients,'\n')
        return

    funcName = elements[0].split('(')[0].replace('function', '')
    print("emit_to_host", funcName, elements[1:],'\n',clients,'\n')
    emit("return_emit_to_host", elements, room=host_sid)

@socketio.on('emit_to_player_id')
def handle_emit_to_player_id(elements):
    global host, clients, thisGameState

    player_id = elements[2]
            
    funcName = elements[0].split('(')[0].replace('function', '')
    print("emit_to_player_id", funcName, elements[1:],'\n',clients,'\n')

    for player_sid, e in clients.items():
        if e['id'] == player_id:
            emit("return_emit_to_player_id", elements, room=player_sid)
            return
        
    print(f'***PLAYER {player_id} DOES NOT EXIST!!!***','\n',clients,'\n')

@socketio.on('emit_to_players')
def handle_emit_to_players(elements):
    global host, clients, thisGameState
    
    funcName = elements[0].split('(')[0].replace('function', '')
    print("emit_to_players", funcName, elements[1:],'\n',clients,'\n')
    
    for player_sid, e in clients.items():
        emit("return_emit_to_players", elements, room=player_sid)

# emit functions ---------------------------------------------------------------------------
# Connection issues -----------------------------------------------------------

@socketio.on('connect')
def handle_connect():
    global host, clients, thisGameState

    client = clients.get(request.sid)
    if(client is not None):
        clients[request.sid]['id'] = None
    if(request.sid == host['sid']):
        host = {'sid': None, 'id': None}
    print('Client connect', client, request.sid,'\n',clients,'\n')
    return render_template('index.html', host='NO')

@socketio.on('disconnect')
def handle_disconnect():
    global host, clients, thisGameState

    client = clients.get(request.sid)
    if(client is not None):
        clients[request.sid]['id'] = None
    if(request.sid == host['sid']):
        host = {'sid': None, 'id': None}
    print('Client disconnect', client, request.sid,'\n',clients,'\n')
    return render_template('index.html', host='NO')

# Connection issues -----------------------------------------------------------

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == '__main__':
    print(f"To run host copy this into your browser:\n{get_local_ip()}:5000\\host")
    print(f"To run client copy this into your browser:\n{get_local_ip()}:5000\n")
    socketio.run(app, host='0.0.0.0', port=5000)