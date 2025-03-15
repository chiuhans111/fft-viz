import { squircle, squircleRevolve } from './squircle'
import { SpringLoaded } from './springLoaded'
import { hslToRgb } from './colors'

// Will create dynamic island directly on the global svg tag here:
const svg = document.querySelector('svg')
const ns = "http://www.w3.org/2000/svg"

class DynamicIsland {
    /**
     * Creates a dynamic island
     * @param {Number} x X coordinate
     * @param {Number} y Y coordinate
     * @param {Number} width Width
     * @param {Number} height Height
     * @param {Number} radius Border Radius
     */
    constructor(x, y, width, height, radius) {

        // Global group that contains all element in this island
        this.g = document.createElementNS(ns, 'g')
        this.g.style.willChange = 'transform'
        svg.append(this.g)

        // Main path for the island
        this.path = document.createElementNS(ns, 'path')
        this.path.setAttribute('fill', 'black')
        this.path.style.pointerEvents = 'none'
        this.g.append(this.path)

        // Text in the island
        this.text = document.createElementNS(ns, 'text')
        this.text.textContent = ''
        this.text.setAttribute('fill', 'white')
        this.text.setAttribute('font-family', 'inter')
        this.text.setAttribute('text-anchor', 'middle')
        this.text.setAttribute('font-size', '3')
        this.text.setAttribute('dominant-baseline', 'central')
        this.text.setAttribute('alignment-baseline', ' central')
        this.text.style.pointerEvents = 'none'
        this.g.append(this.text)
        
        // Create Spring loaded animation for position, size, etc...
        this.x = new SpringLoaded(x, 1, 1, 0.6)
        this.y = new SpringLoaded(y, 1, 1, 1)
        this.w = new SpringLoaded(width, 1, 1, 1)
        this.h = new SpringLoaded(height, 1, 1, 1)
        this.r = new SpringLoaded(radius, 1, 1, 1)

        // To show or hide the island
        this.show = new SpringLoaded(1, 1, 1, 1)

        // Initial value for the size
        this.w.value = 0
        this.h.value = 0
        this.show.value = 0

    
        // This island will change size and position to wrap around the childrens
        /** @type {DynamicIsland[]} */
        this.childs = []
        // The margin to use when wrap around the childrens (acts like padding)
        this.margin = new SpringLoaded(1, 1, 1, 1)
    }

    update(delta_time) {
        this.show.update(delta_time)
        
        if (this.childs.length) {
            let x_min = this.childs[0].x.value - this.childs[0].w.value / 2
            let x_max = this.childs[0].x.value + this.childs[0].w.value / 2
            let y_min = this.childs[0].y.value - this.childs[0].h.value / 2
            let y_max = this.childs[0].y.value + this.childs[0].h.value / 2

            for (let i = 1; i < this.childs.length; i++) {
                x_min = Math.min(x_min, this.childs[i].x.value - this.childs[0].w.value / 2)
                x_max = Math.max(x_max, this.childs[i].x.value + this.childs[0].w.value / 2)
                y_min = Math.min(y_min, this.childs[i].y.value - this.childs[0].h.value / 2)
                y_max = Math.max(y_max, this.childs[i].y.value + this.childs[0].h.value / 2)
            }

            this.x.set((x_min + x_max) / 2)
            this.y.set((y_min + y_max) / 2)
            this.w.set(x_max - x_min + this.margin.value * 2)
            this.h.set(y_max - y_min + this.margin.value * 2)
        } else {
            this.x.update(delta_time)
            this.y.update(delta_time)
            this.w.update(delta_time)
            this.h.update(delta_time)
            this.r.update(delta_time)
        }

        this.path.setAttribute('d', squircle(
            - this.w.value / 2,
            - this.h.value / 2,
            this.w.value, this.h.value,
            this.r.value))

        this.g.setAttribute('transform', `translate(${this.x.value.toFixed(2)}, ${this.y.value.toFixed(2)})`)

        this.g.setAttribute('opacity', this.show.value.toFixed(2))

        const text_rect = this.text.getBBox()
        // this.text.setAttribute('x', this.x.value.toFixed(2))
        // this.text.setAttribute('y', this.y.value.toFixed(2))
    }
}


