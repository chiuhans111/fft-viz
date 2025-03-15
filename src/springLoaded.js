class SpringLoaded {
    constructor(value, mass = 1, spring = 1, damping_ratio = 0.99) {

        this.target = value
        this.value = value

        const m = mass
        const k = spring
        const b = Math.sqrt(4 * m * k) * damping_ratio
        // b should be < sqrt(4mk)

        this.l1 = -b / 2 / m
        this.l2 = Math.sqrt(Math.abs(this.l1 ** 2 - k / m))
        this.underdamp = b < Math.sqrt(4*m*k)

        this.previous_value = value

        // mx'' + bx' + kx = 0
        this.m = m
        this.k = k
        this.b = b

        this.acceleration = 0
        this.delay = 0

    }

    getCoeff(delta_time){
        if(this.underdamp){
            const c1 = Math.exp(this.l1 * delta_time) * Math.cos(this.l2 * delta_time) * 2
            const c0 = Math.exp(2*this.l1 * delta_time)
            return [c1, c0]
        }else{
            const c1 = Math.exp((this.l1+this.l2)*delta_time) + Math.exp((this.l1-this.l2)*delta_time)
            const c0 = Math.exp(2*this.l1 * delta_time)
            return [c1, c0]
        }
    }

    set(value) {
        // hard code the value
        this.value = value
        this.target = value
        this.previous_value = value
    }

    solve(x0, x1) {
        x1 *= 0.98
        let P = Math.atan2(x1 - this.l1 * x0, - this.l2 * x0)

        let A;

        if (Math.abs(Math.cos(P)) > 1e-10) {
            A = x0 / Math.cos(P);
        } else if (Math.abs(this.l1 * Math.cos(P) - this.l2 * Math.sin(P)) > 1e-10) {
            A = x1 / (this.l1 * Math.cos(P) - this.l2 * Math.sin(P));
        } else {
            A = this.A 
        }

        this.A = A
        this.P = P
        this.x1 = x1
        this.x0 = x0

        return { A, P }
    }

    update(delta_time = 16) {
        if (this.delay > 0)
            this.delay -= delta_time
        // delta_time can be in any unit 
        // as long as it's consistent with other definition used

        // find out the current velocity
        let x1 = (this.value - this.previous_value) / delta_time + this.acceleration
        this.acceleration = 0
        this.previous_value = this.value
        let x0 = this.value - this.target

        if (this.delay > 0) x0 = 0

        // solve for: 

        const { A, P } = this.solve(x0, x1)


        this.value = A * Math.exp(this.l1 * delta_time) * Math.cos(this.l2 * delta_time + P) + this.target
    }

    update_modulo(delta_time = 16, modulo = 1) {
        if (this.delay > 0)
            this.delay -= delta_time


        // find out the current velocity
        let x1 = (((this.value - this.previous_value + modulo * 10.5) % modulo) - modulo * 0.5) / delta_time + this.acceleration
        this.acceleration = 0
        this.previous_value = this.value
        // let x0 = ((this.value - this.target + modulo * 10.5) % modulo) - modulo * 0.5
        let x0 = this.value - this.target
        let x0_ = ((x0 + modulo * 10.5) % modulo) - modulo * 0.5

        if (Math.abs(x0_) < 1e-3) {
            x0 = x0_
        }
        if (this.delay > 0) x0 = 0

        // solve for: 
        const { A, P } = this.solve(x0, x1)


        this.value = A * Math.exp(this.l1 * delta_time) * Math.cos(this.l2 * delta_time + P) + this.target
    }
}


export { SpringLoaded }