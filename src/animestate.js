function lerpVal(val1, val2, f) {
    if (Array.isArray(val1) && Array.isArray(val2)) {
        const output = []
        for (let i = 0; i < val1.length && i < val2.length; i++) {
            output = lerpVal(val1[i], val2[i], f)
        }
        return output
    }
    return val1 * (1 - f) + val2 * f
}


function lerpState(state1, state2, f) {
    const state = {}
    for (let i in state1) state[i] = state1[i]
    for (let i in state2) {
        if (i in state) {
            state[i] = lerpVal(state[i], state2[i], f)
        } else {
            state[i] = state2[i]
        }
    }
    return state
}