import { hslToRgb } from "./colors"

var ns = 'http://www.w3.org/2000/svg'


class Connection {
    constructor(node1, node2) {
        this.node1 = node1
        this.node2 = node2

        this.N = 1
        this.segments = []
        this.progress = 1

        const bg = svg.getElementById('bg')
        for (let i = 0; i < this.N; i++) {
            let s_line = document.createElementNS(ns, 'line')
            this.segments.push(s_line)
            bg.appendChild(s_line)
        }
    }

    update() {
        const r1 = 230
        const g1 = 230
        const b1 = 230

        const r2 = 250
        const g2 = 250
        const b2 = 250

        const x1 = this.node1.state.x
        const x2 = this.node2.state.x
        const y1 = this.node1.state.y
        const y2 = this.node2.state.y

        for (let i = 0; i < this.N; i++) {
            const f1 = i / this.N * this.progress
            const f2 = (i + 1) / this.N * this.progress

            const r = f1 * (r2 - r1) + r1
            const g = f1 * (g2 - g1) + g1
            const b = f1 * (b2 - b1) + b1

            this.segments[i].setAttributeNS(null, 'stroke', `rgb(${r} ${g} ${b})`)
            this.segments[i].setAttributeNS(null, 'stroke-width', 0.6)
            this.segments[i].setAttributeNS(null, 'stroke-linecap', 'round')
            // this.segments[i].setAttributeNS(null, 'style', 'filter: blur(0.05px); mix-blend-mode: darken')
            // this.segments[i].setAttributeNS(null, 'style', ' mix-blend-mode: ')
            this.segments[i].setAttributeNS(null, 'x1', f1 * (x2 - x1) + x1)
            this.segments[i].setAttributeNS(null, 'y1', f1 * (y2 - y1) + y1)
            this.segments[i].setAttributeNS(null, 'x2', f2 * (x2 - x1) + x1)
            this.segments[i].setAttributeNS(null, 'y2', f2 * (y2 - y1) + y1)

        }
    }
}

class Stateful{
    constructor(state){
        this.state = state
    }

    update(){
        // to be overrided
    }

    getState(){
        // to be implemented
    }

    setState(state){
        // to be implemented
    }
}

class BaseNode extends Stateful{
    constructor(x, y) {
        super({
            x, y, r: 0.25,
        })

        this.color = "black"
        this.s_body = document.createElementNS(ns, 'circle')
        svg.appendChild(this.s_body)

        this.nodes = []
        this.connections = []
    }

    addConnection(node) {
        this.nodes.push(node)
        let connection = new Connection(node, this)
        this.connections.push(connection)
    }

    update() {
        this.s_body.setAttributeNS(null, 'cx', this.state.x)
        this.s_body.setAttributeNS(null, 'cy', this.state.y)
        this.s_body.setAttributeNS(null, 'r', this.state.r)
        this.s_body.setAttributeNS(null, 'fill', this.color)

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            this.connections[i].update(node.x, node.y, this.x, this.y)
        }
    }
}

class AddNode extends BaseNode {
    constructor(x, y, nodes) {
        super(x, y)
        this.s_connections = []
        for (let i = 0; i < nodes.length; i++) {
            this.addConnection(nodes[i])
        }
    }

    update() {
        super.update()
    }
}




class MultiplyNode extends BaseNode {
    constructor(x, y, node, phase) {
        super(x, y)
        this.color = 'rgb(' + hslToRgb(phase, 0.7, 0.6).join(' ') + ')'
        this.state.phase = phase
        this.state.color = hslToRgb(phase, 0.7, 0.6)
        this.addConnection(node)
        this.s_phase = document.createElementNS(ns, 'line')
        svg.appendChild(this.s_phase)
    }
    update() {
        this.color = 'rgb(' + this.state.color.join(' ') + ')'
        super.update()
        this.s_phase.setAttributeNS(null, 'stroke', `white`)
        this.s_phase.setAttributeNS(null, 'stroke-width', 0.05)
        this.s_phase.setAttributeNS(null, 'stroke-linecap', 'round')
        // this.s_phase.setAttributeNS(null, 'style', ' mix-blend-mode: darken')
        this.s_phase.setAttributeNS(null, 'x1', this.x)
        this.s_phase.setAttributeNS(null, 'y1', this.y)
        this.s_phase.setAttributeNS(null, 'x2', this.x + Math.cos(this.phase * Math.PI * 2) * this.r * 0.8)
        this.s_phase.setAttributeNS(null, 'y2', this.y + Math.sin(this.phase * Math.PI * 2) * this.r * 0.8)
    }
}

class GroupNode extends Stateful{
    constructor(nodes) {
        super({
            
        })
        this.nodes = nodes
    }

    update() {
        this.color = 'rgb(' + this.state.color.join(' ') + ')'
        super.update()
        this.s_phase.setAttributeNS(null, 'stroke', `white`)
        this.s_phase.setAttributeNS(null, 'stroke-width', 0.05)
        this.s_phase.setAttributeNS(null, 'stroke-linecap', 'round')
        // this.s_phase.setAttributeNS(null, 'style', ' mix-blend-mode: darken')
        this.s_phase.setAttributeNS(null, 'x1', this.x)
        this.s_phase.setAttributeNS(null, 'y1', this.y)
        this.s_phase.setAttributeNS(null, 'x2', this.x + Math.cos(this.phase * Math.PI * 2) * this.r * 0.8)
        this.s_phase.setAttributeNS(null, 'y2', this.y + Math.sin(this.phase * Math.PI * 2) * this.r * 0.8)
    }
}


export { BaseNode, AddNode, MultiplyNode }