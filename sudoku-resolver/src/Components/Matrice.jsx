import styled from 'styled-components';
import { useState } from 'react'

/*************  style ***********$*/
const Table = styled.table`
    border: 4px black solid; 
    border-collapse: collapse;
    width : 400px;
    position : relative;
    top : 100px;
    left: 400px;
    `

const Tr = styled.tr`
    border-bottom : ${ ({rowIndex, limitCol}) => (rowIndex+1)%limitCol===0 ? "3px solid black":""};
    `


const Td = styled.td`
    height : 30px;
    width : 10%;
    border : 1px black solid;
    text-align : center;
    border-right : ${ ({colIndex, limitRow}) => (colIndex+1)%limitRow===0 ? "3px solid black":""};
    `

const Input = styled.input`
    font-family: Verdana, Arial, sans-serif;
    font-weight: bold;
    font-size: 16px;
    border: 0;
    text-align: center;
    vertical-align: bottom;
    margin-top: 4px;
    padding: 0;
    width: 30px;
    height: 24px;
    `

const Button = styled.button`
    position : relative;
    top : ${({NextPrev}) => (NextPrev ? "120px" : "170px")};
    left : ${({NextPrev}) => (!NextPrev ? "510px" : "580px")};
    &:hover {
        background-color: ${({color}) => (color ? color : "")};
      }
`

/***************** MyFunctions ****************/

const checkValue = (value,size)=>{
    const number = parseInt(value);
    if(value.length >0 && isNaN(number))
        return false;
    else if(number<1 || number>size)
        return false;
    else
        return true;
}

const isValidCandidate = (board, row, col, num) =>{
    
    const [rowMinBound, rowMaxBound] = getBounds(row, 0, 0);
    const [colMinBound, colMaxBound] = getBounds(col, 0, 0);
    const value = num.toString();

    for(let i=0; i<9; i++){
        if(value === board[row][i])
            return false;
    }

    for(let i=0; i<9; i++){
        if(value === board[i][col])
            return false;
    }

    for(let i= rowMinBound; i<=rowMaxBound; i++){
        if(i===row)
            continue;
        for(let j=colMinBound; j<=colMaxBound; j++){
            if(j === col)
                continue;
            if(value === board[i][j])
                return false;
        }
    }
    return true;
    
}


const getBounds = (pos, min ,max) =>{
    if((pos+3)%3 === 0){
        min = pos + 1;
        max = pos + 2;
    }
    else if((pos+3)%3 === 1){
        min = pos - 1;
        max = pos + 1;
    }

    else{
        min = pos - 2;
        max = pos - 1;
    }
    return [min,max];
}


const sudokuSolver = (board, size)=>{
    let results = [];
    let numberOfSolutions = 0; // In case we have multiple solutions

    const solver = (board, row, col, size) => {
        if(row+1 === size && col === size){
            results.push(board.map(row=>([...row])));
            numberOfSolutions += 1;
            return;
        }
        
        if(col === size){
            row+=1;
            col=0;
        }
        
        if(board[row][col]!== ""){
            solver(board, row, col+1, size);
            return;
        }
    
        for (let num = 1; num <= size; num++) {
            if(isValidCandidate(board, row, col, num)){

                board[row][col] = num.toString();   
                solver(board, row, col+1, size);
                if(numberOfSolutions >4)//We return at mots 5 solutions
                    return;
                board[row][col]= "";
            }
            
        }
    };

    solver(board, 0, 0, size);
    
    return results;
}













const Matrice = ({size})=>{

    let board = [[]];
    for(let i=0; i<size; i++){
        if(i>0)
            board.push([]);
        for(let j=0; j<size; j++)
            board[i].push("");
    }

    const [mat, updateMat] = useState(board);
    const [initialMat, updateInitMat] = useState(board);
    const [isSolved, setIsSolved] = useState(false);
    const [results, updateResults] = useState([]);
    const [index, setIndex] = useState(0);

    const limitRow = size%2===0 ? size/2 : (size-1)/2 -1;
    const limitCol = size/limitRow;
    const rows = [];

    for(let i=0; i< size; i++)
        rows.push(i);
    

    const handleChange = (i,j,value,size)=>{
        
        if(checkValue(value,size)){
            board = mat.map(row => [...row]);
            board[i][j] = value;
            updateMat(board);
        }
        else
            alert("La valeur que vous voulez saisir est invalide!");
        
    }

    const solveSudoku = (mat, size)=>{
        const copyMat = mat.map(row => [...row]);
        updateInitMat(mat.map(row => [...row]));

        let res = sudokuSolver(copyMat, size);
        updateResults(res);
        if(res.length === 0){
            alert("Your Sudoku is not valid !!!!");
            return;
        }
        setIsSolved(true);
        updateMat(res[0]);
    }

    const resetSudoku = (board) => {
        setIsSolved(false);
        updateMat(board);
    }

    const getSolution = (direction) => {
        if(direction === "next" && index +1 < results.length){
            updateMat(results[index+1]);
            setIndex(index+1);  
        }
        else if(direction === "prev" && index-1 >= 0){
            updateMat(results[index-1]);
            setIndex(index-1);
        }
    }


    return(
        <div>
            <Table>
                <tbody>
                    {
                        rows.map((row,rowIndex) => (
                            <Tr limitCol = {limitCol}  rowIndex = {rowIndex} key={rowIndex}>
                                {
                                    rows.map((row,colIndex)=>(
                                        <Td limitRow= {limitRow} colIndex = {colIndex} key={colIndex}>
                                            <Input value = {mat[rowIndex][colIndex]} type={"text"} onChange = {(e) => handleChange(rowIndex, colIndex,e.target.value,size)} />
                                        </Td>
                                    ))
                                }
                            </Tr>
                        ))
                    }
                </tbody>
            </Table>
            {
                isSolved ? (<div>
                                <Button  onClick={() => getSolution("prev")}  NextPrev = {true} color = {"black"}  >&#8249;</Button>
                                <Button  onClick = {() => getSolution("next")}  NextPrev = {true} color = {"black"}>&#8250;</Button>
                                <Button color = {"blue"} onClick = {()=> resetSudoku(initialMat)}>reset</Button>
                                <Button color = {"red"} onClick = {()=> resetSudoku(board)}>clear</Button>
                            </div>) : 
                            (<Button color = {"green"} NextPrev = {true} onClick ={()=> solveSudoku(mat, size)}  >Solve</Button>)
            }
            
            
        </div>
    )
}

export default Matrice;