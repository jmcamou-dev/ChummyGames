
function PLAYER_identityShowingFalse(that_user_id, elements) {
    
    clearBody();
    showing = false
    otheridentity.innerText = '';
    identityimg.src = imageFolder+'ShowIdentity.png';
}

function PLAYER_game_state_info(that_user_id, elements) {
    listOfClientInfo = elements[0];
    gameState = elements[1];
    drawPolicyPile = elements[2];
    if(elements.length > 3){
        examinPlayerName = elements[3];
    }
    else{
        examinPlayerName = ''
    }

    // Already know = GameState | ClientList | self Id | self Name | userInGameStatus

    this_player_info = getNamePlayerInfo(this_user_name, listOfClientInfo);
    inGameStatus = this_player_info.inGameStatus


    if(gameState == 'Login'){
        loginWaitScreen([listOfClientInfo])
    }
    else{
        playerScreen(this_player_info);
    }

    
    if(gameState == 'GameEndFASCIST'){
        if(this_player_info.identity == 'Liberal'){
            createText('red', "Liberals lose...");
        }
        else{
            createText('red', "FASCISTS WON!!!");
        }

        if(this_player_info.vip){
            promptResetGameButtons()
        }
        return 0        
    }
    else if(gameState == 'GameEndLIBERAL'){
        if(this_player_info.identity == 'Liberal'){
            createText('red', "LIBERALS WON!!!");
        }
        else{
            createText('red', "Fascists lose...");
        }

        if(this_player_info.vip){
            promptResetGameButtons()
        }
        return 0        
    }
    else if(inGameStatus == 'Dead'){
        createText('red', "You are dead......");
        return 0        
    }




    if(gameState == 'ChooseChancellor'){
        if(this_player_info.president){
            createText('red', "CHOOSE PLAYER TO BE CHANCELLOR");
            promptChoosePlayerButtons(listOfClientInfo)
        }
        if(!this_player_info.president){
            createText('red', "President is choosing chancellor...");
        }
    }

    else if(gameState == 'VoteChancellor'){
        //if(!this_player_info.president){
            createText('red', "VOTE FOR CHANCELLOR: "+examinPlayerName);
            promptVoteImages();
        //}
        //if(this_player_info.president){
        //    createText('red', "WAITING FOR VOTES...");
        //}
    }
    
    else if(gameState == 'RemovePolicy'){
        if(this_player_info.president){
            createText('red', "REMOVE POLICY");
            promptPolicyImages(3);
        }
        if(!this_player_info.president){
            createText('red', "President is removing a policy...");
        }
    }
    else if(gameState == 'ChoosePolicy'){
        if(this_player_info.chancellor){
            createText('red', "SELECT POLICY");
            promptPolicyImages(2)
            if(examinPlayerName == 'VETO'){
                createText('black', "\n");
                createText('red', "IF PRESIDENT and CHANCELLOR VETO new president will be chosen");
                promptVetoButton('CHANCELLOR')
            }
        }
        else if(this_player_info.president){                
            if(examinPlayerName == 'VETO'){
                createText('black', "\n");
                createText('red', "IF PRESIDENT and CHANCELLOR VETO new president will be chosen");
                promptVetoButton('PRESIDENT')
            }
            else{
                createText('red', "Chancellor is choosing a policy...");
            }
        }
        else{
            createText('red', "Chancellor is choosing a policy...");
        }
    }
    
    else if(gameState == 'ExaminPolicy'){
        if(this_player_info.president){
            createText('red', "Examin top 3 POLICIES");
            promptExaminTop3PolicyImages()
        }
        else{
            createText('red', "President is examing the top 3 policies...");
        }
    }
    else if(gameState == 'ChooseExaminPlayer'){
        if(this_player_info.president){
            createText('red', "CHOOSE PLAYER TO EXAMIN");
            promptChoosePlayerButtons(listOfClientInfo)
        }
        else{
            createText('red', "President is going to examin one of you...");
        }
    }
    else if(gameState == 'ExaminPlayer'){
        if(this_player_info.president){
            createText('red', "Examin: "+examinPlayerName);
            promptExaminPlayerImage(examinPlayerName)
        }
        else{
            createText('red', "President is examining "+examinPlayerName+"...");
        }
    }
    else if(gameState == 'ChooseKillPlayer'){
        if(this_player_info.president){
            createText('red', "CHOOSE PLAYER TO KILL!!!!");
            promptChoosePlayerButtons(listOfClientInfo)
        }
        else{
            createText('red', "One of you is going bye bye...\n\n\nDon't worry it wont be you ;)");
        }
    }
    else if(gameState == 'ChoosePresidentPlayer'){
        if(this_player_info.president){
            createText('red', "CHOOSE PLAYER TO BE NEXT PRESIDENT");
            promptChoosePlayerButtons(listOfClientInfo)
        }
        else{
            createText('red', "President is choosing the next president...");
        }
    }

}

