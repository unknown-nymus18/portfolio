    /**
     * Makes a move on the board using algebraic notation (PGN/SAN).
     * Supports pawn moves, piece moves, captures, castling, and promotion.
     * @param {string} move - The move in algebraic notation (e.g., "Nf3", "e4", "O-O").
     * @param {string} color - "white" or "black".
     */
// ChessBoard class - Modular chess game logic
class ChessBoard {
    constructor(boardId) {
        this.boardElement = document.getElementById(boardId);
        this.move = 'white';
        this.moveHistory = [];
        this.currentMoveIndex = -1;
        this.moveCounter = 0;
        this.draggedPiece = null;
        this.fromSquare = null;
        this.isFlipped = false; // Track board orientation
        
        // Track king positions for check detection
        this.kingPositions = {
            white: 'e1',
            black: 'e8'
        };

        this.boardColors = {
            classic:{
                white:"rgb(235, 236, 208)",
                black:"rgb(115, 149, 82)"
            },
            wood:{
                white:"rgb(206, 177, 132)",
                black:"rgb(128, 89, 54)"
            },
            metal:{
                white: "rgb(204, 204, 204)",
                black:"rgb(131, 131, 131)"
            }

        }
        
        this.initialize();

    }
    
    initialize() {
        this.renderBoard();
        this.setupEventListeners();
    }

    changeBoardColor(color){
        const lightSquare = document.querySelectorAll('.light');
        const darkSquare = document.querySelectorAll('.dark');
        const darkSquareCoordinates = document.querySelectorAll('.dark .coordinate-label');
        const lightSquareCoordinates = document.querySelectorAll('.light .coordinate-label');
        lightSquare.forEach(square => {
            square.style.backgroundColor = this.boardColors[color].white;
        });
        darkSquare.forEach(square => {
            square.style.backgroundColor = this.boardColors[color].black;
        });
        darkSquareCoordinates.forEach(label => {
            label.style.color = this.boardColors[color].white;
        });
        lightSquareCoordinates.forEach(label => {
            label.style.color = this.boardColors[color].black;
        });
    }


