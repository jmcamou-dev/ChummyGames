var socket = io.connect('http://' + document.domain + ':' + location.port);
var imageFolder = '/static/images/'

//AUDIO
var audioCHAN = new Audio('/static/audio/ChooseChancellor.m4a');
audioCHAN.muted = true;
function playAudio(audioName){
    audioCHAN = new Audio('/static/audio/'+audioName+'.m4a');
    audioCHAN.play();
}

var this_user_id = "ID_" + Math.floor(100000 + Math.random() * 900000).toString();
// Login | ChooseChancellor | VoteChancellor | RemovePolicy | ChoosePolicy (VETO) | ExaminPolicy | ChooseExaminPlayer | ExaminPlayer | ChooseKillPlayer | ChoosePresidentPlayer | GameEnd (VIP new/same players)
var gameState = 'Login'
// Host |+| Login | InGame | Dead
var userInGameStatus = ''
var this_user_name = ""

var gameElement = ''

var listOfClientInfo = []

var drawPolicyPile = createDrawPolicyPile()
var discardPolicyPile = []
var fascist_score  = 0
var liberal_score = 0
var vote_retry_count = 1
var president_veto = false
var chancellor_veto = false
var FascistBoardImage = ''

function createClientInfoTemp(id, name, vip) {
    var tmpobj = {
        'id': id,
        'name': name,
        'vip': vip,
        'connectionStatus': 'GOOD',

        //Game variables
        'inGameStatus': 'InGame',
        'identity': 'Liberal',
        'president': false,
        'chancellor': false,
        'vote': 'NULL'

    };
    return tmpobj;
};
function createDrawPolicyPile(){
    var drawPolicyPile = []
    for(var i = 0; i < 11; i++){
        drawPolicyPile.push('FASCIST')
    }
    for(var i = 0; i < 6; i++){
        drawPolicyPile.push('LIBERAL')
    }
    return shuffle(shuffle(drawPolicyPile))
}
// EMIT -------------------------------------------------------------------------------------------------------------------

function emit_back_to_login(func, to_user_id, elements){
    socket.emit('emit_back_to_login', [func.toString(), this_user_id, to_user_id].concat(elements));
}

function emit_change_game_state(newGameState){
    socket.emit('change_game_state', newGameState);
}
function emit_to_host(func, to_user_id, elements){
    socket.emit('emit_to_host', [func.toString(), this_user_id, to_user_id].concat(elements));
}
socket.on('return_emit_to_host', function(elements) { 

    func=eval("(" + elements[0] + ")");
    that_user_id = elements[1]
    to_user_id = elements[2]
    elements =  elements.slice(3)

    func(that_user_id, elements);
    
})
function emit_to_player_id(func, to_user_id, elements){
    socket.emit('emit_to_player_id', [func.toString(), this_user_id, to_user_id].concat(elements));
}
socket.on('return_emit_to_player_id', function(elements) { 

    func=eval("(" + elements[0] + ")");
    that_user_id = elements[1]
    to_user_id = elements[2]
    elements =  elements.slice(3)

    func(that_user_id, elements);
    
})
function emit_to_players(func, to_user_id, elements){
    socket.emit('emit_to_players', [func.toString(), this_user_id, to_user_id].concat(elements));
}
socket.on('return_emit_to_players', function(elements) { 

    func=eval("(" + elements[0] + ")");
    that_user_id = elements[1]
    to_user_id = elements[2]
    elements =  elements.slice(3)

    func(that_user_id, elements);
    
})
// EMIT ----------------------------------------------------------------------------------------------------------------------
//FUNCTIONS -------------------------------------------------------------------------------------------------------------------

function idInAndGoodPlayerInfo(id){
    for (var i = 0; i < listOfClientInfo.length; i++) {
        if(listOfClientInfo[i].id==id && listOfClientInfo[i].connectionStatus == 'GOOD'){
            return true
        }
    }
    return false
}
function getNamePlayerInfo(name, listOfClientInfo){
    for (var i = 0; i < listOfClientInfo.length; i++) {
        if(listOfClientInfo[i].name==name){
            return listOfClientInfo[i]
        }
    }
    return ''
}
function getVIPPlayerInfo(listOfClientInfo){
    for (var i = 0; i < listOfClientInfo.length; i++) {
        if(listOfClientInfo[i].vip){
            return listOfClientInfo[i]
        }
    }
    return ''
}
function identityList(listOfClientInfo){
    lstidentity = []
    for(var i = 0; i < listOfClientInfo.length; i++){
        if(i==0){
            lstidentity.push('Hitler')
        }
        else if(i==1 || i==6 || i==8){
            lstidentity.push('Fascist')
        }
        else{
            lstidentity.push('Liberal')
        }
    }
    return shuffle(shuffle(shuffle(lstidentity)));
}