function promptResetGameButtons(){
    var button = document.createElement('button');
    button.textContent = "Reset Game Same Players";
    button.onclick = function() {
        emit_to_host(HOST_start_game_setup, 'Host', []);
    };
    document.body.appendChild(button);

    var button = document.createElement('button');
    button.textContent = "Reset Game New Players";
    button.onclick = function() {
        emit_to_host(HOST_reset_new_players, 'Host', []);
    };
    document.body.appendChild(button);

    makePhoneBuzz();
}
var veto_button = document.createElement('button')
veto_button.textContent = 'null';
function promptVetoButton(title){
    var button = document.createElement('button');
    button.textContent = "VETO?";
    button.id = title
    button.onclick = function() {
        veto_button.style.backgroundColor = 'white';
        veto = 'yes'
        if(veto_button.textContent != this.textContent){
            veto_button = this
            veto_button.style.backgroundColor = 'red';
            veto = 'yes'
        }
        else{
            veto_button = document.createElement('button')
            veto_button.textContent = 'null';
            veto = 'no'
        }
        emit_to_host(HOST_selected_button, 'Host', [this.id+'_VETO_'+veto]);
    };
    document.body.appendChild(button);

    makePhoneBuzz();
}
function promptExaminTop3PolicyImages(){
    for (var i = drawPolicyPile.length-3; i < drawPolicyPile.length; i++) {        
        var img = document.createElement('img');
        img.src = imageFolder+drawPolicyPile[i].toUpperCase()+'_P.png';
        img.id = drawPolicyPile[i]
        img.style.width = '5%';
        img.style.height = '5%';
        document.body.appendChild(img);
    }
    
    createText('black', "\n");

    var button = document.createElement('button');
    button.textContent = "Done Examining?";
    button.onclick = function() {
        playerScreen(getNamePlayerInfo(this_user_name, listOfClientInfo));
        createText('red', "WAITING FOR HOST...");
        emit_to_host(HOST_selected_button, 'Host', ['']);
    };
    document.body.appendChild(button);

    makePhoneBuzz();
}
function promptExaminPlayerImage(examinPlayerName){
    examin_player_info = getNamePlayerInfo(examinPlayerName, listOfClientInfo);   
        
    var img = document.createElement('img');
    img.src = imageFolder+`${examin_player_info.identity}.png`;
    img.style.width = '10%';
    img.style.height = '10%';
    document.body.appendChild(img);

    createText('black', "\n");
        
    var button = document.createElement('button');
    button.textContent = "Done Examining?";
    button.onclick = function() {
        playerScreen(getNamePlayerInfo(this_user_name, listOfClientInfo));
        createText('red', "WAITING FOR HOST...");
        emit_to_host(HOST_selected_button, 'Host', ['']);
    };
    document.body.appendChild(button);

    makePhoneBuzz(); 
}
var selected_button = document.createElement('button')
selected_button.textContent = 'null';
function promptChoosePlayerButtons(listOfClientInfo){
    for (var i = 0; i < listOfClientInfo.length; i++) {
        if(listOfClientInfo[i].inGameStatus != 'Dead' && listOfClientInfo[i].name != this_user_name){
            var button = document.createElement('button');
            button.textContent = listOfClientInfo[i].name;
            button.onclick = function() {
                selected_button.style.backgroundColor = 'white';

                if(selected_button.textContent != this.textContent){
                    selected_button = this
                    selected_button.style.backgroundColor = 'red';
                }
                else{
                    selected_button = document.createElement('button')
                    selected_button.textContent = 'null';
                }
            };
            document.body.appendChild(button);
        }
    }

    createText('black', "\n");

    var button = document.createElement('button');
    button.textContent = "Submit";
    button.onclick = function() {
        if(selected_button.textContent != 'null'){
            player_name = selected_button.textContent
            selected_button = document.createElement('button')
            selected_button.textContent = 'null';
            playerScreen(getNamePlayerInfo(this_user_name, listOfClientInfo));
            createText('red', "WAITING FOR HOST...");
            emit_to_host(HOST_selected_button, 'Host', [player_name]);
        }
    };
    document.body.appendChild(button);

    makePhoneBuzz();
}
var selected_img = document.createElement('img')
selected_img.id = 'null';
function promptVoteImages(){
    janeinList = ['ja', 'nein']
    for (var i = 0; i < janeinList.length; i++) {        
        var img = document.createElement('img');
        img.src = imageFolder+janeinList[i]+'.png';
        img.id = janeinList[i]
        img.style.width = '10%';
        img.style.height = '10%';
        img.onclick = function() {
            selected_img.style.border = 'none';

            if(selected_button.id != this.id){
                selected_img = this
                selected_img.style.border = '3px solid red';
            }
            else{
                selected_img = document.createElement('button')
                selected_img.id = 'null';
            }
        };
        document.body.appendChild(img);
    }

    createText('black', "\n");

    var button = document.createElement('button');
    button.textContent = "Submit";
    button.onclick = function() {
        if(selected_img.id != 'null'){
            id = selected_img.id
            selected_img = document.createElement('img')
            selected_img.id = 'null';
            playerScreen(getNamePlayerInfo(this_user_name, listOfClientInfo));
            createText('red', "WAITING FOR OTHER VOTES...");
            emit_to_host(HOST_selected_button, 'Host', [id]);
        }
    };
    document.body.appendChild(button);

    makePhoneBuzz();
}
function promptPolicyImages(count){
    
    for (var i = drawPolicyPile.length-count; i < drawPolicyPile.length; i++) {        
        var img = document.createElement('img');
        img.src = imageFolder+drawPolicyPile[i].toUpperCase()+'_P.png';
        img.id = drawPolicyPile[i]
        img.style.width = '5%';
        img.style.height = '5%';
        img.onclick = function() {
            selected_img.style.border = 'none';

            if(selected_button.id != this.id){
                selected_img = this
                selected_img.style.border = '3px solid red';
            }
            else{
                selected_img = document.createElement('button')
                selected_img.id = 'null';
            }
        };
        document.body.appendChild(img);
    }
    createText('black', "\n");

    var button = document.createElement('button');
    button.textContent = "Submit";
    button.onclick = function() {
        if(selected_img.id != 'null'){
            id = selected_img.id
            selected_img = document.createElement('img')
            selected_img.id = 'null';
            playerScreen(getNamePlayerInfo(this_user_name, listOfClientInfo));
            createText('red', "WAITING FOR HOST...");
            emit_to_host(HOST_selected_button, 'Host', [id]);
        }
    };
    document.body.appendChild(button);

    makePhoneBuzz();
}
