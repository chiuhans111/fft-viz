import './style.scss'

import { BaseNode, AddNode, MultiplyNode } from './computenode'

const svg = document.getElementById('svg')

const all_updatables = []

function update() {
  requestAnimationFrame(update)
  for (let o of all_updatables) o.update()
}

update()

function example() {
  const v1 = new BaseNode(1, 2)
  const v2 = new BaseNode(3, 2)
  const n = new AddNode(2, 3, [v1, v2])
  const n2 = new MultiplyNode(2, 4, n, 2)
  all_updatables.push(v1, v2, n, n2)
}
// example()


function createFFT(radices) {
  // radices: [r0, r1, ..., rn]
  // size of FFT will be r0 * r1 * ... * rn
  // we will decompose the FFT into r0 smaller FFT, then r1, then ... rn

  // first, find the N 
  let N = 1
  for (let r of radices) N *= r

  // create input and output nodes
  const input_nodes = []
  // const output_nodes = []

  for (let i = 0; i < N; i++) {
    const input_node = new BaseNode(i, -1)
    input_node.delay = i*5
    // const output_node = new BaseNode(-1, i)
    // output_node.delay = i*5+10

    input_nodes.push(input_node)
    // output_nodes.push(output_node)
    all_updatables.push(input_node)
  }

  // setup typical FFT
  const typical_add_nodes = []

  for (let j = 0; j < N; j++) {
    const row_of_mul = []
    for (let i = 0; i < N; i++) {
      const mul = new MultiplyNode(i, j, input_nodes[i], i * j / N)
      mul.delay = (i+j)*10
      all_updatables.push(mul)
      row_of_mul.push(mul)
    }
    const add = new AddNode(-1, j, row_of_mul)
    add.delay = j*10+N*10
    typical_add_nodes.push(add)
    all_updatables.push(add)
  }

}


createFFT([2, 2, 2])

