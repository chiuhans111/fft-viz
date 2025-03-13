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

        this.previous_value = value

        // mx'' + bx' + kx = 0
        this.m = m
        this.k = k
        this.b = b

        this.acceleration = 0
    }

    update(delta_time = 16) {
        // delta_time can be in any unit 
        // as long as it's consistent with other definition used

        // find out the current velocity
        let x1 = (this.value - this.previous_value) / delta_time + this.acceleration
        this.acceleration = 0
        this.previous_value = this.value
        let x0 = this.value - this.target


        // solve for: 
        let P = Math.atan2(x1 - this.l1 * x0, - this.l2 * x0)

        let A;
        if (Math.abs(Math.cos(P)) > 1e-10) {
            A = x0 / Math.cos(P);
        } else if (Math.abs(this.l1 * Math.cos(P) - this.l2 * Math.sin(P)) > 1e-10) {
            A = x1 / (this.l1 * Math.cos(P) - this.l2 * Math.sin(P));
        } else {
            A = this.A*0.5;
        }



        this.value = A * Math.exp(this.l1 * delta_time) * Math.cos(this.l2 * delta_time + P) + this.target

        this.A = A
        this.P = P
        this.x1 = x1
        this.x0 = x0
      
    }

    update_modulo(delta_time = 16, modulo = 1) {


        // find out the current velocity
        let x1 = (((this.value - this.previous_value + modulo * 10.5) % modulo) - modulo * 0.5) / delta_time + this.acceleration
        this.acceleration = 0
        this.previous_value = this.value
        let x0 = ((this.value - this.target + modulo * 10.5) % modulo) - modulo * 0.5

        

        // solve for: 
        let P = Math.atan2(x1 - this.l1 * x0, - this.l2 * x0)
        
        let A = x0 / Math.cos(P)

        if(!Number.isFinite(A)) {
            A = x1 / (this.l1 * Math.cos(P) - this.l2 * Math.sin(P))
            
        }

        if(!Number.isFinite(A)) A = this.A


        this.A = A
        this.P = P
        this.x1 = x1
        this.x0 = x0

        



        this.value = A * Math.exp(this.l1 * delta_time) * Math.cos(this.l2 * delta_time + P) + this.target
    }
}


export { SpringLoaded }