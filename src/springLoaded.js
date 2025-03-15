class SpringLoaded {
    constructor(value, mass = 1, spring = 1, damping_ratio = 1) {

        this.target = value
        this.value = value

        this.previous_value = value

        this.mass = mass
        this.spring = spring
        this.damping_ratio = damping_ratio

        this.acceleration = 0
        this.delay = 0

        this.solveEquation()
    }

    solveEquation(){
        // mx'' + bx' + kx = 0
        const m = this.mass
        const k = this.spring
        const b = Math.sqrt(4 * m * k) * this.damping_ratio
         
        this.l1 = -b / 2 / m
        this.l2 = Math.sqrt(Math.abs(this.l1 ** 2 - k / m))
        this.underdamp = b < Math.sqrt(4*m*k)

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

    update(delta_time = 16) {
        if (this.delay > 0)
            this.delay -= delta_time
        // delta_time can be in any unit 
        // as long as it's consistent with other definition used

        const [c1, c0] = this.getCoeff(delta_time)

        // find out the current velocity
        let x0 = this.previous_value - this.target - this.acceleration * delta_time
        this.previous_value = this.value
        let x1 = this.value - this.target
        let x2 = c1 * x1 - c0 * x0

        this.value = x2 + this.target 
        this.acceleration = 0
    }

    update_modulo(delta_time = 16, modulo = 1) {
        if (this.delay > 0)
            this.delay -= delta_time

        const [c1, c0] = this.getCoeff(delta_time)

        // find out the current velocity
        let x0 = this.previous_value - this.target - this.acceleration * delta_time
        this.previous_value = this.value
        let x1 = this.value - this.target

        while(x1 < -modulo/2){
            x1+=modulo
        }
        while(x1 > modulo/2){
            x1-=modulo
        }

        if (Math.abs(x1)>0.1){
            if(x1<0) x1+=modulo
        }

        while(x0-x1 < -modulo/2){
            x0+=modulo
        }
        while(x0-x1 > modulo/2){
            x0-=modulo
        }


        let x2 = c1 * x1 - c0 * x0

        this.value = x2 + this.target 
        this.acceleration = 0
    }
}


export { SpringLoaded }