import { useState, useEffect } from 'react';
import blueCandy from './images/blue-candy.png'
import greenCandy from './images/green-candy.png'
import orangeCandy from './images/orange-candy.png'
import redCandy from './images/red-candy.png'
import yellowCandy from './images/yellow-candy.png'
import purpleCandy from './images/purple-candy.png'
import blank from './images/blank.png'

const width = 8;

const candyImageMap = {
  'blue' : blueCandy,
  'green' : greenCandy,
  'orange' : orangeCandy,
  'purple' : purpleCandy,
  'red' : redCandy,
  'yellow' :yellowCandy
}
const candyColors = [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'yellow'
]

if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length !== array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] !== array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

// TODO: implement bsf to make this faster
// Similar as the island problem
const App = () => {
  const [board, setBoard] = useState([]);
  const [squareBeingDragged, setSquareBeingDragged] = useState({})
  const [squareBeingReplaced, setSquareBeingReplaced] = useState({})
  const [squareBeingDraggedColor, setSquareBeingDraggedColor] = useState('white')

  const getImage = (color) =>{
    const img = candyImageMap[color];
    return img ?? blank;
  }
  let squaresResolved = 0;
  const checkForRowOf = (rowOf, board) =>{
    let modified = false;
    const moduloInvalid = width - rowOf;
    if(board.length > 0)
    for(let i = 0; i < width * width ; i++){
      if(i % width > moduloInvalid)
      continue;
      const row =[];
      const currentColor = board[i];
      let valuesMatch = true;
      for(let k = 1; k < rowOf; k++){
        if(board[i +k]!== currentColor)
        {
          valuesMatch = false;
        }
        row.push(i + k)
      }
      if(currentColor !== '' && valuesMatch){
        modified = true;
        board[i] = '';
        squaresResolved++;
        for(let j = 0; j < row.length; j ++){
          board[row[j]] =''
        squaresResolved++;
        }
      }
    }
    return [
      modified,
      board
    ];
  }

  const checkForColumnOf = (columnOf, board) =>{
    let modified = false;
    const rowsToLeave = columnOf -1;
    const limit = (board.length - 1) - (width * rowsToLeave)
    if(limit < 0 )
    return;
    for(let i = 0 ; i < limit; i++){
      const columns = [];
      const currentColor = board[i];
      let valuesMatch = true;
      for(let k = 1; k <= rowsToLeave; k++){
        if(board[ i +(width *k)] !== currentColor){
          valuesMatch = false;
        }
        columns.push(i +(width *k));
      }
     
      if(currentColor !== '' && valuesMatch){     
        board[i] = '';
        modified = true;
        squaresResolved++;
        for(let j = 0; j < columns.length; j ++){
          board[columns[j]] = '';
          squaresResolved++;
        }
      }
    }
    return [
      modified,
      board
    ];
  }

  const generateRandomColor =() =>{
    const randNumber = Math.floor(Math.random() * candyColors.length)
    const randomColor = candyColors[randNumber];
    return randomColor;
  }

  const checkAndFillEmptySpaces = (board) =>{
    let empty = true;
    let currentBoard = board;
    while(empty){
     [empty, currentBoard] = moveSquareDown(currentBoard)
     setBoard(currentBoard)
    }
   return currentBoard;
  }

  const findMatches = (localBoard) =>{
    const [modifed4, boardUpdate4Matches] = updateBoard(4, localBoard)
    const [modifed3, boardAfterInint] = updateBoard(3, boardUpdate4Matches)
    // console.log("Board after first init" + boardAfterInint)
    let opBoard = boardAfterInint;
    if(modifed4 || modifed3){
      opBoard = checkAndFillEmptySpaces(opBoard);
      let modifyOn3 = true;
      let modifyOn4 = true;
      while(modifyOn3 || modifyOn4){
        let[ modify4, board4] = updateBoard(4, opBoard);
        let[ modify3, board3] = updateBoard(3, board4);
        if(modify4 || modify3){
          opBoard = checkAndFillEmptySpaces(board3);
        }
        modifyOn4 = modify4;
        modifyOn3  = modify3;
      }
    }
    return [
      (modifed3 || modifed4),
      opBoard
    ]
  }
  const createBoard = () =>{
    const localBoard = []
    if(board.length > 0)
    return;
    for(let i = 0; i < width * width; i ++){
      const randomColor = generateRandomColor();
      localBoard.push(randomColor)
    }

    const [matchesFound, opBoard] = findMatches(localBoard)
    setBoard([...opBoard])
    console.log("Points : " + squaresResolved) 
   
  }
const moveSquareDown = (board) =>{
  let emptySquare = false;
  for(let i = 0; i < (width * width) - width ; i ++){
    if(i < width && board[i] === ''){
      board[i] = generateRandomColor();
    }
    if(board[i + width] === ''){
      emptySquare = true;
      board[i + width] = board[i];
      board[i] = '';
    }
  }
   return [
    emptySquare, 
    board
   ]
}

  useEffect(()=>{
    createBoard();   
  }, [])

  const updateBoard = (num, board) =>{
    const newBoard = [...board]
    let [rowModified, rowUpdatedBoard] = checkForRowOf(num, newBoard);
    let [columnModified, columnUpdatedBoard] = checkForColumnOf(num, rowUpdatedBoard);
    return [
      rowModified || columnModified,
      columnUpdatedBoard];
  }

  const dragStart = (e) =>{
    setSquareBeingDragged(e.target)
    // e.dataTransfer.setData('text/plain', e.target.getAttribute('data-id'));
    // console.log(e.target.classList)
    // e.target.classList.add('hide');
    // var img = document.createElement("img");
    // img.src = blueCandy;
    // img.height = "2px"
    // img.width = "2px"
    // e.dataTransfer.setDragImage(img, 0,0);
    // e.dataTransfer.setDragImage(img, 1, 1);
    setTimeout(function(){
      e.target.style.visibility = "hidden";
  }, 0);
    console.log("Drag start")
    setBoard([...board])
  }

  const dragDrop = (e) => setSquareBeingReplaced(e.target)
  

  const dragEnd = () =>{
    const squareBeingDraggedId =parseInt(squareBeingDragged.getAttribute('data-id'))
    squareBeingDragged.style.visibility = 'visible';
    const squareBeingDraggedColor = board[squareBeingDraggedId]
    if(!!Object.keys(squareBeingReplaced).length){
      const squareBeingReplacedId =parseInt(squareBeingReplaced.getAttribute('data-id'))
      const localBoard = [...board]
      
      const validMoves = [ squareBeingDraggedId -1, squareBeingDraggedId +1, squareBeingDraggedId- width, squareBeingDraggedId+width ]
      const validMove = validMoves.includes(squareBeingReplacedId);
      if(squareBeingReplacedId !== squareBeingDraggedId && validMove){
        const currentSquareColor = localBoard[squareBeingReplacedId];
        localBoard[squareBeingReplacedId] = squareBeingDraggedColor;
        localBoard[squareBeingDraggedId] = currentSquareColor;
        const [matchesFound, opBoard] = findMatches(localBoard);
        if(matchesFound)
        setBoard([...opBoard])
        else {
          localBoard[squareBeingReplacedId] = currentSquareColor;
          localBoard[squareBeingDraggedId] = squareBeingDraggedColor;
          setBoard([...localBoard]);
        }
      }
      else {
        localBoard[squareBeingDraggedId] = squareBeingDraggedColor;
        setBoard([...localBoard])
      }
    }
    else {
      const localBoard = [...board];
      localBoard[squareBeingDraggedId] = squareBeingDraggedColor;
      setBoard([...localBoard])
    }
    setSquareBeingDraggedColor('')
    setSquareBeingReplaced({});
    setSquareBeingDragged({});

  }

  return (
  <div className="app">
   <div className="game">
     {board.map((candy, index) => {
      const  imgSrc = getImage(candy);
     return <img 
     onDrop={dragDrop}
     onDragStart={dragStart}
     onDragEnd={dragEnd}
     onDragLeave={(e) => e.preventDefault()}
     onDragEnter={(e) => e.preventDefault()}
     onDragOver={(e) => e.preventDefault()}
     draggable={true}
     data-id={index}
     key={index}
     src={imgSrc}
     alt={imgSrc}
     />
     }
     )}
   </div>
    </div>
  );
}

export default App;
