const readline = require('readline');
const { EclipseRuntime } = require('./MainC.JS');
require('./ExtraC.JS');
require('./OtherC.JS');
require('./SN.JS');

const e = new EclipseRuntime();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Eclipse> '
});

rl.prompt();

rl.on('line', async (line) => {
    try {
        // wrap single lines in a <[]> container so line/dline are processed
        await e.process(`<[${line}]>`);
    } catch(err) {
        console.error('Error:', err);
    }
    rl.prompt();
}).on('close', () => {
    console.log('Bye!');
    process.exit(0);
});
