class EclipseOperators {
    constructor() {
        this.vars = {};
        this.prev = null;
    }

    // ---------------- ASSIGN ----------------
    ec_as(target, value) {
        // dynamic assignment
        this.vars[target] = value;
        this.prev = value;
        return value;
    }

    // ---------------- THUNDERCLAP ----------------
    ec_tc(codeArray) {
        // instantly executes all code in the array
        const results = [];
        for (let code of codeArray) {
            if (typeof code === 'function') {
                results.push(code());
            } else {
                results.push(code);
            }
        }
        return results;
    }

    // ---------------- DOUBLE-HANDED ----------------
    d_dh(val1, val2) {
        // combines two values and tracks previous
        const combined = val1 + val2;
        this.prev = combined;
        return combined;
    }

    // ---------------- DOUBLE-HANDED MULTI ----------------
    dh_m(...values) {
        // recursively combines multiple values
        let combined = '';
        for (let v of values) {
            combined += v;
        }
        this.prev = combined;
        return combined;
    }
}

// ---------------- Example Usage ----------------
const e = new EclipseOperators();

// ASSIGN
e.ec_as('x', 5);             // x = 5
e.ec_as('y', 10);            // y = 10

// DOUBLE-HANDED
const dhResult = e.d_dh(1, 2);           // 3
const dhmResult = e.dh_m('a', 'b', 'c'); // 'abc'

// THUNDERCLAP
const tcResult = e.ec_tc([
    () => e.ec_as('z', dhResult),
    () => e.ec_as('msg', dhmResult)
]);

console.log(e.vars);
