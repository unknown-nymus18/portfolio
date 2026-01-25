
document.addEventListener('DOMContentLoaded', function () {
    // Functions
    document.getElementById('reset-button').addEventListener('click', function () {
        resetGame();
    });

    document.getElementById('board-color').addEventListener('click', function () {
        changeBoardColor();
    });


    document.getElementById('close-result-button').addEventListener('click', function () {
        closeResult();
    });

    document.getElementById('close-settings-button').addEventListener('click', function () {
        closeSettings();
    });

    document.getElementById('play-again-button').addEventListener('click', function () {
        playAgain();
    });

    document.getElementById('settings-btn').addEventListener('click', function () {
        openSettings();
    });

    document.getElementById('switch').addEventListener('click', function () {
        chessboard.flipBoard();
    });

    // Variables
    let chessboard = new ChessBoard("chess-board");
    chessboard.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    let moveNumber = 1;
    const moveAudio = new Audio('../assets/sounds/move.mp3');
    const checkAudio = new Audio('../assets/sounds/check.mp3');

    // Expose sound functions for ChessBoard
    window.playMoveSound = () => moveAudio.play();
    window.playCheckSound = () => checkAudio.play();

    // Stockfish Integration
    const gameMode = 'pvc'; // Always PvC
    let stockfish = null;
    let isComputerThinking = false;

    // Initialize Stockfish if available
    try {
        stockfish = new Worker('../js/stockfish.js');
        console.log("Stockfish initialized via Worker");

        // Configure Engine for ~1500 Elo
        stockfish.postMessage("uci");
        stockfish.postMessage("setoption name Skill Level value 5"); // 0-20, 5 is roughly 1500
        stockfish.postMessage("setoption name Contempt value 0");
    } catch (e) {
        console.error("Worker init failed, trying global fallback:", e);
        if (typeof STOCKFISH === 'function') {
            stockfish = STOCKFISH();
            console.log("Stockfish initialized via STOCKFISH()");
        }
    }

    const originalHandleDrop = chessboard.handleDrop.bind(chessboard);

    function moveNotation(move) {
        // Handle castling
        if (move.castling) {
            return move.to[0] === 'g' ? 'O-O' : 'O-O-O';
        }

        const fenMap = {
            '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': '',
            '♚': 'K', '♛': 'Q', '♜': 'R', '♝': 'B', '♞': 'N', '♟': ''
        };

        const isPawn = move.piece === '♙' || move.piece === '♟';
        const pieceSymbol = fenMap[move.piece];
        const capture = move.capture ? 'x' : '';

        let notation;
        if (isPawn && move.capture) {
            // Pawn captures: exd5
            notation = `${move.from[0]}x${move.to}`;
        } else {
            // Regular moves: Nf3, e4, Bxe5
            notation = `${pieceSymbol}${capture}${move.to}`;
        }

        // Add promotion
        if (move.promotion) {
            notation += `=${move.promotion}`;
        }

        return notation;
    }

    function closeResult() {
        document.querySelector('.game-result').style.display = 'none';
    }

    function updateCapturedPieces() {
        const whiteContainer = document.getElementById('captured-white');
        const blackContainer = document.getElementById('captured-black');
        whiteContainer.innerHTML = '';
        blackContainer.innerHTML = '';

        const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];

        chessboard.moveHistory.forEach(move => {
            if (move.capture) {
                const capturedPiece = document.createElement('span');
                capturedPiece.className = 'captured-piece';
                capturedPiece.textContent = move.capture;

                // If white moved, they captured a black piece
                // If black moved, they captured a white piece
                // We determine who moved by checking the piece that moved
                const isWhiteMove = whitePieces.includes(move.piece);

                if (isWhiteMove) {
                    whiteContainer.appendChild(capturedPiece);
                } else {
                    blackContainer.appendChild(capturedPiece);
                }
            }
        });
    }

    function updateGameUI(movedColor) {
        // Sound is handled by ChessBoard via global hooks now

        // Update Captured Pieces
        updateCapturedPieces();

        // Update Move List
        const moveList = document.getElementById("move-list");
        const lastMove = chessboard.moveHistory[chessboard.moveHistory.length - 1];
        const moveText = moveNotation(lastMove);

        if (movedColor === 'white') {
            // White just moved
            const row = document.createElement('div');
            row.className = 'move-row';
            row.innerHTML = `<span class="move-number">${moveNumber}.</span><span class="white-move">${moveText}</span><span class="black-move"></span>`;
            moveList.appendChild(row);
        } else {
            // Black just moved
            const lastRow = moveList.querySelector('.move-row:last-child');
            if (lastRow) {
                lastRow.querySelector('.black-move').textContent = moveText;
            }
            moveNumber++;
        }

        // Check Win Condition
        if (chessboard.isCheckmate(chessboard.move)) {
            const winner = chessboard.move === 'white' ? 'Black' : 'White';
            chessboard.highlightKingInCheck(chessboard.move);
            document.querySelector('.game-result').style.display = 'block';
            document.getElementById("result-message").textContent = `Checkmate! ${winner} wins.`;
            document.getElementById('total-moves').textContent = moveNumber;
        }
    }

    chessboard.handleDrop = function (e) {
        // If computer is thinking or it's computer's turn in PvC, prevent drop
        if (isComputerThinking || (gameMode === 'pvc' && chessboard.move === 'black')) {
            return false;
        }

        const result = originalHandleDrop(e);

        // Only run this code if the move was successful
        if (result) {
            updateGameUI('white'); // User is always white in this simple PvC for now

            if (gameMode === 'pvc' && !chessboard.isCheckmate(chessboard.move)) {
                makeComputerMove();
            }
        }

        return result;
    }

    function makeComputerMove() {
        if (!stockfish) return;

        isComputerThinking = true;
        const fen = chessboard.boardToFEN();

        stockfish.postMessage("position fen " + fen);
        stockfish.postMessage("go movetime 1000"); // Think for 1 second

        stockfish.onmessage = function (event) {
            const line = event.data || event; // handle both direct string or object

            if (line && typeof line === 'string' && line.startsWith("bestmove")) {
                const bestMove = line.split(" ")[1];

                // Add a small delay for visual effect
                setTimeout(() => {
                    // Execute move on board
                    // bestMove is UCI (e.g., e7e5)
                    const from = bestMove.substring(0, 2);
                    const to = bestMove.substring(2, 4);
                    const promotion = bestMove.length > 4 ? bestMove.substring(4, 5).toUpperCase() : null; // promotion is q, r, b, n

                    // Use the new move method
                    const success = chessboard.makeMove(from, to, promotion);

                    if (success) {
                        updateGameUI('black');
                    }

                    isComputerThinking = false;
                }, 500);
            }
        };
    }

    function changeBoardColor() {
        const color = document.getElementById('board-color').value;
        chessboard.changeBoardColor(color);
    }

    function resetGame() {
        chessboard.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

        // Reset history
        chessboard.moveHistory = [];
        chessboard.currentMoveIndex = -1;
        chessboard.moveCounter = 0;

        const moveList = document.getElementById("move-list");
        moveList.innerHTML = '';
        updateCapturedPieces(); // Clear captured pieces UI

        moveNumber = 1;
        isComputerThinking = false;
    }

    function playAgain() {
        resetGame();
        document.querySelector('.game-result').style.display = 'none';
    }

    function openSettings() {
        const settings = document.querySelector('.settings');
        settings.style.display = 'block';
        // Force reflow to enable transition
        settings.offsetHeight;
        settings.classList.add('active');
    }

    function closeSettings() {
        const settings = document.querySelector('.settings');
        settings.classList.remove('active');
        setTimeout(() => {
            settings.style.display = 'none';
        }, 300);
    }



});




