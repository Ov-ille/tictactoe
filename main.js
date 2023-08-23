let imgsChar = document.getElementsByClassName("img-char");
let imgsGame = document.getElementsByClassName("img-game-char");
let allFields = document.getElementsByClassName("game-field");
let selectedChar;
let remainingChar;
let AIChar;
let emptyFields;
let origBoard;

function selectImg() {
    selectedChar = this.src

    remainingChar = []
    Array.from(imgsChar).forEach(element => {
        element.classList.remove("img-char-selected")
        element.parentNode.classList.remove("td-selected")
        remainingChar.push(element.src)
    });
    remainingChar = Array.from(new Set(remainingChar))
    remainingChar = remainingChar.filter(function (e) { return e != selectedChar })

    document.getElementById(this.id).classList.add("img-char-selected")
    document.getElementById(this.id).parentNode.classList.add("td-selected")
    document.getElementById("btn-start").disabled = false

    // set AI image
    AIChar = remainingChar[(Math.floor(Math.random() * remainingChar.length))];
}
Array.from(imgsChar).forEach(element => {
    element.addEventListener('click', selectImg, false);
});

function startGame() {
    // intial board (9 = empty, 1 = human, 0 = ai)
    origBoard = [9, 9, 9, 9, 9, 9, 9, 9, 9];

    Array.from(allFields).forEach(element => {
        element.addEventListener('click', nextTurn, false);
    });

    // set game pictures to human character
    Array.from(imgsGame).forEach(element => {
        element.src = selectedChar
    });

    document.getElementById("div-start-hide").classList.add("display-none")
    document.getElementById("div-game-hide").classList.remove("display-none")
    document.getElementById("btn-restart").disabled = false

    let firstTurn = ["ai", "human"][Math.floor(Math.random() * 2)];
    if (firstTurn == "ai") {
        bestMoveAI()
    }
}

function restartGame() {
    document.getElementById("overlay-hide").classList.add("display-none")
    document.getElementById("btn-restart").style.zIndex = 1
    document.getElementById("div-start-hide").classList.remove("display-none")
    document.getElementById("div-game-hide").classList.add("display-none")
    Array.from(allFields).forEach(element => {
        element.classList.add("td-hover", "free");
        element.classList.remove("td-game-selected", "ai", "human");
    });
    Array.from(allFields).forEach(element => {
        element.addEventListener('click', nextTurn, false);
    });

}

document.getElementById("btn-start").addEventListener('click', startGame, false)
document.getElementById("btn-restart").addEventListener('click', restartGame, false)


function nextTurn() {
    // human turn
    this.classList.add("td-game-selected", "human")
    this.classList.remove("td-hover", "free")
    this.removeEventListener("click", nextTurn, false)

    origBoard[Number(this.firstChild.id.split("char")[1]) - 1] = 1
    let winTie = checkWinTie(origBoard)
    endGame(winTie)

    if (winTie === false) {
        bestMoveAI()
    }
}

function endGame(winTie) {
    if (winTie !== false) {
        let endtextDict = { "10": "YOU LOOSE!", "-10": "YOU WIN", "0": "IT'S A TIE!" }
        if (winTie == -10) {
            document.getElementById("end-text").style.color = "green"
        }
        else if (winTie == 10) {
            document.getElementById("end-text").style.color = "red"
        }
        else {
            document.getElementById("end-text").style.color = "orange"
        }

        document.getElementById("end-text").innerHTML = endtextDict[winTie]
        document.getElementById("overlay-hide").classList.remove("display-none")
        document.getElementById("btn-restart").style.zIndex = 3
    }
}