//FUNCTIONS -------------------------------------------------------------------------------------------------------------------
//SCREENS --------------------------------------------------------------------------------------------------------------------------

function hostScreen(vote, infostr){
    
    clearBody();

    //createText('black', "HOST");
    // if(gameState == 'Login'){
    //     createText('black', `I am host GAME STATE:${gameState} ID:${this_user_id}`);
    // }

    for (var i = 0; i < listOfClientInfo.length; i++) {
        color = 'black'

        player_info = listOfClientInfo[i]
        str = "|\t"+player_info.name//+": "+player_info.id+": "+player_info.identity;
        if(player_info.connectionStatus == 'DISCONNECTED'){
            str += ": DISCONNECTED"
        }
        if(player_info.vip){
            str += ": VIP"
        }
        if(player_info.president){
            str += ": President"
            color = 'blue'
        }
        if( listOfClientInfo[i].inGameStatus == 'Dead'){
            str+= ": DEAD"
            color = 'red'
        }
        if(player_info.chancellor){
            str += ": Chancellor"
            color = 'gold'
        }
        createTextInLine(color, str)
        if(vote=='showShow' && player_info.vote !='null'){
            if(player_info.vote=='ja'){
                createTextInLine('blue', ": VOTE->"+player_info.vote)
            }
            if(player_info.vote=='nein'){
                createTextInLine('red', ": VOTE->"+player_info.vote)
            }
        }
        if(vote=='showHide' && player_info.vote !='null'){
            if(player_info.vote=='ja'){
                createTextInLine('black', "-> VOTED")
            }
        }
        createTextInLine(color, "\t|")
    }
    createText('black', "\n");
    if(gameState == 'Login'){
        var img = document.createElement('img');
        img.src = imageFolder+'Logo.png';
        img.style.width = '50%';
        img.style.height = '50%';
        document.body.appendChild(img);
    }
    else{
        createText('black', "FASCIST score: "+fascist_score.toString());
        createText('black', "LIBERAL score: "+liberal_score.toString());
        createText('black', "\nPOLICY Draw Pile Count: "+drawPolicyPile.length.toString()+"\n");
        createText('red', infostr)
        createBoard()    
    }
    if(gameState=='GameEndFASCIST'||gameState=='GameEndLIBERAL'){
        showPlayerIdentities();
    }

    if(audioCHAN.muted){
        audioButton.textContent = 'UnMute';
        audioButton.addEventListener('click', function() {
            audioCHAN.muted = false;
            if (audioButton && document.body.contains(audioButton)) {
                document.body.removeChild(audioButton);
            }
        });
        document.body.appendChild(audioButton);
    }
    if(!audioCHAN.muted){
        audioButton.textContent = 'Mute';
        audioButton.addEventListener('click', function() {
            audioCHAN.muted = true;
            if (audioButton && document.body.contains(audioButton)) {
                document.body.removeChild(audioButton);
            }
        });
        document.body.appendChild(audioButton);
    }
}
var audioButton = document.createElement('button');


