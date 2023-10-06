
const url = window.location.origin;
const socket = io.connect(url);

let myTurn = false;
let symbol;
let playerName = ''; // Store the player's name
let userScore = 0; // Initialize the user's score to 0

function getBoardState() {
    const boardState = {};
    $(".board button").each(function () {
        boardState[$(this).attr("id")] = $(this).text() || "";
    });
    return boardState;
}

function checkWin() {
    const state = getBoardState();
    const winningCombos = [
        ["r0c0", "r0c1", "r0c2"],
        ["r1c0", "r1c1", "r1c2"],
        ["r2c0", "r2c1", "r2c2"],
        ["r0c0", "r1c0", "r2c0"],
        ["r0c1", "r1c1", "r2c1"],
        ["r0c2", "r1c2", "r2c2"],
        ["r0c0", "r1c1", "r2c2"],
        ["r0c2", "r1c1", "r2c0"]
    ];

    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return true;
        }
    }

    return false;
}

function renderTurnMessage() {
    if (!myTurn) {
        $("#message").text("Your opponent's turn");
        $(".board button").attr("disabled", true);
    } else {
        $("#message").text("Your turn.");
        $(".board button").removeAttr("disabled");
    }
}

function makeMove(e) {
    if (!myTurn || $(this).text()) {
        return;
    }

    const position = $(this).attr("id");
    socket.emit("make.move", { symbol, position });
}

socket.on("move.made", function (data) {
    $("#" + data.position).text(data.symbol);
    myTurn = data.symbol !== symbol;

    if (!checkWin()) {
        renderTurnMessage();
    } else {
        if (myTurn) {
            $("#message").text("You lost.");
            userScore = 0; // Update the user's score to 0 when they lose
        } else {
            $("#message").text("You won!");
            userScore = 10; // Update the user's score to 10 when they win
            updateScore(playerName, userScore);
        }

        $(".board button").attr("disabled", true);

        // Update the user's score in the HTML
        $("#user-score").text(userScore);
    }
});

socket.on("game.begin", function (data) {
    symbol = data.symbol;
    myTurn = symbol === "X";
    renderTurnMessage();
});

socket.on("opponent.left", function () {
    $("#message").text("Your opponent left the game.");
    $(".board button").attr("disabled", true);
});

$(function () {
    $(".board button").attr("disabled", true);
    $(".board button").on("click", makeMove);
});

document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = document.getElementById('user-name');
    const joinGameButton = document.getElementById('join-button');

    // Initial state: Disable the "Join Game" button
    joinGameButton.disabled = true;

    // Event listener for creating a game
    // Event listener for creating a game
joinGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value;
    if (playerName) {
        // Player has entered their name, allow them to play
        joinGameButton.disabled = true;
        playerNameInput.disabled = true;

        // Send a POST request to register the player's username
        fetch('/registerplayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: playerName }),
        })
        .then(response => {
            if (response.ok) {
                // Handle successful registration
                return response.json();
            } else {
                // Handle registration error
                throw new Error('Registration failed');
            }
        })
        .then(data => {
            // Handle the response data (e.g., show a message to the user)
            console.log(data.response.Message);
        })
        .catch(error => {
            // Handle registration error (e.g., show an error message)
            console.error('Registration error:', error);
        });
    } else {
        alert('Please enter your name.');
    }
});

    

    // Initial state: Disable the "Join Game" button
    joinGameButton.disabled = true;

    // Event listener for input changes (to enable/disable the "Join Game" button)
    playerNameInput.addEventListener('input', () => {
        if (playerNameInput.value) {
            joinGameButton.disabled = false;
        } else {
            joinGameButton.disabled = true;
        }
    });
});

function updateScore(username, score) {
    fetch('/updatescore', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, score }),
    })
    .then(response => {
        if (response.ok) {
            // Handle successful score update
            return response.json();
        } else {
            // Handle score update error
            throw new Error('Score update failed');
        }
    })
    .then(data => {
        // Handle the response data (e.g., show a message to the user)
        console.log(data.response.Message);
    })
    .catch(error => {
        // Handle score update error (e.g., show an error message)
        console.error('Score update error:', error);
    });
}