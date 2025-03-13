import { DynamicIsland } from './dynamicIsland';
import './style.scss'

let lastTime = 0



let di = new DynamicIsland(0, 0, 50, 10)

di.path.addEventListener('mouseenter', function(){
  di.w.target = 100
  di.h.target = 100
})

di.path.addEventListener('mouseleave', function(){
  di.h.target = 10
  di.w.target = 50
})

function update(time) {
  requestAnimationFrame(update)
  let delta_time = time - lastTime;
  lastTime = time;
  // main
  di.update(delta_time/50)
}
requestAnimationFrame(update);
