import { DynamicIsland, DynamicClock } from './dynamicIsland';
import './style.scss'

let lastTime = 0


const updatables = []


function createFFTMatrix(radices) {
  let N = 1
  for (let radix of radices) {
    N *= radix
  }

  /** @type {DynamicIsland[]} */
  const inputs = []
  /** @type {DynamicIsland[]} */
  const outputs = []

  for (let i = 0; i < N; i++) {
    const input_island = new DynamicIsland(i, -1, 0.8, 0.8, 1)
    updatables.push(input_island)
    inputs.push(input_island)
    input_island.text.textContent = i
    const output_island = new DynamicIsland(-1, i, 0.8, 0.8, 1)
    updatables.push(output_island)
    outputs.push(output_island)
    output_island.text.textContent = i
  }

  /** @type {DynamicClock[][]} */
  const matrix = []

  for (let i = 0; i < N; i++) {
    const row = []
    for (let j = 0; j < N; j++) {
      const matrix_vars = new DynamicClock(j, i, 0.8, 0.8, 0.2, i * j / N)
      row.push(matrix_vars)
      updatables.push(matrix_vars)
    }
    matrix.push(row)
  }


  function _split(matrix, radices, x0, y0, j2dn, i2j2dn2) {
    const n0 = matrix.length
    const n2 = radices[0]
    const n1 = Math.floor(n0 / n2)

    if (radices.length == 0) {

      for (let i = 0; i < n0; i += 1) {
        for (let j = 0; j < n0; j += 1) {
          matrix[i][j].x.target = j + x0
          matrix[i][j].y.target = i + y0

          matrix[i][j].time.target = i * j / n0 + j2dn * i + i2j2dn2
        }
      }


      return n0+0.5
    }

    const matrix_groups = []

    let y1 = y0

    let size = 0

    for (let i2 = 0; i2 < n2; i2++) {
      let x1 = x0

      for (let j2 = 0; j2 < n2; j2++) {


        const s_matrix = []
        for (let i1 = 0; i1 < n1; i1++) {
          const row = []
          for (let j1 = 0; j1 < n1; j1++) {
            let i = i1 + i2 * n1
            let j = j1 * n2 + j2
            row.push(matrix[i][j])
          }
          s_matrix.push(row)
        }

        size = _split(s_matrix, radices.slice(1), x1, y1, j2/n0, i2*j2/n2)

        x1 += size
      }

      y1 += size
    }

    return size * n2+0.5
  }




  function split() {
    _split(matrix, radices.slice(0, 2), 0, 0)
  }




  return { split }
}

const fft = createFFTMatrix([2, 2, 2])

function update(time) {
  requestAnimationFrame(update)
  let delta_time = (time - lastTime) / 100;
  lastTime = time;
  // main

  for (let d of updatables)
    d.update(delta_time)
}
requestAnimationFrame(update)

document.addEventListener('mousedown', fft.split)
