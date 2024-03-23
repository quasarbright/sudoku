import {Grid, Index} from "../model";
import React, {useEffect, useState} from "react";

export interface GridProps {
  initialGrid: Grid
}

export function GridView({initialGrid}: GridProps) {
  const [grid, setGrid] = useState(initialGrid)
  // which cell is hovered over
  const [hoverIndex, setHoverIndex] = useState<Index | undefined>(undefined)

  // useEffect(() => {
  //   // if there is only one option for a cell, auto select it
  //   for(const index of grid.indices()) {
  //     const possibilities = grid.getPossibleValues(index)
  //     if (possibilities.length === 1) {
  //       setGrid(grid => grid.set(index, possibilities[0]))
  //     }
  //   }
  // }, [grid]);

  return (
      <div>
        <table style={{borderCollapse: 'collapse'}}
               onMouseLeave={() => setHoverIndex(undefined)}
        >
          {Array(grid.size).fill(null).map((_, row) => (
              <tr key={row}>
                {Array(grid.size).fill(null).map((_, col) => (
                    <td style={getCellStyle({row, col}, grid.size, !!hoverIndex && grid.areAdjacent(hoverIndex, {row, col}))} key={col}
                        onMouseEnter={() => setHoverIndex({row, col})}
                    >
                      <div>
                        <Cell value={grid.get({row, col})}
                              options={grid.getPossibleValues({row, col})}
                              onChange={(newValue) => setGrid(grid => grid.set({
                                row,
                                col
                              }, newValue))}
                              disabled={initialGrid.get({row, col}) !== undefined}
                              size={grid.size}
                        />
                      </div>
                    </td>
                ))}
              </tr>
          ))}
        </table>
        {grid.isSolved() && (
            <p>solved!</p>
        )}
      </div>
  )
}

interface CellProps {
  value: number | undefined
  options: number[]
  onChange(newValue: number | undefined): void
  disabled: boolean
  size: number
}

function Cell({value, options, onChange, disabled, size}: CellProps) {
  if (disabled) {
    return <p>{value}</p>
  } else {
    const chunkSize = Math.floor(Math.sqrt(size))
    return (
        <table>
          {Array(chunkSize).fill(null).map((_, row) => (
              <tr key={row}>
                {Array(chunkSize).fill(null).map((_, col) => {
                  const buttonValue = row * chunkSize + col + 1
                  const noOptions = options.length === 0
                  const selected = value === buttonValue
                  const style = {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    ...(selected ? {borderColor: 'blue'} : {}),
                    ...(noOptions ? {backgroundColor: 'red'} : {}),
                  }
                  return (
                      <td key={col}>
                        <button style={style}
                                disabled={!options.includes(buttonValue)}
                                onClick={() => selected ? onChange(undefined) : onChange(buttonValue)}
                        >
                          {buttonValue}
                        </button>
                      </td>
                  );
                })}
              </tr>
          ))}
        </table>
    )
  }
}

function getCellStyle({row, col}: Index, size: number, highlighted: boolean): React.CSSProperties {
  const chunkSize = Math.floor(Math.sqrt(size))
  const thinWidth = 1
  const thickWidth = 3
  return {
    textAlign: 'center',
    width: '3em',
    height: '3em',
    borderStyle: 'solid',
    borderTopWidth: row === 0 ? thickWidth : thinWidth,
    borderLeftWidth: col === 0 ? thickWidth : thinWidth,
    borderBottomWidth: row % chunkSize === chunkSize - 1 ? thickWidth : thinWidth,
    borderRightWidth: col % chunkSize === chunkSize - 1 ? thickWidth : thinWidth,
    ...(highlighted ? {backgroundColor: 'rgba(0,166,255,0.27)'} : {})
  }
}