class DynamicClock extends DynamicIsland {
    constructor(x, y, width, height, radius, time) {
        super(x, y, width, height, radius)

        this.time = new SpringLoaded(0, 1, 1, 0.8)

        this.time.target = time

        this.time_hand_g = document.createElementNS(ns, 'g')
        this.time_hand = document.createElementNS(ns, 'path')

        this.time_hand.setAttribute('fill', 'white')
        this.g.append(this.time_hand_g)
        this.time_hand_g.append(this.time_hand)

        // 0 for inside, 1 for outside
        this.time_hand_fac = new SpringLoaded(0, 1, 2, 0.7)


        this.time_hand.style.pointerEvents = 'none'
        this.interact = false
    }

    interactible(text) {
        let self = this
        this.interact = true
        this.text.textContent = text
        this.path.style.pointerEvents = ''


        this.path.addEventListener('mouseenter', function () {
            self.time_hand_fac.target = 1
        })

        this.path.addEventListener('mouseleave', function () {
            self.time_hand_fac.target = 0
        })

    }

    update(delta_time) {
        // Updates
        super.update(delta_time)
        this.time.update_modulo(delta_time)
        // this.time.target+=0.001
        this.time_hand_fac.update(delta_time)

        // Coordinate related compute
        const thickness = 0.5
        let time_f = ((this.time.value + 0.5) % 1) - 0.5
        // time_f = time_f * (1 - this.time_hand_fac.value) + (1 - time_f) * this.time_hand_fac.value
        time_f = 1 - time_f

        // const d = this.path.getTotalLength() * time_f
        // const point = this.path.getPointAtLength(d)

        const point = squircleRevolve(
            this.x.value - this.w.value / 2,
            this.y.value - this.h.value / 2,
            this.w.value, this.h.value,
            this.r.value, time_f)


        const l = Math.sqrt((point.x - this.x.value) ** 2 + (point.y - this.y.value) ** 2)
        const angle = Math.atan2(point.y - this.y.value, point.x - this.x.value)

        this.time_hand_g.setAttribute('transform', `rotate(${(angle * 180 / Math.PI).toFixed(2)})`)
        // this.time_hand_g.setAttribute('transform', `translate(${this.x.value.toFixed(2)}, ${this.y.value.toFixed(2)}) rotate(${(angle * 180 / Math.PI).toFixed(2)})`)


        // Apply svg parameters

        this.time_hand.setAttribute('d', squircle(
            l * this.time_hand_fac.value - thickness / 2,
            - thickness / 2,

            Math.max(thickness, (l - thickness) * (1 - this.time_hand_fac.value) + this.time_hand_fac.value * thickness),
            thickness,

            thickness
        ))

        const color = 'rgb(' + hslToRgb(this.time.value, 0.65, 0.55).join(',') + ')'
        // const color = 'black'
        this.path.setAttribute('fill', color)

        this.time_hand.setAttribute('stroke', color)
        this.time_hand.setAttribute('stroke-width', thickness * 2)
        this.time_hand.setAttribute('paint-order', 'stroke')
        // this.time_hand.setAttribute('opacity', this.show.value.toFixed(2))


        this.path.setAttribute('stroke-width', thickness * Math.max(0, this.time_hand_fac.value.toFixed(2)))
        this.path.setAttribute('stroke', color)
        this.path.setAttribute('fill-opacity', (1 - this.time_hand_fac.value).toFixed(2))

        if (this.interact) {
            this.text.setAttribute('fill', color)
            this.text.setAttribute('opacity', this.time_hand_fac.value.toFixed(2))
        }
    }
}



export { DynamicIsland, DynamicClock }