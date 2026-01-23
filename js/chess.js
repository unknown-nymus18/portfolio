
document.addEventListener('DOMContentLoaded', function() {
const chessboard = new ChessBoard("chess-board" );

// variables


chessboard.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

const originalHandleDrop = chessboard.handleDrop.bind(chessboard);
chessboard.handleDrop = function(e){
    const result = originalHandleDrop(e);
    
    // Only run this code if the move was successful
    if (result) {
        // Check if the opponent's king is in checkmate or check
        const moveList = document.getElementById("move-list");
        const lastMove = chessboard.moveHistory[chessboard.moveHistory.length - 1];
        const move = {
            from: lastMove.from,
            to: lastMove.to
        }
        moveList.innerHTML += `<li style="color: white">${move.from} - ${move.to}</li>`;


        if (chessboard.isCheckmate(chessboard.move)) {
            const winner = chessboard.move === 'white' ? 'Black' : 'White';
            chessboard.highlightKingInCheck(chessboard.move);
            alert(`Checkmate! ${winner} wins.`);
        }
        
    }
    
    return result;
    }

});



function changeBoardColor(){
    const lightSquare = document.querySelectorAll('.light');
    const darkSquare = document.querySelectorAll('.dark');

    darkSquare.forEach(square => {
        square.style.backgroundColor = '#28292b';
    });
    lightSquare.forEach(square => {
        square.style.backgroundColor = '#e2e3e5';
    });


}
