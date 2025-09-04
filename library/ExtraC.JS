class EclipseExtras {
    constructor() {
        this.vars = {};   // store variables
        this.prev = null; // track previous value
    }

    // ---------------- WAIT ----------------
    async w(seconds) {
        // pauses execution for seconds
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // ---------------- PROBE ----------------
    ec_p(target) {
        // check if variable exists or has a value
        if (this.vars.hasOwnProperty(target)) {
            return true;
        } else {
            return false;
        }
    }

    // ---------------- DOUBLE-HANDED MULTI ----------------
    dh_m(...values) {
        // combines multiple values recursively and updates prev
        let combined = '';
        for (let v of values) {
            if (Array.isArray(v)) {
                combined += this.dh_m(...v);
            } else {
                combined += v;
            }
        }
        this.prev = combined;
        return combined;
    }

    // ---------------- ASSIGN ----------------
    ec_as(target, value) {
        this.vars[target] = value;
        this.prev = value;
        return value;
    }
}

// ---------------- Example Usage ----------------
(async () => {
    const e = new EclipseExtras();

    // Assign some variables
    e.ec_as('x', 'Hello');
    e.ec_as('y', 'World');

    // Probe
    console.log(e.ec_p('x')); // true
    console.log(e.ec_p('z')); // false

    // Double-handed multi
    const dhmResult = e.dh_m('a', 'b', ['c','d'], 'e');
    console.log(dhmResult); // 'abcde'

    // Wait
    console.log('Waiting 2 seconds...');
    await e.w(2);
    console.log('Done waiting!');
})();
