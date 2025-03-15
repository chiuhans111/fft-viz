import { DynamicIsland, DynamicClock } from './dynamicIsland';
import { FFTMatrix } from './fft';
import './style.scss'

let lastTime = 0


const fft = new FFTMatrix([2, 2, 2, 1])
const updatables = [fft]

function update(time) {
  requestAnimationFrame(update)
  let delta_time = (time - lastTime) / 100;
  delta_time = Math.min(delta_time, 0.1)
  lastTime = time;
  // main

  for (let d of updatables)
    d.update(delta_time)
}
requestAnimationFrame(update)


let i = 1
document.addEventListener('mousedown', function () {


  fft.sub_matrix.layout(i % fft.radices.length)
  // fft.layout_update()
  i = i + 1 % fft.radices.length

})
