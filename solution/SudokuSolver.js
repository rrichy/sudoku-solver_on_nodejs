// This Sudoku solver only solves puzzles that are NxN size,
// where N is a perfect square.

const DLXNode = require("./DLXNode");

class SudokuSolver {
  // private final DLXNode rootNode = new DLXNode(-1,-1, 0, null, -1, - 1, -1);
  // private int numSolutions = 0;
  // private boolean matrixFilled = false, continueSolving = true;
  // private final HashSet<Integer> rowFilter = new HashSet<>();
  // private final ArrayList<int[]> solution = new ArrayList<>();
  // private final ArrayList<int[][]> solutions = new ArrayList<>();

  constructor(p) {
    this.rootNode = new DLXNode(-1, -1, 0, null, -1, -1, -1);
    this.size = p.length;
    this.square = this.size * this.size;
    this.sqrt = Math.round(Math.sqrt(this.size));
    this.matrixRow = this.square * this.size;
    this.matrixCol = this.square * 4;

    // Check first if board is valid
    this.boardIsValid(p);

    console.error("invalid!!!!!");
    this.dlx = [];
    this.dlxHeaders = [];

    this.solution = [];
    this.solutions = [];
    this.rowFilter = new Set();

    this.continueSolving = true;
    this.matrixFilled = false;
    this.numSolutions = 0;

    this.createDLXMatrix();

    // For every clue in the given board, add it to the solution
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (p[row][col] != 0) {
          const digit = p[row][col];
          this.solution.push([row, col, digit]);

          const colCoverIndex = row * this.size + col;
          let column = this.rootNode.right;

          while (column.matCol != colCoverIndex) column = column.right;
          this.coverColumn(column);

          let node = column.bottom;
          while (node.value != digit) node = node.bottom;

          for (let nodeR = node.right; nodeR != node; nodeR = nodeR.right)
            this.coverColumn(nodeR);
        }
      }
    }

    this.getSolved();

    console.log("No more solutions found.");
    console.log("Number of solution/s: " + this.numSolutions);
  }

  boardIsValid(board) {
    for (let i = 0; i < this.size; i++)
      if (board[i].length != this.size)
        throw new Error("The puzzle is not a square!");

    // row & col check
    for (let i = 0; i < this.size; i++) {
      const row = new Set();
      const col = new Set();
      for (let j = 0; j < this.size; j++) {
        // row check
        const rowVal = board[i][j];

        if (!row.has(rowVal)) {
          if (rowVal != 0) row.add(rowVal);
        } else
          throw new Error(
            "The puzzle is invalid! Duplicate value on row: " + i + "." + j
          );

        // col check
        const colVal = board[j][i];

        if (!col.has(colVal)) {
          if (colVal != 0) col.add(colVal);
        } else
          throw new Error(
            "The puzzle is invalid! Duplicate value on column: " + i + "."
          );
      }
    }

    //grid check
    for (let row = 0; row < this.size; row += this.sqrt) {
      for (let col = 0; col < this.size; col += this.sqrt) {
        const grid = new Set();

        for (let i = row; i < row + this.sqrt; i++) {
          for (let j = col; j < col + this.sqrt; j++) {
            const gridVal = board[i][j];

            if (!grid.has(gridVal)) {
              if (gridVal != 0) grid.add(gridVal);
            } else throw new Error("The puzzle is invalid!" + gridVal);
          }
        }
      }
    }
  }

  // Sudoku will always have 4 constraints. All rows/cols/grid should have a digit
  // from 1 to its size with no repeat. All cell should be filled.
  createDLXMatrix() {
    // creating all the header nodes at the same time, linking then to each other
    let current = this.rootNode;
    for (let matColIndex = 0; matColIndex < this.matrixCol; matColIndex++) {
      const header = new DLXNode(-1, -1, -1, null, -1, matColIndex, this.size);
      header.setLeft(current);
      current.setRight(header);
      current = current.right;
      this.dlxHeaders.push(header);
    }
    current.setRight(this.rootNode);

    // creating all the dlxnodes while linking them by rows and connecting each node to its column header
    for (let curRow = 0; curRow < this.size; curRow++) {
      for (let curCol = 0; curCol < this.size; curCol++) {
        for (let val = 0; val < this.size; val++) {
          //cell - row - col - grid
          const cell = Array(this.square)
            .fill("")
            .map(() => 0);
          const row = Array(this.square)
            .fill("")
            .map(() => 0);
          const col = Array(this.square)
            .fill("")
            .map(() => 0);
          const grid = Array(this.square)
            .fill("")
            .map(() => 0);

          const gridN =
            Math.floor(curRow / this.sqrt) * this.sqrt +
            Math.floor(curCol / this.sqrt);
          const matRow = this.square * curRow + this.size * curCol + val;

          const cellIndex = this.size * curRow + curCol;
          const rowIndex = this.size * curRow + val;
          const colIndex = this.size * curCol + val;
          const gridIndex = this.size * gridN + val;

          cell[cellIndex] = new DLXNode(
            curRow,
            curCol,
            val + 1,
            this.dlxHeaders[cellIndex],
            matRow,
            cellIndex,
            -1
          );
          row[rowIndex] = new DLXNode(
            curRow,
            curCol,
            val + 1,
            this.dlxHeaders[rowIndex + this.square],
            matRow,
            rowIndex + this.square,
            -1
          );
          col[colIndex] = new DLXNode(
            curRow,
            curCol,
            val + 1,
            this.dlxHeaders[colIndex + this.square * 2],
            matRow,
            colIndex + this.square * 2,
            -1
          );
          grid[gridIndex] = new DLXNode(
            curRow,
            curCol,
            val + 1,
            this.dlxHeaders[gridIndex + this.square * 3],
            matRow,
            gridIndex + this.square * 3,
            -1
          );

          this.linkLR(cell[cellIndex], row[rowIndex]);
          this.linkLR(row[rowIndex], col[colIndex]);
          this.linkLR(col[colIndex], grid[gridIndex]);
          this.linkLR(grid[gridIndex], cell[cellIndex]);

          const constraints = Array(this.matrixCol)
            .fill("")
            .map(() => 0);
          constraints.splice(0, cell.length, ...cell);
          constraints.splice(this.square, row.length, ...row);
          constraints.splice(this.square * 2, col.length, ...col);
          constraints.splice(this.square * 3, grid.length, ...grid);

          this.dlx.push(constraints);
        }
      }
    }
    this.matrixFilled = true;
    // at this point, all the nodes has been created, only the linking of up and down is left

    // linking nodes up and down
    for (let matColIndex = 0; matColIndex < this.matrixCol; matColIndex++) {
      current = this.dlxHeaders[matColIndex];
      let instances = 0;
      let matRowIndex = 0;
      while (instances < this.size) {
        if (this.dlx[matRowIndex]?.[matColIndex]) {
          this.linkUD(current, this.dlx[matRowIndex][matColIndex]);
          current = this.dlx[matRowIndex][matColIndex];
          instances++;
        }
        matRowIndex++;
      }
      this.linkUD(current, this.dlxHeaders[matColIndex]);
    }
    console.log("ended");
  }

  linkLR(posA, posB) {
    // posA is on left of posB, posB is on right of posA
    posA.setRight(posB);
    posB.setLeft(posA);
  }

  linkUD(posA, posB) {
    // posA is on top of posB, posB is below posA
    posA.setBottom(posB);
    posB.setTop(posA);
  }

  // Visualizing the DLX matrix
  printDLXMatrix() {
    if (!matrixFilled)
      console.error(
        "Sparse Matrix has not been filled yet. Run the fillMatrix method first."
      );
    else {
      let colCount = 0,
        rowCount = 0;
      let header = this.rootNode.right;
      console.log("" + "\t");
      while (header != this.rootNode) {
        colCount++;
        console.log(header.matCol + "\t");
        header = header.right;
      }

      for (let i = 0; i < matrixRow; i++) {
        if (!this.rowFilter.has(i)) {
          rowCount++;
          console.log("\n");
          header = this.rootNode.right;
          console.log(i + "\t");
          while (header != this.rootNode) {
            let current = header.bottom;
            while (current.matRow < i && current != header)
              current = current.bottom;

            if (current.matRow == i) console.log(current.value + "\t");
            else console.log("" + "\t");
            header = header.right;
          }
        }
      }

      console.log("Matrix of: " + rowCount + "x" + colCount);
    }
  }

  getSolved() {
    if (this.rootNode.right == this.rootNode) {
      this.saveSolution();
      this.numSolutions++;
      console.log("\nSolution " + this.numSolutions + ":");
      this.printBoard(this.solutions[this.numSolutions - 1]);

      this.continueSolving = false;
      //            boolean validInput = false;
      //
      //            while(!validInput) {
      //                Scanner ask = new Scanner(System.in);
      //                System.out.println("Continue searching? Enter Y/N:");
      //                String input = ask.nextLine();
      //
      //                if(input.equals("Y")) {
      //                    this.continueSolving = true;
      //                    validInput = true;
      //                }
      //                else if(input.equals("N")) {
      //                    this.continueSolving = false;
      //                    validInput = true;
      //                }
      //                else System.out.println("Error input!");
      //            }
    } else {
      const header = this.findLeastColumn();
      if (header == null) return;
      this.coverColumn(header);

      for (let node = header.bottom; node != header; node = node.bottom) {
        this.solution.push(node.puzzleValues());

        for (
          let nodeRight = node.right;
          nodeRight != node;
          nodeRight = nodeRight.right
        )
          this.coverColumn(nodeRight);

        this.getSolved();

        if (this.continueSolving) {
          this.solution.pop();
          for (
            let nodeLeft = node.left;
            nodeLeft != node;
            nodeLeft = nodeLeft.left
          )
            this.uncoverColumn(nodeLeft);
        } else break;
      }
      if (this.continueSolving) this.uncoverColumn(header);
    }
  }

  findLeastColumn() {
    let minNode = this.rootNode.right;
    let min = this.size;

    for (
      let header = this.rootNode.right;
      header != this.rootNode;
      header = header.right
    ) {
      let count = 0;
      for (let child = header.bottom; child != header; child = child.bottom)
        count++;
      if (count == 0) return null;
      if (count < min) {
        min = count;
        minNode = header;
        if (min == 1) return minNode;
      }
    }
    return minNode;
  }

  coverColumn(c) {
    let header = c;

    if (!header.header) header = header.colHeader;
    header.left.setRight(header.right);
    header.right.setLeft(header.left);

    for (let node = header.bottom; node != header; node = node.bottom) {
      this.rowFilter.add(node.matRow);
      for (
        let nodeRight = node.right;
        node != nodeRight;
        nodeRight = nodeRight.right
      ) {
        nodeRight.top.setBottom(nodeRight.bottom);
        nodeRight.bottom.setTop(nodeRight.top);
      }
    }
  }

  uncoverColumn(c) {
    let header = c;
    if (!header.header) header = header.colHeader;

    for (let node = header.top; node != header; node = node.top) {
      this.rowFilter.delete(node.matRow);
      for (
        let nodeLeft = node.left;
        node != nodeLeft;
        nodeLeft = nodeLeft.left
      ) {
        nodeLeft.top.setBottom(nodeLeft);
        nodeLeft.bottom.setTop(nodeLeft);
      }
    }
    header.left.setRight(header);
    header.right.setLeft(header);
  }

  printBoard(answer) {
    let div = "";
    const sqrt = Math.round(Math.sqrt(this.size));
    for (let i = 0; i < this.size + 3 * (sqrt - 1); i++) div += "--";
    for (let row = 0; row < this.size; row++) {
      if (row != 0 && row % this.sqrt == 0) console.log("\n" + div);
      for (let col = 0; col < this.size; col++) {
        if (col % sqrt == 0 && col != 0) console.log("|\t");
        console.log(answer[row][col] + "\t");
      }
      console.log("\n");
    }
  }

  saveSolution() {
    const singleSolution = Array(this.size)
      .fill("")
      .map(() =>
        Array(this.size)
          .fill("")
          .map(() => 0)
      );

    for (let sol of this.solution) singleSolution[sol[0]][sol[1]] = sol[2];

    this.solutions.push(singleSolution);
  }

  solve() {
    return this.solutions[0];
  }
}

module.exports = SudokuSolver;
