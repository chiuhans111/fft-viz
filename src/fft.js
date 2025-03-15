import { DynamicClock, DynamicIsland } from "./dynamicIsland";
const bg = document.getElementById('bg')

class SubMatrix {
    constructor(inputs, outputs, matrix, radices, j2dn, i2j2dn2) {
        this.inputs = inputs
        this.outputs = outputs
        this.matrix = matrix

        this.radices = radices
        this.j2dn = j2dn
        this.i2j2dn2 = i2j2dn2
        const n0 = matrix.length;
        this.n0 = n0
        this.childs = []
        this.n2 = 0;

        // Put the right matrix into the sub matrix
        if (this.radices.length > 0) {
            const n2 = radices[0];
            const n1 = Math.floor(n0 / n2);
            this.n2 = n2

            // The outter loop, loop through i2, j2



            for (let i2 = 0; i2 < n2; i2++) {
                let child_row = []
                for (let j2 = 0; j2 < n2; j2++) {


                    const s_inputs = []
                    const s_outputs = []
                    const s_matrix = [];

                    for (let i1 = 0; i1 < n1; i1++) {
                        let i = i1 + i2 * n1;
                        let j = i1 * n2 + j2;
                        s_inputs.push(inputs[j]);
                        s_outputs.push(outputs[i]);
                    }

                    // The inner loop, loop through i1, j1
                    for (let i1 = 0; i1 < n1; i1++) {
                        const row = [];
                        for (let j1 = 0; j1 < n1; j1++) {

                            // Push the corresponding matrix
                            let i = i1 + i2 * n1;
                            let j = j1 * n2 + j2;
                            row.push(matrix[i][j]);
                        }
                        s_matrix.push(row);
                    }
                    child_row.push(new SubMatrix(s_inputs, s_outputs, s_matrix, radices.slice(1), j2 / n0, i2 * j2 / n2))
                }
                this.childs.push(child_row)
            }
        }


        // Create wrappers

        this.i1j2dn_wrappers = []

        for (let i = 0; i < n0; i++) {
            if (j2dn * i == 0) {
                this.i1j2dn_wrappers.push(null)
                continue
            }

            this.i1j2dn_wrappers.push(new DynamicClock(0, 0, 0, 0, 4.65, 0))
            this.i1j2dn_wrappers[i].show.set(0)
            this.i1j2dn_wrappers[i].time_hand_fac.set(1)
            this.i1j2dn_wrappers[i].margin.set(0.65)

            for (let j = 0; j < n0; j++) {
                this.i1j2dn_wrappers[i].childs.push(matrix[i][j])
            }
        }

        this.i2j2dn2_wrapper = null
        if (i2j2dn2 != 0) {
            this.i2j2dn2_wrapper = new DynamicClock(1, 1, 1, 1, 5.5, 0)
            this.i2j2dn2_wrapper.show.set(0)
            this.i2j2dn2_wrapper.time_hand_fac.set(1)
            this.i2j2dn2_wrapper.margin.set(1.5)

            for (let i = 0; i < n0; i++) {
                for (let j = 0; j < n0; j++) {
                    this.i2j2dn2_wrapper.childs.push(matrix[i][j])
                }
            }
        }

        this.bg_wrapper = new DynamicIsland(1, 1, 1, 1, 5.6)
        this.bg_wrapper.margin.set(1.6)
        for (let i = 0; i < n0; i++) {
            for (let j = 0; j < n0; j++) {
                this.bg_wrapper.childs.push(matrix[i][j])
            }
        }
        this.bg_wrapper.path.setAttribute('fill', 'white')
        bg.appendChild(this.bg_wrapper.g)

        this.timeouts = []
    }

    update(delta_time) {
        const n0 = this.n0
        const n2 = this.n2
        for (let i = 0; i < n0; i++) {
            if (this.i1j2dn_wrappers[i] == null) continue
            this.i1j2dn_wrappers[i].update(delta_time)
        }
        if (this.i2j2dn2_wrapper != null)
            this.i2j2dn2_wrapper.update(delta_time)

        for (let i2 = 0; i2 < n2; i2++) {
            for (let j2 = 0; j2 < n2; j2++) {
                this.childs[i2][j2].update(delta_time)
            }
        }

        this.bg_wrapper.update(delta_time)
    }

    clear_state() {
        while (this.timeouts.length) {
            clearTimeout(this.timeouts.pop())
        }

        const n0 = this.n0
        const n2 = this.n2

        for (let i = 0; i < n0; i++) {
            if (this.i1j2dn_wrappers[i] == null) continue
            this.i1j2dn_wrappers[i].show.target = 0
        }

        if (this.i2j2dn2_wrapper != null) {
            this.i2j2dn2_wrapper.show.target = 0
        }

        for (let i2 = 0; i2 < n2; i2++) {
            for (let j2 = 0; j2 < n2; j2++) {
                this.childs[i2][j2].clear_state()
            }
        }

        this.bg_wrapper.show.target = 0
    }


