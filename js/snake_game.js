class SnakeGame{
    constructor(boardId){
        this.boardElement = document.getElementById(boardId);
        this.directions = ['d'];
        this.currentDirection = null;
        this.snakeBody = [40];
        
        this.renderGame();
        this.initialize();


    }

    initialize(){
        // this.currentDirection = this.directions[Math.floor(Math.random()*3)]
        this.currentDirection = 'd';
        this.snakeMovement();
        this.addKeyboardControls();
        

    }

    addKeyboardControls(){
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'ArrowUp':
                    this.changeDirection('u');
                    break;
                case 'ArrowDown':
                    this.changeDirection('d');
                    break;
                case 'ArrowLeft':
                    this.changeDirection('l');
                    break;
                case 'ArrowRight':
                    this.changeDirection('r');
                    break;
            }
        });
    }

    snakeMovement(){
        if(this.currentDirection === 'l'){
           setInterval(() => {
                for (let i = 0; i < this.snakeBody.length;i++){
                    this.snakeBody[i] -=1;
                    console.log(this.snakeBody);
                }

                this.updateSnakeBody();
            }, 1000); 
        }

        else if(this.currentDirection === 'r'){
            setInterval(() => {
                for (let i = 0; i < this.snakeBody.length;i++){
                    this.snakeBody[i] +=1;
                    console.log(this.snakeBody);
                }

                this.updateSnakeBody();
            }, 1000);
        }

        else if (this.currentDirection === 'u'){
            setInterval(() => {
                for (let i = 0; i < this.snakeBody.length;i++){
                    this.snakeBody[i] -=9;
                    console.log(this.snakeBody);
                }

                this.updateSnakeBody();
            }, 1000);
        }

        else if(this.currentDirection === 'd'){
            console.log('hello');
            setInterval(() => {
                for (let i = 0; i < this.snakeBody.length;i++){

                    // const row = Math.floor((this.snakeBody[i]+1)/9)  + 1
                    // const col = this.snakeBody[i]-((row -1)* 9) + 2
                    this.snakeBody[i] += 9
                    // console.log(row,col);
                }

                this.updateSnakeBody();
            }, 1000);
        }
        else{}
    }


    showdirection(){
        console.log(this.currentDirection);
    }

    updateSnakeBody(){
        for(let i = 0; i < 81; i++){
            if(this.snakeBody.find(e=>e === i)){
                document.getElementById(i).className =  "square body";
            } 

            else{
                document.getElementById(i).className = 'square'
            }
        }
        
    }


    renderGame(){
        this.boardElement.innerHTML = '';

        for(let i = 0; i < 81; i++){
            if(this.snakeBody.find(e=>e === i)){
                this.boardElement.innerHTML += `<div class="square body" id="${i}">p</div>`
            } 
            else{
                this.boardElement.innerHTML += `<div class="square" id="${i}">p</div>`
            }
        }
    }

    changeDirection(newDirection){
        this.currentDirection = newDirection;
    }
}