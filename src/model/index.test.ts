import {exampleSolvedGrid, Grid} from "./index";

describe(Grid.name, () => {
  test('isSolved', () => {
    expect(exampleSolvedGrid().isSolved()).toBeTruthy()
    expect(exampleSolvedGrid().set({row: 0, col: 0}, 1).isSolved()).toBeFalsy()
  })

  test('generate solved', () => {
    for(let i = 0; i < 10; i++) {
      const grid = Grid.generateSolved()
      expect(grid.isSolved()).toBeTruthy()
    }
  })

  test('solutions', () => {
    const grid = exampleSolvedGrid().set({row: 0, col: 0}, undefined)
    const solutions = Array.from(grid.solutions())
    expect(solutions.length).toEqual(1)
    expect(solutions[0].get({row: 0, col: 0})).toEqual(exampleSolvedGrid().get({row: 0, col: 0}))
  })

  test('generate unsolved', () => {
    for(let blanks = 0; blanks < 10; blanks++) {
      const grid = Grid.generateUnsolved(81 - blanks)
      const solutions = Array.from(grid.solutions())
      expect(solutions.length).toEqual(1)
      expect(solutions[0].isSolved()).toBeTruthy()
    }
  })

  test('solve from empty', () => {
    const grid = new Grid()
    const {value: solution} = grid.solutions().next()
    expect((solution as Grid).isSolved()).toBeTruthy()
  })
})