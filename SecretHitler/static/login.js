
// Registering host --------------------------------------------------------------------------------------------------------------------------------------------
function register_me_as_host(){
    socket.emit('register_host', this_user_id);
}

socket.on('return_register_host', function(data) {
    registered = data[0]
    host_sid = data[1]
    host_id = data[2]
    gameState = data[3]
    
    if (registered) {
        console.log('You are host!!!');
        userInGameStatus = 'Host'
        this_user_name = "Host"
        hostScreen('', '');
        emit_to_host(HOST_reset_new_players, 'Host', []);
    } else {
        console.log('There is already a host...\nYoull be a player...');
        loginScreen('')
    }
});
// Registering host --------------------------------------------------------------------------------------------------------------------------------------------
// LOGIN --------------------------------------------------------------------------------------------------------------------------------------------
var loginInput = document.createElement('input');
function loginScreen(againStatus) {
    userInGameStatus = 'Login'

    clearBody();
    if(againStatus=='NoHost'){
        createText('black', "There is no host tv yet...");
    }
    if(againStatus=='NameInUse'){
        createText('black', "Name already in use...");
    }
    if(againStatus=='NameBlank'){
        createText('black', "Name is blank...");
    }
    if(againStatus=='NameHost'){
        createText('black', "Name cannot be Host...");
    }
    createText('black', "Enter Name:");

    // Input name
    loginInput = document.createElement('input');
    loginInput.type = 'text';
    loginInput.id = 'text-input';
    document.body.appendChild(loginInput);

    // Submit name button
    var submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.onclick = function() {
        this_user_name = loginInput.value;
        this_user_name = this_user_name.replace(/\s/g, '');
        if(this_user_name=='' ){
            screenLogin('NameBlank');
        }
        else if(this_user_name=='Host' ){
            screenLogin('NameHost');
        }
        else{  
            clearBody();
            socket.emit('register_name_and_id', [this_user_id, this_user_name]);
        }
    };
    document.body.appendChild(submitButton);
    
}

socket.on('return_register_name_and_id', function(data) {
    registered = data[0]
    // data[1] data[2]
    if(registered=='NoHost'){
        loginScreen('NoHost')
    } 
    else if(registered=='GameStarted'){
        gameStartedScreen()
    }
    else if (registered=='NameInUse'){
        console.log('Name already registered in the game...');
        loginScreen('NameInUse')
    }
});

function gameStartedScreen(){
    clearBody();
    createText('black', this_user_name);
    createText('black', 'Game has already started....');
}

function loginWaitScreen(elements) {
    userInGameStatus = 'InGame'
    listOfClientInfo = elements[0];
    
    player_info = getNamePlayerInfo(this_user_name, listOfClientInfo);

    clearBody();
    createText('black', "WAITING FOR OTHER PLAYERS...");
    if(player_info.vip){
        createText('black', this_user_name+": VIP")
        if(listOfClientInfo.length >= 5){            
            // Start game button
            var button = document.createElement('button');
            button.textContent = 'Start Game';
            button.onclick = function() {
                clearBody();
                emit_to_host(HOST_start_game_setup, 'Host', []);
            };
            document.body.appendChild(button);
        }
    }
    else{
        createText('black', this_user_name)
    }
}

// LOGIN --------------------------------------------------------------------------------------------------------------------------------------------
// HOST add player ---------------------------------------------------------------------------------------------------------------------------------------------
socket.on('asking_host_to_register', function(elements) {
    socket.emit('host_registering_name_and_id', elements);
})
socket.on('add_name', function(elements) {

    that_user_sid = elements[0]
    that_user_id = elements[1]
    that_user_name = elements[2]

    for(var i = 0; i < listOfClientInfo.length; i++){
        if(listOfClientInfo[i].name == that_user_name){
            listOfClientInfo[i].id = that_user_id
            emit_to_player_id(PLAYER_game_state_info, that_user_id, [listOfClientInfo, gameState, drawPolicyPile, gameElement]);
            return 0
        }
    }

    vip = listOfClientInfo.length == 0
    listOfClientInfo.push(createClientInfoTemp(that_user_id, that_user_name, vip));

    emit_to_player_id(PLAYER_game_state_info, that_user_id, [listOfClientInfo, gameState, drawPolicyPile])
    if(gameState =='Login' && listOfClientInfo.length >= 5){
        vip_user_id = getVIPPlayerInfo(listOfClientInfo).id
        emit_to_player_id(PLAYER_game_state_info, vip_user_id, [listOfClientInfo, gameState, drawPolicyPile])
    }

    hostScreen('', '');
})
// HOST add player ---------------------------------------------------------------------------------------------------------------------------------------------
// HOST_reset_new_players -----------------------------------------------------------------------------------------------------------------------------------------

function HOST_reset_new_players(){
    socket.emit('reset_game', 'Login');
    ChangeGameState('Login')
    listOfClientInfo = []
    emit_back_to_login([listOfClientInfo, gameState, drawPolicyPile]);
    hostScreen('', '');
}
socket.on('back_to_login', function(elements) {

    if(this_user_name != 'Host'){
        listOfClientInfo = elements[0];
        gameState = elements[1];
        drawPolicyPile = elements[2];
        loginScreen('')
    }
})
// HOST_reset_new_players -----------------------------------------------------------------------------------------------------------------------------------------