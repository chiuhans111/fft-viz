import { squircle } from './squircle'
import { SpringLoaded } from './springLoaded'

const svg = document.querySelector('svg')
const ns = "http://www.w3.org/2000/svg"


class DynamicIsland {
    constructor(x, y, width, height) {
        this.path = document.createElementNS(ns, 'path')
        this.path.setAttribute('shape-rendering', 'geometricPrecision')
        this.path.setAttribute('fill', 'gray')

        svg.append(this.path)

        this.x = new SpringLoaded(x, 1, 1, 0.7)
        this.y = new SpringLoaded(y, 1, 1, 0.7)
        this.w = new SpringLoaded(width, 1, 1, 0.5)
        this.h = new SpringLoaded(height, 1, 1, 0.99)
        this.r = new SpringLoaded(10, 1, 1, 0.99)
    }

    update(delta_time) {
        this.x.update(delta_time)
        this.y.update(delta_time)
        this.w.update(delta_time)
        this.h.update(delta_time)
        this.r.update(delta_time)
        this.path.setAttribute('d', squircle(
            this.x.value - this.w.value / 2,
             this.y.value - this.h.value / 2, 
             this.w.value, this.h.value, 
             this.r.value))
    }
}


export {DynamicIsland}