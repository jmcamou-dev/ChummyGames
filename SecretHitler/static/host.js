
function ChangeGameState(newGameState){
    gameState = newGameState
    emit_change_game_state(newGameState)
}

function HOST_start_game_setup(that_user_id, elements) {

    drawPolicyPile = createDrawPolicyPile()
    discardPolicyPile = []
    fascist_score  = 0
    liberal_score = 0
    vote_retry_count = 1
    president_veto = false
    chancellor_veto = false
    FascistBoardImage = ''

    var randnum = Math.floor(Math.random() * listOfClientInfo.length);

    lstidentity = identityList(listOfClientInfo);
    for (var i = 0; i < listOfClientInfo.length; i++) {
        listOfClientInfo[i].identity = lstidentity[i]
        listOfClientInfo[i].inGameStatus = 'InGame'
        listOfClientInfo[i].president = false
        listOfClientInfo[i].chancellor = false
        if(i==randnum){
            listOfClientInfo[i].president = true
        }
    }

    if(listOfClientInfo.length < 7){
        FascistBoardImage= 'FascistBoard_5';
    }
    else if(listOfClientInfo.length < 9){
        FascistBoardImage= 'FascistBoard_7';
    }
    else{
        FascistBoardImage= 'FascistBoard_9';
    }

    emit_to_players(PLAYER_identityShowingFalse, 'All', []);

    set_next_president('')
    
    ChangeGameState('ChooseChancellor')
    hostScreen('',"PRESIDENT CHOOSE CHANCELLOR");
    emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
}
function set_next_president(newPresidentName) {
    president_index = -1;


    for (var i = 0; i < listOfClientInfo.length; i++) {
        player_info = listOfClientInfo[i]

        if(player_info.name == newPresidentName){
            president_index = i
        }

        if(player_info.chancellor){
            player_info.chancellor = false
        }
        if(player_info.president){
            player_info.president = false;

            if(newPresidentName == ''){
                president_index = i+1;
                if(president_index >= listOfClientInfo.length){
                    president_index = 0;
                }
            }
        }
        
    }
    
    // If next president is dead find new president
    indexStatus = listOfClientInfo[president_index].inGameStatus
    while(indexStatus == 'Dead'){
        president_index = president_index+1;
        if(president_index >= listOfClientInfo.length){
            president_index = 0;
        }
        indexStatus = listOfClientInfo[president_index].inGameStatus
    }
    // Set new president
    listOfClientInfo[president_index].president = true;
    
    playAudio('ChooseChancellor');
}