function bestMoveAI() {

    async function moveAI() {

        let minimaxPromise = new Promise((resolve, reject) => {
            setTimeout(() => resolve(minimax(0, origBoard)), 50)
        });

        let minimaxResult = await minimaxPromise; // wait until the promise resolves (*)
        let nextTd = document.getElementById("td-game-" + String(minimaxResult.index + 1))
        origBoard[minimaxResult.index] = 0
        nextTd.firstChild.src = AIChar
        nextTd.classList.add("td-game-selected", "ai")
        nextTd.classList.remove("td-hover", "free")
        nextTd.removeEventListener("click", nextTurn, false)
        document.getElementById("overlay-wait-hide").classList.add("display-none")
        winTie = checkWinTie(origBoard)
        endGame(winTie)
    }



    async function showSpinner() {
        let myPromise = new Promise(function (resolve, reject) {
            resolve(document.getElementById("overlay-wait-hide").classList.remove("display-none"));
        });
        let x = await myPromise
        moveAI()

    }

    showSpinner();

}



// function bestMoveAI() {
//     let minimaxResult = minimax(0, origBoard)
//     let nextTd = document.getElementById("td-game-" + String(minimaxResult.index + 1))
//     origBoard[minimaxResult.index] = 0
//     nextTd.firstChild.src = AIChar
//     nextTd.classList.add("td-game-selected", "ai")
//     nextTd.classList.remove("td-hover", "free")
// }


let player_opponent = { 1: 0, 0: 1 }

function availableSpots(board) {
    let availSpots = []
    board.forEach(function (el, idx) {
        if (el === 9) {
            availSpots.push(idx)
        }
    })
    return availSpots
}

function minimax(nextPlayer, newBoard) {

    newBoard = [...newBoard]

    let availSpots = availableSpots(newBoard);

    let result = checkWinTie(newBoard);
    if (result !== false) {
        return { score: result }
    }

    let moves = []
    availSpots.forEach(el => {
        let move = {}
        move.index = el
        newBoard[el] = nextPlayer
        let minimaxResult = minimax(player_opponent[nextPlayer], newBoard)
        newBoard[el] = 9
        move.score = minimaxResult.score

        moves.push(move)
    })

    let bestMove
    if (nextPlayer === 1) {
        // human = minimizing
        let bestScore = 100;
        moves.forEach(el => {
            if (el.score < bestScore) {
                bestScore = el.score;
                bestMove = el
            }
        })
    }
    else if (nextPlayer === 0) {
        // ai = maximizing
        let bestScore = -100;
        moves.forEach(el => {
            if (el.score > bestScore) {
                bestScore = el.score;
                bestMove = el
            }
        })
    }
    return bestMove
}





function checkWinTie(board) {
    let winTie = false;
    let countEmpty = board.filter(arr => {
        if (arr === 9) {
            return true;
        }
        return false;
    }).length

    Array(0, 1).forEach(ai_human => {
        // check for human win
        if ((JSON.stringify([board[0], board[1], board[2]]) === JSON.stringify([ai_human, ai_human, ai_human]))
            | (JSON.stringify([board[3], board[4], board[5]]) === JSON.stringify([ai_human, ai_human, ai_human]))
            | (JSON.stringify([board[6], board[7], board[8]]) === JSON.stringify([ai_human, ai_human, ai_human]))
            | (JSON.stringify([board[0], board[3], board[6]]) === JSON.stringify([ai_human, ai_human, ai_human]))
            | (JSON.stringify([board[1], board[4], board[7]]) === JSON.stringify([ai_human, ai_human, ai_human]))
            | (JSON.stringify([board[2], board[5], board[8]]) === JSON.stringify([ai_human, ai_human, ai_human]))
            | (JSON.stringify([board[0], board[4], board[8]]) === JSON.stringify([ai_human, ai_human, ai_human]))
            | (JSON.stringify([board[2], board[4], board[6]]) === JSON.stringify([ai_human, ai_human, ai_human]))
        ) {
            if (ai_human == 1) {
                winTie = -10
            }
            else {
                winTie = 10
            }
        }
    })
    // check for tie
    if (!winTie && countEmpty === 0) {
        winTie = 0
    }
    return winTie
}




