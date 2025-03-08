
var ns = 'http://www.w3.org/2000/svg'


class Connection {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.N = 1
        this.segments = []
        this.progress = 0

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

        this.progress += (1-this.progress)*0.05

        for (let i = 0; i < this.N; i++) {
            const f1 = i/this.N * this.progress
            const f2 = (i+1)/this.N * this.progress
            
            const r = f1*(r2-r1)+r1
            const g = f1*(g2-g1)+g1
            const b = f1*(b2-b1)+b1

            this.segments[i].setAttributeNS(null, 'stroke', `rgb(${r} ${g} ${b})`)
            this.segments[i].setAttributeNS(null, 'stroke-width', 0.6)
            this.segments[i].setAttributeNS(null, 'stroke-linecap', 'round')
            // this.segments[i].setAttributeNS(null, 'style', 'filter: blur(0.05px); mix-blend-mode: darken')
            // this.segments[i].setAttributeNS(null, 'style', ' mix-blend-mode: ')
            this.segments[i].setAttributeNS(null, 'x1', f1*(this.x2-this.x1) + this.x1)
            this.segments[i].setAttributeNS(null, 'y1', f1*(this.y2-this.y1) + this.y1)
            this.segments[i].setAttributeNS(null, 'x2', f2*(this.x2-this.x1) + this.x1)
            this.segments[i].setAttributeNS(null, 'y2', f2*(this.y2-this.y1) + this.y1)

        }
    }
}


class BaseNode {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.r = 0.25
        this.draw_r = 0
        this.color = "black"
        this.s_body = document.createElementNS(ns, 'circle')
        this.svg = svg
        this.delay=0
        svg.appendChild(this.s_body)

        this.nodes = []
        this.connections = []
    }

    addConnection(node) {
        this.nodes.push(node)
        let connection = new Connection(node.x, node.y, this.x, this.y)
        this.connections.push(connection)
    }

    update() {
        if(this.delay>0){
            this.delay-=1
            return
        }
        this.draw_r += (this.r-this.draw_r)*0.3
        this.s_body.setAttributeNS(null, 'cx', this.x)
        this.s_body.setAttributeNS(null, 'cy', this.y)
        this.s_body.setAttributeNS(null, 'r', this.draw_r)
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


function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

function hslToRgb(h, s, l) {
    h = h%1
    let r, g, b;
  
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1/3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1/3);
    }
  
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  

class MultiplyNode extends BaseNode {
    constructor(x, y, node, phase) {
        super(x, y)
        this.color = 'rgb('+hslToRgb(phase, 0.7, 0.6).join(' ')+')'
        this.phase = phase
        this.draw_phase = 0
        this.addConnection(node)
        this.s_phase = document.createElementNS(ns, 'line')
        svg.appendChild(this.s_phase)
    }
    update() {
        this.draw_phase += ((this.phase - this.draw_phase+0.5)%1-0.5) * 0.05
        this.color = 'rgb('+hslToRgb(this.draw_phase, 0.7, 0.6).join(' ')+')'

        super.update()
        this.s_phase.setAttributeNS(null, 'stroke', `white`)
        this.s_phase.setAttributeNS(null, 'stroke-width', 0.05)
        this.s_phase.setAttributeNS(null, 'stroke-linecap', 'round')
        // this.s_phase.setAttributeNS(null, 'style', ' mix-blend-mode: darken')
        this.s_phase.setAttributeNS(null, 'x1', this.x)
        this.s_phase.setAttributeNS(null, 'y1', this.y)
        this.s_phase.setAttributeNS(null, 'x2', this.x + Math.cos(this.draw_phase*Math.PI*2) * this.draw_r*0.8)
        this.s_phase.setAttributeNS(null, 'y2', this.y + Math.sin(this.draw_phase*Math.PI*2) * this.draw_r*0.8)
    }
}



export { BaseNode, AddNode, MultiplyNode }