toBeChancellorName = ''
function HOST_selected_button(that_user_id, elements) {
    buttonName = elements[0];

    if(gameState == 'ChooseChancellor'){
        playAudio('VoteChancellor');
        
        for (var i = 0; i < listOfClientInfo.length; i++) {
            listOfClientInfo[i].vote = 'null'
        }

        toBeChancellorName = buttonName
        ChangeGameState('VoteChancellor')
        hostScreen('',"VOTE FOR CHANCELLOR: "+toBeChancellorName);
        gameElement = toBeChancellorName
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile, gameElement]);
    }
    else if(gameState == 'VoteChancellor'){
        dead_count = 0
        ja_count = 0
        nein_count = 0
        for (var i = 0; i < listOfClientInfo.length; i++) {
            if(listOfClientInfo[i].id == that_user_id){
                listOfClientInfo[i].vote = buttonName
            }

            if(listOfClientInfo[i].inGameStatus == 'Dead'){
                dead_count += 1
            }
            if(listOfClientInfo[i].vote == 'ja'){
                ja_count += 1
            }
            if(listOfClientInfo[i].vote == 'nein'){
                nein_count += 1
            }
        }

        hostScreen('showHide',"VOTE FOR CHANCELLOR: "+toBeChancellorName);
        
        if((dead_count+ja_count+nein_count) == listOfClientInfo.length-1){
            if(ja_count > nein_count){
                for(var i =0; i < listOfClientInfo.length; i++){
                    if(listOfClientInfo[i].name == toBeChancellorName){
                        listOfClientInfo[i].chancellor = true
                    }
                }
                if(fascist_score > 3 && getNamePlayerInfo(toBeChancellorName, listOfClientInfo).identity == 'Hitler'){
                    ChangeGameState('GameEndFASCIST')
                    hostScreen('','Hitler is Chancellor!!!\nFASCIST WON!!!!');
                    emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
                    return 0
                }
                ChangeGameState('RemovePolicy')
                vote_retry_count = 0
                hostScreen('showShow',"VOTE FOR CHANCELLOR: "+toBeChancellorName+"\nSUCCEED!!!\n NOW PRESIDENT REMOVE POLICY....");
                emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
            }
            else{
                infoStr = "VOTE FOR CHANCELLOR: "+toBeChancellorName+"\nFAILED..."
                vote_retry_count += 1
                if(vote_retry_count > 3){
                    vote_retry_count = 0
                    topPolicy = drawPolicyPile.pop()
                    discardPolicyPile.push(topPolicy)
                    end = addScore(topPolicy)
                    if(end){
                        return 0
                    }
                    
                    infoStr += "\nReveal Top Policy"
                    
                    if(topPolicy == 'FASCIST'){
                        if(specialAction(infoStr)==1){
                            return 0
                        }
                    }

                    if(drawPolicyPile.length < 3){
                        drawPolicyPile = shuffle(shuffle(discardPolicyPile)).concat(drawPolicyPile)
                        discardPolicyPile = []
                        infoStr += 'Added shuffled discard policies to the bottom of draw policies'
                    }
                }
                ChangeGameState('ChooseChancellor')
                set_next_president('')
                hostScreen('showShow',infoStr);
                emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
            }
            toBeChancellorName = ''
        }
    }
    else if(gameState == 'RemovePolicy'){
        for (var i = drawPolicyPile.length-3; i < drawPolicyPile.length; i++) {
            if(drawPolicyPile[i] == buttonName){
                drawPolicyPile.splice(i, 1);
                break
            }
        }
        discardPolicyPile.push(buttonName)

        veto = ''
        if(fascist_score == 5){
            veto = 'VETO'
        }

        ChangeGameState('ChoosePolicy')
        hostScreen('showShow',"CHANCELLOR SELECT POLICY....");
        gameElement = veto
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile, gameElement]);
    }
    else if(gameState == 'ChoosePolicy'){

        if(buttonName == "PRESIDENT_VETO_yes"){
            president_veto = true
        }
        if(buttonName == "PRESIDENT_VETO_no"){
            president_veto = false
        }
        if(buttonName == "CHANCELLOR_VETO_yes"){
            chancellor_veto = true
        }
        if(buttonName == "CHANCELLOR_VETO_no"){
            chancellor_veto = false
        }
        if(buttonName == "PRESIDENT_VETO_yes" || buttonName == "PRESIDENT_VETO_no" || buttonName == "CHANCELLOR_VETO_yes" || buttonName == "CHANCELLOR_VETO_no"){
            if(president_veto && chancellor_veto){
                president_veto = false
                chancellor_veto = false
                ChangeGameState('ChooseChancellor')
                set_next_president('')
                hostScreen('',"PRESIDENT CHOOSE CHANCELLOR");
                emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
            }
            return 0
        }
        president_veto = false
        chancellor_veto = false
        
        end = addScore(buttonName)
        if(end){
            return
        }

        infoStr = ''
        discardPolicyPile.push(drawPolicyPile.pop())
        discardPolicyPile.push(drawPolicyPile.pop())
        if(drawPolicyPile.length < 3){
            drawPolicyPile = shuffle(shuffle(discardPolicyPile)).concat(drawPolicyPile)
            discardPolicyPile = []
            infoStr += 'Added shuffled discard policies to the bottom of draw policies'
        }
        if(buttonName == 'FASCIST'){
            if(specialAction(infoStr)==1){
                return 0
            }
        }


        ChangeGameState('ChooseChancellor')
        set_next_president('')
        hostScreen('',"PRESIDENT CHOOSE CHANCELLOR");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
    }
    else if(gameState == 'ChooseExaminPlayer'){
        ChangeGameState('ExaminPlayer')
        hostScreen('',"PRESIDENT Examin Player");
        gameElement = buttonName
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile, gameElement]);
    }
    else if(gameState == 'ExaminPlayer'){
        ChangeGameState('ChooseChancellor')
        set_next_president('')
        hostScreen('',"PRESIDENT CHOOSE CHANCELLOR");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
    }
    else if(gameState == 'ExaminPolicy'){
        ChangeGameState('ChooseChancellor')
        set_next_president('')
        hostScreen('',"PRESIDENT CHOOSE CHANCELLOR");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
    }
    else if(gameState == 'ChoosePresidentPlayer'){
        ChangeGameState('ChooseChancellor')
        set_next_president(buttonName)
        hostScreen('',"PRESIDENT CHOOSE CHANCELLOR");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
    }
    else if(gameState == 'ChooseKillPlayer'){
        for (var i = 0; i < listOfClientInfo.length; i++) {
            if(listOfClientInfo[i].name == buttonName){
                listOfClientInfo[i].inGameStatus = 'Dead'
                
                if(listOfClientInfo[i].identity == 'Hitler'){
                    ChangeGameState('GameEndLIBERAL')
                    hostScreen('','Hitler is dead!!!\nLIBERAL WON!!!!');
                    emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
                    return 0
                }
            }
        }
        ChangeGameState('ChooseChancellor')
        set_next_president('')
        hostScreen('',"PRESIDENT CHOOSE CHANCELLOR");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
    }
}
function specialAction(infoStr){
    if(((listOfClientInfo.length == 7 || listOfClientInfo.length == 8) && fascist_score == 2) || (listOfClientInfo.length >= 9 && (fascist_score == 2||fascist_score == 1))){
        ChangeGameState('ChooseExaminPlayer')
        hostScreen('',infoStr+"\nPRESIDENT choose player to EXAMIN");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
        return 1
    }

    if(listOfClientInfo.length < 7 && fascist_score == 3){
        ChangeGameState('ExaminPolicy')
        hostScreen('',infoStr+"\nPRESIDENT Examin Top 3 Policies");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
        return 1
    }
    if(listOfClientInfo.length >= 7 && fascist_score == 3){
        ChangeGameState('ChoosePresidentPlayer')
        hostScreen('',infoStr+"\nPRESIDENT choose player to be next PRESIDENT");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
        return 1
    }

    if((fascist_score == 4 || fascist_score == 5)){
        ChangeGameState('ChooseKillPlayer')
        hostScreen('',infoStr+"\nPRESIDENT choose player to KILL");
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
        return 1
    }
    return 0
}
function addScore(policy){
    
    if('FASCIST' == policy){
        fascist_score+=1
    }
    if('LIBERAL' == policy){
        liberal_score+=1
    }
    if(liberal_score == 5){
        ChangeGameState('GameEndLIBERAL')
        hostScreen('','LIBERAL WON!!!!');
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
        return 1
    }
    if(fascist_score == 6){
        ChangeGameState('GameEndFASCIST')
        hostScreen('','FASCIST WON!!!!');
        emit_to_players(PLAYER_game_state_info, 'All', [listOfClientInfo, gameState, drawPolicyPile]);
        return 1
    }
    
    return 0
}