class EclipseRuntime {
    constructor() {
        this.vars = {};
        this.prev = null;
    }

    // ---------------- WAIT ----------------
    async w(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // ---------------- ASSIGN ----------------
    ec_as(target, value) {
        this.vars[target] = value;
        this.prev = value;
        return value;
    }

    // ---------------- PROBE ----------------
    ec_p(target) {
        return this.vars.hasOwnProperty(target);
    }

    // ---------------- DOUBLE-HANDED ----------------
    d_dh(val1, val2) {
        const combined = val1 + val2;
        this.prev = combined;
        return combined;
    }

    // ---------------- DOUBLE-HANDED MULTI ----------------
    dh_m(...values) {
        let combined = '';
        for (let v of values) {
            if (Array.isArray(v)) combined += this.dh_m(...v);
            else combined += v;
        }
        this.prev = combined;
        return combined;
    }

    // ---------------- s.n: EVAL ----------------
    eval_sn(expr) {
        if (expr.includes('(p)')) expr = expr.replace(/\(p\)/g, this.prev || '0');
        expr = expr.replace(/s\.n:\((.*?)\)/g, (_, num) => Number(num));
        try { 
            const result = eval(expr);
            this.prev = result;
            return result;
        } catch(e) { return expr; }
    }

    // ---------------- LINE OUTPUT ----------------
    line(text) {
        console.log(text);
    }

    dline(text) {
        console.debug(text);
    }

    // ---------------- PROCESS CONTAINERS ----------------
    async process(code) {
        // handle <[]> and <()>
        const containerMatch = code.match(/<\[(.*)\]>/s);
        if (containerMatch) return await this.processContainer(containerMatch[1]);

        const subMatch = code.match(/<\((.*)\)>/s);
        if (subMatch) return await this.processContainer(subMatch[1]);

        return [code];
    }

    async processContainer(inner) {
        const results = [];
        const parts = inner.split(/,(?![^(]*\))/); // split by commas, not inside parentheses

        for (let part of parts) {
            part = part.trim();
            if (!part) continue;

            // Nested container
            if (part.includes('<[]>') || part.includes('<()>')) {
                results.push(...await this.process(part));
                continue;
            }

            // var.new assignment
            let varMatch = part.match(/var\.new\("(.+?)"\)\s*=\s*(.+)/);
            if (varMatch) {
                const [, name, val] = varMatch;
                this.vars[name] = await this.evalValue(val);
                this.prev = this.vars[name];
                continue;
            }

            // n.str!= or append
            let appendMatch = part.match(/(.+)!?\s*=\s*<\[(.*)\]>/);
            if (appendMatch) {
                const [, name, val] = appendMatch;
                if (!this.vars[name]) this.vars[name] = '';
                this.vars[name] += await this.evalValue(val);
                this.prev = this.vars[name];
                continue;
            }

            // line output
            let lineMatch = part.match(/<line:(.+)>/);
            if (lineMatch) {
                this.line(lineMatch[1]);
                continue;
            }

            let dlineMatch = part.match(/<dline:(.+)>/);
            if (dlineMatch) {
                this.dline(dlineMatch[1]);
                continue;
            }

            results.push(await this.evalValue(part));
        }

        return results;
    }

    async evalValue(val) {
        val = val.trim();
        if (val.includes('(p)')) val = val.replace(/\(p\)/g, this.prev || '0');
        val = val.replace(/s\.n:\((.*?)\)/g, (_, num) => Number(num));

        // handle simple DH / DHM expressions
        if (val.includes('d.dh')) {
            const match = val.match(/d\.dh\((.*?),(.*?)\)/);
            if (match) return this.d_dh(await this.evalValue(match[1]), await this.evalValue(match[2]));
        }

        if (val.includes('dh.m')) {
            const match = val.match(/dh\.m\((.*?)\)/);
             if (match) {
                const args = match[1].split(',').map(v => v.trim());
                return this.dh_m(...args);
            }
        }

        // remove quotes if string
        val = val.replace(/^"(.*)"$/, '$1');

        // fallback number or string
        if (!isNaN(val)) return Number(val);
        return val;
    }
}
// export the class for REPL usage
module.exports = { EclipseRuntime };

// ---------------- Example Usage ----------------
if (require.main === module) {
    (async () => {
        const e = new EclipseRuntime();
        await e.process(`<[
            var.new("x")="Hello",
            var.new("y")="World",
            n.str!=<[(d.dh("a","b")), (dh.m("c","d","e"))]>,
            <line:x>,
            <line:y>,
            <line:n.str>,
            <dline:"Debug check">,
            n.str!=<[(d.dh("f","g"))]>,
            <line:n.str>,
            n.str!=<[(dh.m("h","i","j"))]>,
            <line:n.str>
        ]>`);
    })();
}
