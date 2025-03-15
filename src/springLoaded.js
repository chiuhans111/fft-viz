class SpringLoaded {
    /**
     * Create spring loaded variable that can be animated
     * @param {Number} value Value of the variable
     * @param {Number} mass Mass
     * @param {Number} spring Spring
     * @param {Number} damping_ratio Damping, 1 = critical, <1: under, >1: over daming.
     */
    constructor(value, mass = 1, spring = 1, damping_ratio = 1) {
        // Target value to snap onto
        this.target = value

        // Current value
        this.value = value

        // Keep track of the last value so we can calcualte velocity
        this.previous_value = value

        // The mass, spring, damping parameter
        this.mass = mass
        this.spring = spring
        this.damping_ratio = damping_ratio

        // Additional acceleration
        this.acceleration = 0

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
        // calculates the coefficients to use in difference equation
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
        // delta_time can be in any unit 
        // as long as it's consistent with other definition used

        const [c1, c0] = this.getCoeff(delta_time)

        // Update the value using difference equation
        let x0 = this.previous_value - this.target - this.acceleration * delta_time
        this.previous_value = this.value
        let x1 = this.value - this.target
        let x2 = c1 * x1 - c0 * x0

        this.value = x2 + this.target 
        this.acceleration = 0
    }

    /**
     * Update for parameter that loops
     * @param {Number} delta_time delta time
     * @param {Number} modulo the module to use for updating parameter that loops
     */
    update_modulo(delta_time = 16, modulo = 1) {
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

        if (Math.abs(x1)>0.01){
            if(x1<0 && x1*x0<0) x1+=modulo
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