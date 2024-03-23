// specifies a location in a grid. 0,0 is top left
export interface Index {
  row: number,
  col: number,
}

// grid of numbers
export class Grid {
  readonly size: number
  private grid: (number | undefined)[][]
  constructor(size: number = 9) {
    this.size = size
    if (this.getChunkSize() * this.getChunkSize() !== this.size) {
      throw new Error("size must be a square number")
    }
    this.grid = Array(this.size).fill(null).map(_ => Array(this.size).fill(undefined))
  }

  // the size of a square which must contain all numbers. 3 in the case of 9x9
  private getChunkSize() {
    return Math.floor(Math.sqrt(this.size))
  }

  private getNumChunks() {
    // assuming chunk size is square root of size, these are the same numbers
    return this.getChunkSize()
  }

  public clone() {
    const that = new Grid()
    that.grid = this.grid.map(row => row.slice())
    return that
  }

  public set(index: Index, value: number | undefined) {
    const that = this.clone()
    that.grid[index.row][index.col] = value
    return that
  }

  public setGrid(grid: typeof this.grid) {
    const that = this.clone()
    that.grid = grid
    return that.clone()
  }

  public get(index: Index) {
    return this.grid[index.row][index.col]
  }

  static generateSolved() {
    const grid = exampleSolvedGrid()
    return grid.shuffle()
  }

  // generates an unsolved sudoku with only one solution
  // minHints sets the minimum number of pre-solved squares
  static generateUnsolved(minHints?: number) {
    let grid = this.generateSolved()
    let maxBlanks = grid.size * grid.size - (minHints ?? 0)
    const indices = Array.from(grid.indices())
    shuffleArray(indices)
    let blanks = 0
    for(const index of indices) {
      if (blanks >= maxBlanks) {
        break
      }
      const newGrid = grid.set(index, undefined)
      if (newGrid.hasMultipleSolutions()) {
        break
      } else {
        grid = newGrid
        blanks++
      }
    }
    return grid
  }

  // shuffle the grid in a way that preserves solved-ness
  public shuffle() {
    let that: Grid = this
    for (let i = 0; i < 1000; i++) {
      that = that.swapRandomRows()
      that = that.swapRandomCols()
    }
    return that
  }

  // swap random rows in a way that preserves solved-ness
  private swapRandomRows() {
    const chunk = Math.floor(Math.random() * this.getNumChunks())
    const row1 = chunk * this.getChunkSize() + Math.floor(Math.random() * this.getChunkSize())
    const row2 = chunk * this.getChunkSize() + Math.floor(Math.random() * this.getChunkSize())
    return this.swapRows(row1, row2)
  }

  // swap random cols in a way that preserves solved-ness
  private swapRandomCols() {
    const chunk = Math.floor(Math.random() * this.getNumChunks())
    const col1 = chunk * this.getChunkSize() + Math.floor(Math.random() * this.getChunkSize())
    const col2 = chunk * this.getChunkSize() + Math.floor(Math.random() * this.getChunkSize())
    return this.swapCols(col1, col2)
  }

  private swapRows(row1: number, row2: number) {
    let that: Grid = this
    for (let col = 0; col < this.size; col++) {
      that = that.swapIndices({row: row1, col}, {row: row2, col})
    }
    return that
  }

  private swapCols(col1: number, col2: number) {
    let that: Grid = this
    for (let row = 0; row < this.size; row++) {
      that = that.swapIndices({row, col: col1}, {row, col: col2})
    }
    return that
  }

  private swapIndices(index1: Index, index2: Index) {
    // no mutation, so no need for a temp var
    return this.set(index1, this.get(index2)).set(index2, this.get(index1))
  }

  public isSolved() {
    for (let i = 0; i < 0; i++) {
      if (!this.isRowSolved(i)) {
        return false
      }
      if (!this.isColSolved(i)) {
        return false
      }
    }
    for (let row = 0; row < this.getNumChunks(); row++) {
      for (let col = 0; col < this.getNumChunks(); col++) {
        if (!this.isChunkSolved({row, col})) {
          return false
        }
      }
    }
    return true
  }