    // This function put the matrix in the right position
    layout(layer, x0 = 0, y0 = 0, time_delay = 0, clear_state = true) {
        if (clear_state)
            this.clear_state()

        const n0 = this.n0


        const matrix = this.matrix
        const j2dn = this.j2dn
        const i2j2dn2 = this.i2j2dn2

        if (layer > 0) {
            // if this is not the last layer, we continue to expand the child
            const n2 = this.n2
            let y1 = y0
            let size = 0
            for (let i2 = 0; i2 < n2; i2++) {
                let x1 = x0;
                for (let j2 = 0; j2 < n2; j2++) {
                    size = this.childs[i2][j2].layout(layer - 1, x1, y1, time_delay + i2 * 100, false)
                    x1 += size
                }
                y1 += size
            }
            return this.n2 * size

        } else {
            this.bg_wrapper.show.target = 1

            // expand this layer
            const n0 = this.n0
            const size = n0 - 1

            for (let i = 0; i < n0; i++) {
                this.timeouts.push(setTimeout(() => {
                    this.inputs[i].x.target = i * 10 + x0;
                    this.outputs[i].y.target = i * 10 + y0;
                }, time_delay += i * 10));
            }

            for (let i = 0; i < n0; i++) {
                for (let j = 0; j < n0; j++) {
                    this.timeouts.push(setTimeout(() => {
                        matrix[i][j].x.target = j * 10 + x0;
                        matrix[i][j].y.target = i * 10 + y0;
                        matrix[i][j].time.target = i * j / n0 + j2dn * i + i2j2dn2;
                    }, time_delay += 10));
                }
            }

            let any_animation_before = false
            // apply i1j2dn_wrappers
            for (let i = 0; i < n0; i++) {
                if (this.i1j2dn_wrappers[i] != null) {
                    this.timeouts.push(setTimeout(() => {
                        this.i1j2dn_wrappers[i].time_hand_fac.set(1)
                        this.i1j2dn_wrappers[i].time.set(0)
                        this.i1j2dn_wrappers[i].show.target = 1
                    }, time_delay));
                    time_delay += 200
                    any_animation_before = true
                }

                this.timeouts.push(setTimeout(() => {
                    if (this.i1j2dn_wrappers[i] != null) {
                        this.i1j2dn_wrappers[i].time.target = - j2dn * i
                    }
                    for (let j = 0; j < n0; j++) {
                        matrix[i][j].time.target = i * j / n0 + i2j2dn2;
                    }
                }, time_delay + 500));
            }

            // apply i2j2dn2_wrapper
            if (any_animation_before)
                time_delay += 600

            if (this.i2j2dn2_wrapper != null) {
                this.timeouts.push(setTimeout(() => {
                    this.i2j2dn2_wrapper.time.set(0)
                    this.i2j2dn2_wrapper.show.target = 1
                    this.i2j2dn2_wrapper.time_hand_fac.set(1)
                }, time_delay));
                time_delay += 500
            }

            this.timeouts.push(setTimeout(() => {
                if (this.i2j2dn2_wrapper != null) {
                    this.i2j2dn2_wrapper.time.target = - i2j2dn2
                }
                for (let i = 0; i < n0; i++) {
                    for (let j = 0; j < n0; j++) {
                        matrix[i][j].time.target = i * j / n0;
                    }
                }
            }, time_delay));

            return n0 * 10 + 3
        }
    }
}


class FFTMatrix {
    constructor(radices) {
        this.radices = radices;
        this.N = radices.reduce((acc, radix) => acc * radix, 1);

        this.inputs = [];
        this.outputs = [];
        this.matrix = [];

        this._initializeMatrix();
        this.sub_matrix = new SubMatrix(this.inputs, this.outputs, this.matrix, this.radices, 0, 0)

        this.sub_matrix.layout(0)
    }

    _initializeMatrix() {
        for (let i = 0; i < this.N; i++) {
            const input_island = new DynamicIsland(i, -12, 8, 8, 10);
            this.inputs.push(input_island);
            input_island.text.textContent = i;

            const output_island = new DynamicIsland(-12, i, 8, 8, 10);
            this.outputs.push(output_island);
            output_island.text.textContent = i;
        }

        for (let i = 0; i < this.N; i++) {
            const row = [];
            for (let j = 0; j < this.N; j++) {
                const matrix_vars = new DynamicClock(j, i, 8, 8, 8, i * j / this.N);
                matrix_vars.interactible((i*j)%this.N)
                row.push(matrix_vars);
            }
            this.matrix.push(row);
        }
    }

    // layout_update() {
    //     for (let i = 0; i < this.N; i++) {
    //         this.inputs[i].x.target = this.matrix[0][i].x.target
    //         this.outputs[i].y.target = this.matrix[i][0].y.target
    //     }
    // }

    update(delta_time) {
        for (let o of this.inputs) o.update(delta_time)
        for (let o of this.outputs) o.update(delta_time)
        for (let m of this.matrix) for (let o of m) o.update(delta_time)
        this.sub_matrix.update(delta_time)
    }
}


export { FFTMatrix }