    makeAlgebraicMove(move, color) {
        // Remove check (+) and checkmate (#) symbols
        const originalMove = move;
        move = move.replace(/[+#]/g, '');
        
        // Castling
        if (move === 'O-O' || move === 'O-O-O') {
            const rank = color === 'white' ? '1' : '8';
            const from = 'e' + rank;
            const to = (move === 'O-O') ? 'g' + rank : 'c' + rank;
            this.movePieceAlgebraic(from, to);
            
            // Move the rook for castling
            const rookFrom = (move === 'O-O') ? 'h' + rank : 'a' + rank;
            const rookTo = (move === 'O-O') ? 'f' + rank : 'd' + rank;
            this.movePieceAlgebraic(rookFrom, rookTo);
            return;
        }

        // Promotion (e.g., e8=Q)
        let promotion = null;
        if (move.includes('=')) {
            const parts = move.split('=');
            move = parts[0];
            promotion = parts[1];
        }

        // Capture
        const isCapture = move.includes('x');
        move = move.replace('x', '');

        // Piece type
        let pieceType = 'P'; // Pawn by default
        const pieceLetters = ['K', 'Q', 'R', 'B', 'N'];
        if (pieceLetters.includes(move[0])) {
            pieceType = move[0];
            move = move.slice(1);
        }

        // Destination square
        const destMatch = move.match(/([a-h][1-8])$/);
        if (!destMatch) {
            console.warn(`Invalid move format: ${originalMove}`);
            return;
        }
        const to = destMatch[1];

        // Disambiguation (file/rank)
        let disambiguation = move.replace(to, '');

        // Find all candidate pieces
        const candidates = [];
        for (let rank = 1; rank <= 8; rank++) {
            for (let file = 97; file <= 104; file++) {
                const squareId = String.fromCharCode(file) + rank;
                const square = document.getElementById(squareId);
                const piece = square ? square.querySelector('.chess-piece') : null;
                if (!piece) continue;
                // Match color
                if (this.getPieceColor(piece.innerHTML) !== color) continue;
                // Match piece type
                const fenMap = {
                    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
                    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
                };
                let symbol = color === 'white' ? fenMap[pieceType] : fenMap[pieceType.toLowerCase()];
                if (piece.innerHTML !== symbol) continue;
                // Disambiguation
                if (disambiguation) {
                    if (disambiguation.length === 1) {
                        if (/[a-h]/.test(disambiguation)) {
                            if (squareId[0] !== disambiguation) continue;
                        } else if (/[1-8]/.test(disambiguation)) {
                            if (squareId[1] !== disambiguation) continue;
                        }
                    } else if (disambiguation.length === 2) {
                        if (squareId !== disambiguation) continue;
                    }
                }
                // Validate move
                if (this.isValidMove(squareId, to, piece)) {
                    candidates.push(squareId);
                }
            }
        }
        
        if (candidates.length >= 1) {
            this.movePieceAlgebraic(candidates[0], to, promotion);
        } else {
            console.warn(`No valid piece found for move: ${originalMove}, pieceType: ${pieceType}, to: ${to}`);
        }
    }

    makeAlgebraicMoveWithCapture(move, color) {
        // Castling
        if (move === 'O-O' || move === 'O-O-O') {
            const rank = color === 'white' ? '1' : '8';
            const from = 'e' + rank;
            const to = (move === 'O-O') ? 'g' + rank : 'c' + rank;
            const fromSquare = document.getElementById(from);
            const piece = fromSquare ? fromSquare.querySelector('.chess-piece') : null;
            this.movePieceAlgebraic(from, to);
            return {
                from: from,
                to: to,
                piece: piece ? piece.innerHTML : null,
                capture: null,
                castling: true
            };
        }

        // Promotion (e.g., e8=Q)
        let promotion = null;
        if (move.includes('=')) {
            const parts = move.split('=');
            move = parts[0];
            promotion = parts[1];
        }

        // Capture
        const isCapture = move.includes('x');
        move = move.replace('x', '');

        // Piece type
        let pieceType = 'P'; // Pawn by default
        const pieceLetters = ['K', 'Q', 'R', 'B', 'N'];
        if (pieceLetters.includes(move[0])) {
            pieceType = move[0];
            move = move.slice(1);
        }

        // Destination square
        const destMatch = move.match(/([a-h][1-8])$/);
        if (!destMatch) return null;
        const to = destMatch[1];

        // Disambiguation (file/rank)
        let disambiguation = move.replace(to, '');

        // Find all candidate pieces
        const candidates = [];
        for (let rank = 1; rank <= 8; rank++) {
            for (let file = 97; file <= 104; file++) {
                const squareId = String.fromCharCode(file) + rank;
                const square = document.getElementById(squareId);
                const piece = square ? square.querySelector('.chess-piece') : null;
                if (!piece) continue;
                // Match color
                if (this.getPieceColor(piece.innerHTML) !== color) continue;
                // Match piece type
                const fenMap = {
                    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
                    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
                };
                let symbol = color === 'white' ? fenMap[pieceType] : fenMap[pieceType.toLowerCase()];
                if (piece.innerHTML !== symbol) continue;
                // Disambiguation
                if (disambiguation) {
                    if (disambiguation.length === 1) {
                        if (/[a-h]/.test(disambiguation)) {
                            if (squareId[0] !== disambiguation) continue;
                        } else if (/[1-8]/.test(disambiguation)) {
                            if (squareId[1] !== disambiguation) continue;
                        }
                    } else if (disambiguation.length === 2) {
                        if (squareId !== disambiguation) continue;
                    }
                }
                // Validate move
                if (this.isValidMove(squareId, to, piece)) {
                    candidates.push(squareId);
                }
            }
        }
        
        if (candidates.length >= 1) {
            const from = candidates[0];
            const fromSquare = document.getElementById(from);
            const toSquare = document.getElementById(to);
            const piece = fromSquare.querySelector('.chess-piece');
            const capturedPiece = toSquare.querySelector('.chess-piece');
            const capturedSymbol = capturedPiece ? capturedPiece.innerHTML : null;
            const pieceSymbol = piece ? piece.innerHTML : null;
            
            this.movePieceAlgebraic(from, to, promotion);
            
            return {
                from: from,
                to: to,
                piece: pieceSymbol,
                capture: capturedSymbol,
                castling: false
            };
        }
        
        return null;
    }

    movePieceAlgebraic(from, to, promotion) {
        const fromSquare = document.getElementById(from);
        const toSquare = document.getElementById(to);
        const piece = fromSquare.querySelector('.chess-piece');
        if (!piece) return;
        // Remove captured piece
        const captured = toSquare.querySelector('.chess-piece');
        if (captured) captured.remove();
        // Move piece
        piece.remove();
        toSquare.appendChild(piece);
        // Handle promotion
        if (promotion) {
            const fenMap = {
                'Q': ['♕', '♛'], 'R': ['♖', '♜'], 'B': ['♗', '♝'], 'N': ['♘', '♞']
            };
            const color = this.getPieceColor(piece.innerHTML) === 'white' ? 0 : 1;
            if (fenMap[promotion]) piece.innerHTML = fenMap[promotion][color];
        }
        // Update king position if needed
        if (piece.innerHTML === '♔') this.kingPositions.white = to;
        if (piece.innerHTML === '♚') this.kingPositions.black = to;
        // Switch turn
        this.move = this.move === 'white' ? 'black' : 'white';
    }
    
    renderBoard() {
        if (!this.boardElement) return;
        
        this.boardElement.innerHTML = '';
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = this.isFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        ranks.forEach((rank, i) => {
            const filesToUse = this.isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : files;
            filesToUse.forEach((file, j) => {
                const square = document.createElement('div');
                square.id = file + rank;
                square.className = 'square ' + ((i + j) % 2 === 0 ? 'light' : 'dark');
                square.dataset.file = file;
                square.dataset.rank = rank;
                
                // Add coordinate labels
                // File labels (a-h) on bottom rank
                if ((this.isFlipped && rank === '8') || (!this.isFlipped && rank === '1')) {
                    const fileLabel = document.createElement('div');
                    fileLabel.className = 'coordinate-label file-label';
                    fileLabel.textContent = file;
                    square.appendChild(fileLabel);
                }
                
                // Rank labels (1-8) on leftmost file
                if ((this.isFlipped && file === 'h') || (!this.isFlipped && file === 'a')) {
                    const rankLabel = document.createElement('div');
                    rankLabel.className = 'coordinate-label rank-label';
                    rankLabel.textContent = rank;
                    square.appendChild(rankLabel);
                }
                
                this.boardElement.appendChild(square);
            });
        });
    }
    
    setupEventListeners() {
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.addEventListener('dragover', (e) => this.handleDragOver(e));
            square.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }
    
    loadFromFEN(fen) {
        const parts = fen.split(' ');
        const position = parts[0];
        const turn = parts[1];
        
        this.move = turn === 'w' ? 'white' : 'black';
        
        // Clear board
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            const piece = square.querySelector('.chess-piece');
            if (piece) piece.remove();
        });
        
        // Place pieces
        const ranks = position.split('/');
        ranks.forEach((rank, rankIndex) => {
            let fileIndex = 0;
            for (let char of rank) {
                if (isNaN(char)) {
                    const file = String.fromCharCode(97 + fileIndex);
                    const rankNum = 8 - rankIndex;
                    const squareId = file + rankNum;
                    const square = document.getElementById(squareId);
                    
                    if (square) {
                        const piece = this.createPiece(char);
                        square.appendChild(piece);
                        
                        // Track king positions
                        if (char === 'K') this.kingPositions.white = squareId;
                        if (char === 'k') this.kingPositions.black = squareId;
                    }
                    fileIndex++;
                } else {
                    fileIndex += parseInt(char);
                }
            }
        });
    }
    