function createBoard(){
    //////////////////////////////////////////////////
    
    // Create parent div
    var parentDiv = document.createElement('div');
    parentDiv.style.position = 'relative';
    parentDiv.style.width = '1318px';  // Set a width and height for the parent div
    parentDiv.style.height = '421px';

    // Create first image
    var img1 = document.createElement('img');
    img1.src = imageFolder+FascistBoardImage+'.png';
    img1.style.position = 'absolute';
    img1.style.zIndex = '1';
    img1.style.width = '100%';  // Set the width and height to match the parent div
    img1.style.height = '100%';
    parentDiv.appendChild(img1);

    // Create second image
    l = 100
    for(var i = 0; i < fascist_score; i++){
        var img2 = document.createElement('img');
        img2.src = imageFolder+'FASCIST_P.png';
        img2.style.position = 'absolute';
        img2.style.zIndex = '2';
        img2.style.top = '120px';  // Position img2 in the center of img1
        if(i<3){
            img2.style.top = '100px';  // Position img2 in the center of img1
        }
        img2.style.left = (l+(i*195)).toString()+'px';
        parentDiv.appendChild(img2);
    }

    // Append parent div to body
    document.body.appendChild(parentDiv);
    

    // Create parent div
    var parentDiv = document.createElement('div');
    parentDiv.style.position = 'relative';
    parentDiv.style.width = '1318px';  // Set a width and height for the parent div
    parentDiv.style.height = '421px';

    // Create first image
    var img1 = document.createElement('img');
    img1.src = imageFolder+'LiberalBoard.png';
    img1.style.position = 'absolute';
    img1.style.zIndex = '1';
    img1.style.width = '100%';  // Set the width and height to match the parent div
    img1.style.height = '100%';
    parentDiv.appendChild(img1);

    // Create second image
    l = 200
    for(var i = 0; i < liberal_score; i++){
        var img2 = document.createElement('img');
        img2.src = imageFolder+'LIBERAL_P.png';
        img2.style.position = 'absolute';
        img2.style.zIndex = '2';
        img2.style.top = '100px';  // Position img2 in the center of img1
        img2.style.left = (l+(i*195)).toString()+'px';
        parentDiv.appendChild(img2);
    }

    // Create second image
    l = 425
    for(var i = 0; i < vote_retry_count; i++){
        var img2 = document.createElement('img');
        img2.src = imageFolder+'VoteTile.png';
        img2.style.position = 'absolute';
        img2.style.zIndex = '2';
        img2.style.top = '350px';  // Position img2 in the center of img1
        img2.style.left = (l+(i*130)).toString()+'px';
        parentDiv.appendChild(img2);
    }

    // Append parent div to body
    document.body.appendChild(parentDiv);//VoteTile
    
    /////////////////////////////////////////////////
}
function showPlayerIdentities(){

    for (var i = 0; i < listOfClientInfo.length; i++) {
        player_info = listOfClientInfo[i]
        str = player_info.name+": "+player_info.identity;
        color = 'black'
        if(player_info.identity == 'Fascist' ||  player_info.identity == 'Hitler'){
            color = 'red'
        }

        
        var div = document.createElement('div');
        div.style.position = "absolute";
        div.style.left = "1350px";
        div.style.top = String(i*50)+"px";
        div.style.color = color;
        div.textContent = str;
        div.style.fontSize = "45px";
        document.body.appendChild(div);
    }
}

//SCREENS --------------------------------------------------------------------------------------------------------------------------







function makePhoneBuzz() {
    if (window.navigator && window.navigator.vibrate) {
        navigator.vibrate(100);
    }
}









function createText(color, text){
    var div = document.createElement('div');
    div.innerText = text;
    div.style.color = color;
    document.body.appendChild(div);
}
function createTextInLine(color, text){
    var div = document.createElement('div');
    div.innerText = text;
    div.style.color = color;
    div.style.display = "inline-block";
    document.body.appendChild(div);
}

function clearBody() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}



showing = false
var otheridentity = document.createElement('div');
otheridentity.innerText = '';
var identityimg = document.createElement('img');
identityimg.src = imageFolder+'ShowIdentity.png';
identityimg.style.width = '10%';
identityimg.style.height = '10%';
player_info = []
function playerScreen(player_info){
    player_info = player_info
    clearBody();
    identityimg.onclick = function() {
        showHideIdentity(player_info);
    };

    str = player_info.name;
    if(player_info.vip){
        str += ": VIP"
    }
    if(player_info.president){
        var img = document.createElement('img');
        img.src = imageFolder+'President.png';
        img.style.width = '25%';
        img.style.height = '25%';
        document.body.appendChild(img);
    }
    if(player_info.chancellor){
        var img = document.createElement('img');
        img.src = imageFolder+'Chancellor.png';
        img.style.width = '25%';
        img.style.height = '25%';
        document.body.appendChild(img);
    }
    createText('black', str)
    document.body.appendChild(identityimg);
    document.body.appendChild(otheridentity);
}
function showHideIdentity(player_info){

    if(showing){
        showing = false
        otheridentity.innerText = '';
        identityimg.src = imageFolder+'ShowIdentity.png';
    }
    else{
        showing = true

        str = "YOU ARE: "+player_info.identity;

        if(player_info.identity == 'Fascist' || (listOfClientInfo.length<7 && player_info.identity == 'Hitler')){
            for (var i = 0; i < listOfClientInfo.length; i++) {
                if(listOfClientInfo[i].id!=player_info.id && listOfClientInfo[i].identity != 'Liberal'){
                    str += "\n"+listOfClientInfo[i].name+": "+listOfClientInfo[i].identity;
                }
            }
        }
        otheridentity.innerText = str;
        identityimg.src = imageFolder+`${player_info.identity}.png`;
    }
}


// OTHER --------------------------

function elementInList(element, lst){
    return lst.indexOf(element) !== -1
}