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


  






  function split() {

    let n1 = radices[0]
    let n2 = radices[1]

    for (let j = 0; j < N; j++) {
      let j1 = Math.floor(j / n1)
      let j2 = Math.floor(j % n1)

      setTimeout(() => {
        inputs[j].x.target = j1 + j2 * (n2 + 0.2)
        inputs[j].y.acceleration += j2
      }, j2 * 100);
    }

    for (let i = 0; i < N; i++) {

      let i1 = Math.floor(i % n2)
      let i2 = Math.floor(i / n2)

      outputs[i].y.target = i1 + i2 * (n2 + 0.2)

      for (let j = 0; j < N; j++) {
        let j1 = Math.floor(j / n1)
        let j2 = Math.floor(j % n1)
        setTimeout(() => {


          matrix[i][j].x.target = j1 + j2 * (n2 + 0.2)
          matrix[i][j].y.target = i1 + i2 * (n2 + 0.2)
          matrix[i][j].y.acceleration += j2
        }, j2 * 100 + i * 50);

      }
    }

  }
  return { split }
}

const fft = createFFTMatrix([3, 2])

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