    createPiece(fenChar) {
        const pieceMap = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        
        const piece = document.createElement('div');
        piece.className = 'chess-piece';
        piece.innerHTML = pieceMap[fenChar];
        piece.draggable = true;
        piece.addEventListener('dragstart', (e) => this.handleDragStart(e));
        piece.addEventListener('dragend', (e) => this.handleDragEnd(e));
        
        return piece;
    }
    
    boardToFEN() {
        let fen = '';
        for (let rank = 8; rank >= 1; rank--) {
            let emptyCount = 0;
            for (let file = 0; file < 8; file++) {
                const fileChar = String.fromCharCode(97 + file);
                const square = document.getElementById(fileChar + rank);
                const piece = square ? square.querySelector('.chess-piece') : null;
                
                if (piece) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    fen += this.pieceToFEN(piece.innerHTML);
                } else {
                    emptyCount++;
                }
            }
            if (emptyCount > 0) fen += emptyCount;
            if (rank > 1) fen += '/';
        }
        
        fen += ' ' + (this.move === 'white' ? 'w' : 'b');
        fen += ' KQkq - 0 ' + Math.floor(this.moveCounter / 2 + 1);
        
        return fen;
    }
    
    pieceToFEN(piece) {
        const fenMap = {
            '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': 'P',
            '♚': 'k', '♛': 'q', '♜': 'r', '♝': 'b', '♞': 'n', '♟': 'p'
        };
        return fenMap[piece] || '';
    }
    
    handleDragStart(e) {
        const piece = e.target;
        const square = piece.parentElement;
        
        if (!this.isCorrectTurn(piece)) {
            e.preventDefault();
            return;
        }
        
        this.draggedPiece = piece;
        this.fromSquare = square;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', piece.innerHTML);
        
        // Create a custom drag image without background
        const dragImage = piece.cloneNode(true);
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        dragImage.style.left = '-9999px';
        dragImage.style.background = 'transparent';
        dragImage.style.fontSize = '45px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 22, 22);
        
        // Remove the temporary element after drag starts
        setTimeout(() => dragImage.remove(), 0);
    }
    
    handleDragEnd(e) {
        // Reset any visual feedback
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.draggedPiece || !this.fromSquare) return false;
        
        const toSquare = e.target.classList.contains('square') ? e.target : e.target.parentElement;
        if (!toSquare || !toSquare.classList.contains('square')) return false;
        
        const from = this.fromSquare.id;
        const to = toSquare.id;
        
        if (from === to) {
            this.draggedPiece = null;
            this.fromSquare = null;
            return false;
        }
        
        // Validate move
        if (!this.isValidMove(from, to, this.draggedPiece)) {
            this.draggedPiece = null;
            this.fromSquare = null;
            return false;
        }
        
        // Check if move would leave king in check
        if (this.wouldLeaveKingInCheck(from, to, this.draggedPiece)) {
            this.draggedPiece = null;
            this.fromSquare = null;
            return false;
        }
        
        // Execute move
        const capturedPiece = toSquare.querySelector('.chess-piece');
        let capturedPieceSymbol = capturedPiece ? capturedPiece.innerHTML : null;
        
        if (capturedPiece) capturedPiece.remove();
        
        // Handle en passant capture
        let pieceSymbol = this.draggedPiece.innerHTML;
        const isEnPassant = this.isEnPassantMove(from, to, pieceSymbol);
        if (isEnPassant) {
            const enPassantRank = from[1];
            const enPassantFile = to[0];
            const enPassantSquare = document.getElementById(enPassantFile + enPassantRank);
            const enPassantPawn = enPassantSquare ? enPassantSquare.querySelector('.chess-piece') : null;
            if (enPassantPawn) {
                capturedPieceSymbol = enPassantPawn.innerHTML;
                enPassantPawn.remove();
            }
        }
        
        this.draggedPiece.remove();
        toSquare.appendChild(this.draggedPiece);
        
        // Update king position if king moved
        if (pieceSymbol === '♔') this.kingPositions.white = to;
        if (pieceSymbol === '♚') this.kingPositions.black = to;
        
        // Handle pawn promotion
        if ((pieceSymbol === '♙' && to[1] === '8') || (pieceSymbol === '♟' && to[1] === '1')) {
            const promotedPiece = this.promotePawn(toSquare, pieceSymbol);
            pieceSymbol = promotedPiece;
        }
        
        // Handle castling
        const isCastling = this.isCastlingMove(from, to, this.draggedPiece.innerHTML);
        if (isCastling) {
            this.executeCastling(from, to);
        }
        
        // Record move
        this.moveCounter++;
        const moveRecord = {
            from: from,
            to: to,
            piece: pieceSymbol,
            capture: capturedPieceSymbol,
            castling: isCastling,
            moveNumber: this.moveCounter,
            fen: this.boardToFEN()
        };
        
        // Trim history if we're not at the end
        if (this.currentMoveIndex < this.moveHistory.length - 1) {
            this.moveHistory = this.moveHistory.slice(0, this.currentMoveIndex + 1);
        }
        
        this.moveHistory.push(moveRecord);
        this.currentMoveIndex = this.moveHistory.length - 1;
        
        // Switch turn
        this.move = this.move === 'white' ? 'black' : 'white';
        
        // Clear highlights and check for check
        this.clearHighlights();
        
        // Check for checkmate, stalemate, or check
        const inCheck = this.isKingInCheck(this.move);
        
        if (inCheck) {
            const hasLegal = this.hasLegalMoves(this.move);
            
            if (!hasLegal) {
                const winner = this.move === 'white' ? 'Black' : 'White';
                this.highlightKingInCheck(this.move);
                if (typeof playCheckSound === 'function') playCheckSound();
                this.showGameOverMessage(`Checkmate! ${winner} wins!`);
            } else {
                const kingSquare = document.getElementById(this.kingPositions[this.move]);
                if (kingSquare) kingSquare.classList.add('in-check');
                this.highlightKingInCheck(this.move);
                if (typeof playCheckSound === 'function') playCheckSound();
            }
        } else {
            const hasLegal = this.hasLegalMoves(this.move);
            if (!hasLegal) {
                if (typeof playMoveSound === 'function') playMoveSound();
                this.showGameOverMessage('Stalemate! The game is a draw.');
            } else {
                this.clearCheckHighlight();
                if (typeof playMoveSound === 'function') playMoveSound();
            }
        }
        
        this.draggedPiece = null;
        this.fromSquare = null;
        
        return true;
    }
    
    isCorrectTurn(piece) {
        const pieceColor = this.getPieceColor(piece.innerHTML);
        return pieceColor === this.move;
    }
    
    getPieceColor(piece) {
        const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
        return whitePieces.includes(piece) ? 'white' : 'black';
    }
    
    isValidMove(from, to, piece) {
        const pieceSymbol = piece.innerHTML;
        const targetSquare = document.getElementById(to);
        const targetPiece = targetSquare.querySelector('.chess-piece');
        
        // Can't capture own piece
        if (targetPiece && this.getPieceColor(targetPiece.innerHTML) === this.getPieceColor(pieceSymbol)) {
            return false;
        }
        
        // Validate based on piece type
        switch (pieceSymbol) {
            case '♙':
            case '♟':
                return this.isValidPawnMove(from, to, pieceSymbol, !!targetPiece);
            case '♖':
            case '♜':
                return this.isValidRookMove(from, to);
            case '♘':
            case '♞':
                return this.isValidKnightMove(from, to);
            case '♗':
            case '♝':
                return this.isValidBishopMove(from, to);
            case '♕':
            case '♛':
                return this.isValidQueenMove(from, to);
            case '♔':
            case '♚':
                return this.isValidKingMove(from, to, pieceSymbol);
            default:
                return false;
        }
    }
    
    isValidPawnMove(from, to, piece, isCapture) {
        const isWhite = piece === '♙';
        const direction = isWhite ? 1 : -1;
        const startRank = isWhite ? '2' : '7';
        
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = toRank - fromRank;
        
        // Forward move
        if (fileDiff === 0 && !isCapture) {
            if (rankDiff === direction) return true;
            if (from[1] === startRank && rankDiff === 2 * direction) {
                const middleRank = fromRank + direction;
                const middleSquare = document.getElementById(from[0] + middleRank);
                return !middleSquare.querySelector('.chess-piece');
            }
        }
        
        // Capture (including en passant)
        if (fileDiff === 1 && rankDiff === direction) {
            if (isCapture) return true;
            // Check for en passant
            const targetSquare = document.getElementById(to);
            if (!targetSquare.querySelector('.chess-piece')) {
                // Might be en passant - check if there's an opponent pawn on the side
                const enPassantRank = fromRank;
                const enPassantSquare = document.getElementById(String.fromCharCode(toFile) + enPassantRank);
                const enPassantPiece = enPassantSquare ? enPassantSquare.querySelector('.chess-piece') : null;
                if (enPassantPiece && this.getPieceColor(enPassantPiece.innerHTML) !== this.getPieceColor(piece)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    isValidRookMove(from, to) {
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        if (fromFile !== toFile && fromRank !== toRank) return false;
        
        return this.isPathClear(from, to);
    }
    
    isValidKnightMove(from, to) {
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = Math.abs(toRank - fromRank);
        
        return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
    }
    
    isValidBishopMove(from, to) {
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        if (Math.abs(toFile - fromFile) !== Math.abs(toRank - fromRank)) return false;
        
        return this.isPathClear(from, to);
    }
    
    isValidQueenMove(from, to) {
        return this.isValidRookMove(from, to) || this.isValidBishopMove(from, to);
    }
    
    isValidKingMove(from, to, piece) {
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = Math.abs(toRank - fromRank);
        
        // Normal king move
        if (fileDiff <= 1 && rankDiff <= 1) return true;
        
        // Castling
        if (this.isCastlingMove(from, to, piece)) {
            return this.canCastle(from, to, piece);
        }
        
        return false;
    }
    
    isCastlingMove(from, to, piece) {
        if ((piece !== '♔' && piece !== '♚') || from[1] !== to[1]) return false;
        
        const fileDiff = Math.abs(to.charCodeAt(0) - from.charCodeAt(0));
        return fileDiff === 2;
    }
    
    canCastle(from, to, piece) {
        const isWhite = piece === '♔';
        const rank = isWhite ? '1' : '8';
        
        if (from !== 'e' + rank) return false;
        
        const isKingside = to === 'g' + rank;
        const rookFile = isKingside ? 'h' : 'a';
        const rookSquare = document.getElementById(rookFile + rank);
        const rook = rookSquare ? rookSquare.querySelector('.chess-piece') : null;
        
        if (!rook) return false;
        
        // Check path is clear
        const files = isKingside ? ['f', 'g'] : ['b', 'c', 'd'];
        for (let file of files) {
            const square = document.getElementById(file + rank);
            if (square.querySelector('.chess-piece')) return false;
        }
        
        // King not in check and doesn't pass through check
        if (this.isKingInCheck(this.move)) return false;
        
        const passThrough = isKingside ? 'f' + rank : 'd' + rank;
        if (this.wouldBeInCheck(passThrough, this.move)) return false;
        
        return true;
    }
    
    executeCastling(from, to) {
        const rank = from[1];
        const isKingside = to === 'g' + rank;
        
        const rookFrom = isKingside ? 'h' + rank : 'a' + rank;
        const rookTo = isKingside ? 'f' + rank : 'd' + rank;
        
        const rookSquare = document.getElementById(rookFrom);
        const rook = rookSquare.querySelector('.chess-piece');
        
        if (rook) {
            rook.remove();
            document.getElementById(rookTo).appendChild(rook);
        }
    }
    
    isPathClear(from, to) {
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        const fileStep = toFile > fromFile ? 1 : toFile < fromFile ? -1 : 0;
        const rankStep = toRank > fromRank ? 1 : toRank < fromRank ? -1 : 0;
        
        let currentFile = fromFile + fileStep;
        let currentRank = fromRank + rankStep;
        
        while (currentFile !== toFile || currentRank !== toRank) {
            const squareId = String.fromCharCode(currentFile) + currentRank;
            const square = document.getElementById(squareId);
            
            if (square && square.querySelector('.chess-piece')) return false;
            
            currentFile += fileStep;
            currentRank += rankStep;
        }
        
        return true;
    }
    
    isKingInCheck(color) {
        const kingPos = this.kingPositions[color];
        return this.wouldBeInCheck(kingPos, color);
    }
    
    wouldBeInCheck(position, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        // Check all opponent pieces
        for (let rank = 1; rank <= 8; rank++) {
            for (let file = 97; file <= 104; file++) {
                const squareId = String.fromCharCode(file) + rank;
                const square = document.getElementById(squareId);
                const piece = square ? square.querySelector('.chess-piece') : null;
                
                if (piece && this.getPieceColor(piece.innerHTML) === opponentColor) {
                    // Check basic move validity without recursion
                    const pieceSymbol = piece.innerHTML;
                    let canAttack = false;
                    
                    switch (pieceSymbol) {
                        case '♙':
                        case '♟':
                            canAttack = this.canPawnAttack(squareId, position, pieceSymbol);
                            break;
                        case '♖':
                        case '♜':
                            canAttack = this.isValidRookMove(squareId, position);
                            break;
                        case '♘':
                        case '♞':
                            canAttack = this.isValidKnightMove(squareId, position);
                            break;
                        case '♗':
                        case '♝':
                            canAttack = this.isValidBishopMove(squareId, position);
                            break;
                        case '♕':
                        case '♛':
                            canAttack = this.isValidQueenMove(squareId, position);
                            break;
                        case '♔':
                        case '♚':
                            canAttack = this.canKingAttack(squareId, position);
                            break;
                    }
                    
                    if (canAttack) return true;
                }
            }
        }
        
        return false;
    }
    
    canPawnAttack(from, to, piece) {
        const isWhite = piece === '♙';
        const direction = isWhite ? 1 : -1;
        
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = toRank - fromRank;
        
        // Pawns attack diagonally
        return fileDiff === 1 && rankDiff === direction;
    }
    
    canKingAttack(from, to) {
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = Math.abs(toRank - fromRank);
        
        return fileDiff <= 1 && rankDiff <= 1;
    }
    
    wouldLeaveKingInCheck(from, to, piece) {
        // Store original state
        const fromSquare = document.getElementById(from);
        const toSquare = document.getElementById(to);
        const capturedPiece = toSquare.querySelector('.chess-piece');
        const pieceSymbol = piece.innerHTML;
        const oldKingPos = this.kingPositions[this.move];
        
        // Simulate move
        if (capturedPiece) capturedPiece.remove();
        piece.remove();
        toSquare.appendChild(piece);
        
        // Update king position if king moved
        if (pieceSymbol === '♔') {
            this.kingPositions.white = to;
        } else if (pieceSymbol === '♚') {
            this.kingPositions.black = to;
        }
        
        // Check if in check
        const inCheck = this.isKingInCheck(this.move);
        
        // Undo move - restore exactly
        piece.remove();
        fromSquare.appendChild(piece);
        if (capturedPiece) {
            toSquare.appendChild(capturedPiece);
        }
        
        // Restore king position
        if (pieceSymbol === '♔') {
            this.kingPositions.white = oldKingPos;
        } else if (pieceSymbol === '♚') {
            this.kingPositions.black = oldKingPos;
        }
        
        return inCheck;
    }
    
    clearHighlights() {
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => square.classList.remove('in-check', 'last-move'));
    }
    
    promotePawn(square, pawnSymbol) {
        const isWhite = pawnSymbol === '♙';
        const pieces = isWhite ? 
            ['♕', '♖', '♗', '♘'] : 
            ['♛', '♜', '♝', '♞'];
        const names = ['Queen', 'Rook', 'Bishop', 'Knight'];
        
        let selectedPiece = pieces[0]; // Default to queen
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Create promotion dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            text-align: center;
            border: 2px solid #4a4a4a;
        `;
        dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #f0d9b5; font-size: 24px; font-weight: bold;">Promote Pawn</h3>
            <div style="display: flex; gap: 15px; justify-content: center;"></div>
        `;
        
        const buttonContainer = dialog.querySelector('div');
        pieces.forEach((piece, index) => {
            const btn = document.createElement('button');
            btn.innerHTML = piece;
            btn.title = names[index];
            btn.style.cssText = `
                font-size: 64px;
                padding: 20px;
                border: 3px solid #b58863;
                border-radius: 10px;
                cursor: pointer;
                background: #f0d9b5;
                transition: all 0.2s;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            btn.onmouseover = () => {
                btn.style.background = '#e6cc99';
                btn.style.transform = 'scale(1.1)';
                btn.style.borderColor = '#d4a574';
            };
            btn.onmouseout = () => {
                btn.style.background = '#f0d9b5';
                btn.style.transform = 'scale(1)';
                btn.style.borderColor = '#b58863';
            };
            btn.onclick = () => {
                selectedPiece = piece;
                const pawn = square.querySelector('.chess-piece');
                if (pawn) {
                    pawn.innerHTML = piece;
                }
                document.body.removeChild(overlay);
                
                // Trigger game state check after promotion
                if (typeof checkGameState === 'function') {
                    setTimeout(() => checkGameState(), 100);
                }
            };
            buttonContainer.appendChild(btn);
        });
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        return selectedPiece;
    }

    // Extra functions

    isEnPassantMove(from, to, piece) {
        // Check if this is an en passant capture
        if (piece !== '♙' && piece !== '♟') return false;
        
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        // Must be a diagonal move
        if (Math.abs(toFile - fromFile) !== 1) return false;
        
        // Check correct direction
        const isWhite = piece === '♙';
        const expectedRankDiff = isWhite ? 1 : -1;
        if (toRank - fromRank !== expectedRankDiff) return false;
        
        // Target square must be empty (otherwise it's a regular capture)
        const toSquare = document.getElementById(to);
        if (toSquare.querySelector('.chess-piece')) return false;
        
        // There must be an enemy pawn beside us
        const enPassantSquare = document.getElementById(to[0] + from[1]);
        const enPassantPawn = enPassantSquare ? enPassantSquare.querySelector('.chess-piece') : null;
        if (!enPassantPawn) return false;
        
        const enemyPawn = isWhite ? '♟' : '♙';
        if (enPassantPawn.innerHTML !== enemyPawn) return false;
        
        // CRITICAL: Check that the enemy pawn just made a two-square advance on the previous move
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        
        // Last move must be a pawn
        if (lastMove.piece !== enemyPawn) return false;
        
        // Last move must have ended on the square beside us
        if (lastMove.to !== to[0] + from[1]) return false;
        
        // Last move must have been a two-square advance
        const lastFromRank = parseInt(lastMove.from[1]);
        const lastToRank = parseInt(lastMove.to[1]);
        if (Math.abs(lastToRank - lastFromRank) !== 2) return false;
        
        return true;
    }

    showGameOverMessage(message) {
        // Game over message handled elsewhere
    }

    highlightKingInCheck(kingColor) {
    // Find and highlight the king's square in red
    const kingPiece = kingColor === 'white' ? '♔' : '♚';
    
        for (let row = 1; row <= 8; row++) {
            for (let col = 'a'; col <= 'h'; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
                const squareId = col + row;
                const square = document.getElementById(squareId);
                const piece = square.querySelector('.chess-piece');
                
                if (piece && piece.textContent === kingPiece) {
                    square.classList.add('king-in-check');
                    return;
                }
            }
        }
    }

    clearCheckHighlight() {
        // Remove check highlighting from all squares
        for (let row = 1; row <= 8; row++) {
            for (let col = 'a'; col <= 'h'; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
                const squareId = col + row;
                const square = document.getElementById(squareId);
                square.classList.remove('king-in-check');
            }
        }
    }

    simulateMove(sourceSquare, targetSquare) {
        // Store original state for undo
        const originalSourcePiece = sourceSquare.querySelector('.chess-piece');
        const originalTargetPiece = targetSquare.querySelector('.chess-piece');
        
        // Store original king positions
        const originalKingPositions = {
            white: this.kingPositions.white,
            black: this.kingPositions.black
        };
        
        // Make temporary move
        if (originalTargetPiece) {
            targetSquare.removeChild(originalTargetPiece);
        }
        if (originalSourcePiece) {
            targetSquare.appendChild(originalSourcePiece);
            
            // Update king position if king moved
            if (originalSourcePiece.textContent === '♔') {
                this.kingPositions.white = targetSquare.id;
            } else if (originalSourcePiece.textContent === '♚') {
                this.kingPositions.black = targetSquare.id;
            }
        }
        
        return {
            sourceSquare: sourceSquare,
            targetSquare: targetSquare,
            originalSourcePiece: originalSourcePiece,
            originalTargetPiece: originalTargetPiece,
            originalKingPositions: originalKingPositions
        };
    }

    undoSimulatedMove(tempMove) {
        // Restore original state
        const { sourceSquare, targetSquare, originalSourcePiece, originalTargetPiece, originalKingPositions } = tempMove;
        
        // Remove piece from target
        const currentPiece = targetSquare.querySelector('.chess-piece');
        if (currentPiece) {
            targetSquare.removeChild(currentPiece);
        }
        
        // Restore original pieces
        if (originalSourcePiece) {
            sourceSquare.appendChild(originalSourcePiece);
        }
        if (originalTargetPiece) {
            targetSquare.appendChild(originalTargetPiece);
        }
        
        // Restore king positions
        this.kingPositions.white = originalKingPositions.white;
        this.kingPositions.black = originalKingPositions.black;
    }

    isCheckmate(kingColor) {
        // If king is not in check, it can't be checkmate
        if (!this.isKingInCheck(kingColor)) {
            return false;
        }
        
        // Check if any legal move can get the king out of check
        return !this.hasLegalMoves(kingColor);
    }

    isStalemate(kingColor) {
        // If king is in check, it can't be stalemate
        if (this.isKingInCheck(kingColor)) {
            return false;
        }
        
        // Check if player has no legal moves
        return !this.hasLegalMoves(kingColor);
    }

    hasLegalMoves(playerColor) {
        // Check all pieces of the player to see if any have legal moves
        for (let row = 1; row <= 8; row++) {
            for (let col = 'a'; col <= 'h'; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
                const squareId = col + row;
                const square = document.getElementById(squareId);
                const piece = square.querySelector('.chess-piece');
                
                if (piece && this.getPieceColor(piece.textContent) === playerColor) {
                    // Check all possible moves for this piece
                    for (let testRow = 1; testRow <= 8; testRow++) {
                        for (let testCol = 'a'; testCol <= 'h'; testCol = String.fromCharCode(testCol.charCodeAt(0) + 1)) {
                            const testSquareId = testCol + testRow;
                            const testSquare = document.getElementById(testSquareId);
                            
                            // Skip same square
                            if (squareId === testSquareId) continue;
                            
                            // Check if target square has own piece
                            const targetPiece = testSquare.querySelector('.chess-piece');
                            if (targetPiece && this.getPieceColor(targetPiece.textContent) === playerColor) {
                                continue; // Can't capture own piece
                            }
                            
                            // Check if this move is valid
                            if (this.isValidMoveForPiece(piece.textContent, squareId, testSquareId)) {
                                // Simulate the move to check if it leaves king in check
                                const tempMove = this.simulateMove(square, testSquare);
                                const stillInCheck = this.isKingInCheck(playerColor);
                                this.undoSimulatedMove(tempMove);
                                
                                if (!stillInCheck) {
                                    return true; // Found a legal move
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return false; // No legal moves found
    }

    isValidMoveForPiece(piece, fromSquare, toSquare) {
        // Check basic piece movement rules
        switch(piece) {
            case '♙': case '♟': // Pawns
                // Simplified pawn validation for legal move checking
                const pawnStartCol = fromSquare[0].charCodeAt(0) - 97;
                const pawnStartRow = parseInt(fromSquare[1]);
                const pawnEndCol = toSquare[0].charCodeAt(0) - 97;
                const pawnEndRow = parseInt(toSquare[1]);
                const targetSquare = document.getElementById(toSquare);
                const targetPiece = targetSquare.querySelector('.chess-piece');
                
                if (piece === '♙') { // White pawn
                    if (targetPiece) {
                        // Capture move
                        return Math.abs(pawnEndCol - pawnStartCol) === 1 && (pawnEndRow - pawnStartRow) === 1;
                    } else {
                        // Regular move - check path is clear
                        if (pawnStartCol !== pawnEndCol) return false;
                        if (pawnEndRow - pawnStartRow === 1) return true;
                        if (pawnStartRow === 2 && pawnEndRow - pawnStartRow === 2) {
                            // Check middle square is empty
                            const middleSquare = document.getElementById(fromSquare[0] + '3');
                            return !middleSquare.querySelector('.chess-piece');
                        }
                        return false;
                    }
                } else { // Black pawn
                    if (targetPiece) {
                        // Capture move
                        return Math.abs(pawnEndCol - pawnStartCol) === 1 && (pawnStartRow - pawnEndRow) === 1;
                    } else {
                        // Regular move - check path is clear
                        if (pawnStartCol !== pawnEndCol) return false;
                        if (pawnStartRow - pawnEndRow === 1) return true;
                        if (pawnStartRow === 7 && pawnStartRow - pawnEndRow === 2) {
                            // Check middle square is empty
                            const middleSquare = document.getElementById(fromSquare[0] + '6');
                            return !middleSquare.querySelector('.chess-piece');
                        }
                        return false;
                    }
                }
                
            case '♖': case '♜': // Rooks
                return this.isValidRookMove(fromSquare, toSquare);
                
            case '♗': case '♝': // Bishops
                return this.isValidBishopMove(fromSquare, toSquare);
                
            case '♘': case '♞': // Knights
                return this.isValidKnightMove(fromSquare, toSquare);
                
            case '♕': case '♛': // Queens
                return this.isValidRookMove(fromSquare, toSquare) || this.isValidBishopMove(fromSquare, toSquare);
                
            case '♔': case '♚': // Kings
                return this.canKingAttack(fromSquare, toSquare);
                
            default:
                return false;
        }
    }
    
    // Flip the board orientation
    flipBoard() {
        this.isFlipped = !this.isFlipped;
        
        // Store current piece positions
        const piecePositions = {};
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            const piece = square.querySelector('.chess-piece');
            if (piece) {
                piecePositions[square.id] = piece.innerHTML;
            }
        });
        
        // Re-render the board with new orientation
        this.renderBoard();
        
        // Restore pieces to their squares
        Object.entries(piecePositions).forEach(([squareId, pieceSymbol]) => {
            const square = document.getElementById(squareId);
            if (square) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'chess-piece';
                pieceElement.innerHTML = pieceSymbol;
                pieceElement.draggable = true;
                pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e));
                square.appendChild(pieceElement);
            }
        });
        
        // Re-setup event listeners
        this.setupEventListeners();
    }
}
