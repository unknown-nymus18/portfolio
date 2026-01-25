
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('reset-button').addEventListener('click', function() {
        resetGame();
    });
    
    document.getElementById('change-color-button').addEventListener('click', function() {
        changeBoardColor();
    });


    document.getElementById('close-result-button').addEventListener('click', function() {
        closeResult();
    });

    document.getElementById('play-again-button').addEventListener('click', function() {
        playAgain();
    });


    let chessboard = new ChessBoard("chess-board" );
    chessboard.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    let moveNumber = 1;

    const originalHandleDrop = chessboard.handleDrop.bind(chessboard);
    function moveNotation(move) {
        const fenMap = {
            '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': '',
            '♚': 'K', '♛': 'Q', '♜': 'R', '♝': 'B', '♞': 'N', '♟': ''
        };

        var notation;
        
        if(move.capture!= null && (move.piece == '♙' || move.piece == '♟' )){
            var notation = `${move.from}x${move.to}`;
        }else{
            var notation = `${fenMap[move.piece]}${move.capture ? 'x' : ''}${move.to}`;
        }
        
        return notation
    }

    function closeResult(){
        document.querySelector('.game-result').style.display = 'none';
    }


    chessboard.handleDrop = function(e){
        const result = originalHandleDrop(e);
        
        // Only run this code if the move was successful
        if (result) {
            // Check if the opponent's king is in checkmate or check
            const moveList = document.getElementById("move-list");
            const lastMove = chessboard.moveHistory[chessboard.moveHistory.length - 1];
            const move = moveNotation(lastMove);
            
            // White just moved (now it's black's turn)
            if (chessboard.move === 'black') {
                // Create a new row for white's move
                const row = document.createElement('div');
                row.className = 'move-row';
                row.innerHTML = `<span class="move-number">${moveNumber}.</span><span class="white-move">${move}</span><span class="black-move"></span>`;
                moveList.appendChild(row);
            } else {
                // Black just moved (now it's white's turn)
                const lastRow = moveList.querySelector('.move-row:last-child');
                if (lastRow) {
                    lastRow.querySelector('.black-move').textContent = move;
                }
                moveNumber++;
            }

            if (chessboard.isCheckmate(chessboard.move)) {
                const winner = chessboard.move === 'white' ? 'Black' : 'White';
                chessboard.highlightKingInCheck(chessboard.move);
                document.querySelector('.game-result').style.display = 'block';
                document.getElementById("result-message").textContent = `Checkmate! ${winner} wins.`;
                document.getElementById('total-moves').textContent = moveNumber;
            }
            
        }
        
        return result;
        }

    function changeBoardColor(){
        const square = document.querySelector('.light');
        if(square.style.backgroundColor === "rgb(235, 236, 208)"){
            chessboard.changeBoardColor('wood');
        }else{
            chessboard.changeBoardColor('classic');
        }
    }

    function resetGame(){
        chessboard.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        const moveList = document.getElementById("move-list");
        moveList.innerHTML = '';
        moveNumber = 1;
    }

    function playAgain(){
        resetGame();
        document.querySelector('.game-result').style.display = 'none';
    }

    

    
});




