import { squircle } from './squircle'
import { SpringLoaded } from './springLoaded'
import { hslToRgb } from './colors'

const svg = document.querySelector('svg')
const ns = "http://www.w3.org/2000/svg"

class DynamicIsland {
    constructor(x, y, width, height, radius) {
        this.path = document.createElementNS(ns, 'path')
        this.path.setAttribute('shape-rendering', 'geometricPrecision')
        this.path.setAttribute('fill', 'black')
        svg.append(this.path)

        this.text = document.createElementNS(ns, 'text')
        this.text.textContent = ''
        this.text.setAttribute('fill', 'white')
        this.text.setAttribute('font-family', 'inter')
        this.text.setAttribute('text-anchor', 'middle')
        this.text.setAttribute('font-size', '0.3')
        this.text.setAttribute('dominant-baseline', 'central')
        this.text.setAttribute('alignment-baseline', ' central')
        svg.append(this.text)


        this.x = new SpringLoaded(x, 1, 1, 0.99)
        this.y = new SpringLoaded(y, 1, 1, 0.99)
        this.w = new SpringLoaded(width, 1, 1, 0.9999)
        this.h = new SpringLoaded(height, 1, 1, 0.9999)
        this.r = new SpringLoaded(radius, 1, 1, 0.99)
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

        const text_rect = this.text.getBBox()
        this.text.setAttribute('x', this.x.value)
        this.text.setAttribute('y', this.y.value)
    }
}


class DynamicClock extends DynamicIsland {
    constructor(x, y, width, height, radius, time) {
        super(x, y, width, height, radius)

        this.time = new SpringLoaded(0, 1, 1, 0.999)
        this.time.target = time

        this.time_hand_g = document.createElementNS(ns, 'g')
        this.time_hand = document.createElementNS(ns, 'path')

        this.time_hand.setAttribute('fill', 'white')
        svg.append(this.time_hand_g)
        this.time_hand_g.append(this.time_hand)

        // 0 for inside, 1 for outside
        this.time_hand_fac = new SpringLoaded(0, 1, 1, 1.1)

        let self = this

        this.path.addEventListener('mouseenter', function(){
            self.time_hand_fac.target = 1
        })
        this.path.addEventListener('mouseleave', function(){
            self.time_hand_fac.target = 0
        })

        this.time_hand.style.pointerEvents = 'none'

    }

    update(delta_time) {
        super.update(delta_time)

        this.time.update_modulo(delta_time)
        this.time_hand_fac.update(delta_time)

        const thickness = 0.05

        const d = this.path.getTotalLength() * ((this.time.value+0.5)%1)

        const point = this.path.getPointAtLength(d)

        const l = Math.sqrt((point.x-this.x.value) ** 2 + (point.y-this.y.value) ** 2) 
        const angle = Math.atan2(point.y-this.y.value, point.x-this.x.value)

        this.time_hand_g.setAttribute('transform', `translate(${this.x.value}, ${this.y.value}) rotate(${angle*180/Math.PI})`)

        const color = 'rgb(' + hslToRgb(this.time.value, 0.6, 0.5).join(',') + ')'
        this.path.setAttribute('fill', color)
        this.time_hand.setAttribute('d', squircle(
            l * this.time_hand_fac.value - thickness / 2,
            - thickness / 2,

            l * (1 - this.time_hand_fac.value) + this.time_hand_fac.value*thickness,
            thickness,

            thickness
        ))

        this.time_hand.setAttribute('stroke', color)
        this.time_hand.setAttribute('stroke-width', thickness*2)
        this.time_hand.setAttribute('paint-order', 'stroke')


        this.path.setAttribute('stroke-width', thickness * Math.max(0, this.time_hand_fac.value))
        this.path.setAttribute('stroke', color)
        this.path.setAttribute('fill-opacity',1- this.time_hand_fac.value)


    }
}



export { DynamicIsland, DynamicClock }