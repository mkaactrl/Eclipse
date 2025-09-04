class EclipseNumbers {
    constructor() {
        this.vars = {};
        this.prev = null;
    }

    // ---------------- ASSIGN ----------------
    ec_as(target, value) {
        this.vars[target] = value;
        this.prev = value;
        return value;
    }

    // ---------------- s.n: EVAL ----------------
    eval_sn(expr) {
        // replace (p) with previous value
        if (expr.includes('(p)')) {
            expr = expr.replace(/\(p\)/g, this.prev || '0');
        }

        // replace s.n:(value) with numeric values
        expr = expr.replace(/s\.n:\((.*?)\)/g, (_, num) => Number(num));

        // evaluate basic math: + - * /
        try {
            const result = eval(expr); // only safe for numbers
            this.prev = result;
            return result;
        } catch (e) {
            return expr; // fallback if eval fails
        }
    }
}

// ---------------- Example Usage ----------------
const e = new EclipseNumbers();

// simple number assignment
e.ec_as('a', e.eval_sn('s.n:(5)'));       // 5
e.ec_as('b', e.eval_sn('s.n:(3)'));       // 3

// math with previous
const sum = e.eval_sn('s.n:(5) + s.n:(3)');   // 8
const sumWithPrev = e.eval_sn('(p) + s.n:(2)'); // 10 (prev=8)

console.log(sum, sumWithPrev);  // 8 10
