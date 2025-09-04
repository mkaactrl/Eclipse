class Eclipse {
    constructor() {
        this.vars = {};      // store var.new / variables
        this.prev = null;    // track previous value (p)
        console.log("Eclipselib Loaded"); // single startup message
    }

    run(code) {
        return this.process(code);
    }

    process(code) {
        const containerMatch = code.match(/<\[(.*)\]>/s);
        if (containerMatch) {
            return this.processContainer(containerMatch[1]);
        }

        const subMatch = code.match(/<\((.*)\)>/s);
        if (subMatch) {
            return this.processContainer(subMatch[1]);
        }

        return [code];
    }

    processContainer(inner) {
        const results = [];
        const parts = inner.split(/,(?![^(]*\))/);

        for (let part of parts) {
            part = part.trim();
            if (!part) continue;

            if (part.includes('<()>')) {
                results.push(...this.process(part));
                continue;
            }

            let varMatch = part.match(/var\.new\("(.+?)"\)\s*=\s*(.+)/);
            if (varMatch) {
                const [, name, val] = varMatch;
                this.vars[name] = this.evalValue(val);
                this.prev = this.vars[name];
                continue;
            }

            let appendMatch = part.match(/(.+)!?\s*=\s*<\[(.*)\]>/);
            if (appendMatch) {
                const [, name, val] = appendMatch;
                if (!this.vars[name]) this.vars[name] = '';
                this.vars[name] += this.evalValue(val);
                this.prev = this.vars[name];
                continue;
            }

            let lineMatch = part.match(/<line:(.+)>/);
            if (lineMatch) {
                this.evalValue(lineMatch[1]);
                continue;
            }

            results.push(this.evalValue(part));
        }

        return results;
    }

    evalValue(val) {
        val = val.trim();
        if (val.includes('(p)')) {
            val = val.replace(/\(p\)/g, this.prev || '0');
        }
        val = val.replace(/s\.n:\((.*?)\)/g, (_, num) => Number(num));
        val = val.replace(/^"(.*)"$/, '$1');
        return val;
    }
}

// ---------------- Example Usage ----------------
const e = new Eclipse();  // prints "Eclipselib Loaded"
e.run('<[var.new("day")="04", var.new("month")="09", var.new("year")="2025"]>');