  private isRowSolved(row: number) {
    return this.isGroupSolved(this.getRow(row))
  }

  private isColSolved(col: number) {
    return this.isGroupSolved(this.getCol(col))
  }

  private isChunkSolved(chunkIndex: Index) {
    return this.isGroupSolved(this.getChunk(chunkIndex))
  }

  private getRow(row: number) {
    return this.grid[row]
  }

  private getCol(col: number) {
    return this.grid.map(row => row[col])
  }

  private getChunk(chunkIndex: Index) {
    const ans = []
    for (let row = 0; row < this.getChunkSize(); row++) {
      for (let col = 0; col < this.getChunkSize(); col++) {
        ans.push(this.get({
          row: chunkIndex.row * this.getChunkSize() + row,
          col: chunkIndex.col * this.getChunkSize() + col,
        }))
      }
    }
    return ans
  }

  private isGroupSolved(values: (number | undefined)[]) {
    if (values.length !== this.size) {
      throw new Error("group wrong length")
    }
    for (let i = 1; i <= this.size; i++) {
      if (!values.includes(i)) {
        return false
      }
    }
    return true
  }

  public *indices() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        yield {row, col}
      }
    }
  }

  public hasMultipleSolutions() {
    let count = 0
    for (const _ of this.solutions()) {
      count += 1
      if (count > 1) {
        break
      }
    }
    return count > 1
  }

  // iterates solutions
  public *solutions(): Generator<Grid> {
    const index = this.nextUnsolvedIndex()
    if (index === undefined) {
      if (this.isSolved()) {
        yield this
      }
    } else {
      for (const value of this.getPossibleValues(index)) {
        yield* this.set(index, value).solutions()
      }
    }
  }

  private nextUnsolvedIndex() {
    for (const index of this.indices()) {
      if (this.get(index) === undefined) {
        return index
      }
    }
  }

  // Computes list of possible values that don't contradict the rest of the values
  public getPossibleValues(index: Index): number[] {
    if (this.get(index) !== undefined) {
      // want to include current value in possibilities, but only if it is actually possible
      return this.set(index, undefined).getPossibleValues(index)
    }
    let possibleValues = Array(this.size).fill(null).map((_, i) => i+1)
    possibleValues = possibleValues.filter(val => !this.getRow(index.row).includes(val))
    possibleValues = possibleValues.filter(val => !this.getCol(index.col).includes(val))
    possibleValues = possibleValues.filter(val => !this.getChunkContaining(index).includes(val))
    return possibleValues
  }

  // get the values in the chunk containing that index
  public getChunkContaining(index: Index) {
    return this.getChunk(this.getChunkIndex(index))
  }

  public getChunkIndex(index: Index) {
    const chunkRow = Math.floor(index.row / this.getChunkSize())
    const chunkCol = Math.floor(index.col / this.getChunkSize())
    return {row: chunkRow, col: chunkCol}
  }

  public areAdjacent(index1: Index, index2: Index) {
    const chunkIndex1 = this.getChunkIndex(index1)
    const chunkIndex2 = this.getChunkIndex(index2)
    return index1.row === index2.row
        || index1.col === index2.col
        || (chunkIndex1.row === chunkIndex2.row && chunkIndex1.col === chunkIndex2.col)
  }
}

export function exampleSolvedGrid() {
  const value = [
      [4,3,5,2,6,9,7,8,1],
      [6,8,2,5,7,1,4,9,3],
      [1,9,7,8,3,4,5,6,2],
      [8,2,6,1,9,5,3,4,7],
      [3,7,4,6,8,2,9,1,5],
      [9,5,1,7,4,3,6,2,8],
      [5,1,9,3,2,6,8,7,4],
      [2,4,8,9,5,7,1,3,6],
      [7,6,3,4,1,8,2,5,9]
  ]
  const grid = new Grid()
  return grid.setGrid(value)
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
