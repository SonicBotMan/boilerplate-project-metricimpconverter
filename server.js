// Metric-Imperial Converter - FCC project
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

function convertNum(req, res, initNum, unit, returnUnit, val) {
  res.json({ initNum, initUnit, returnNum: val, returnUnit, string: `${initNum} ${spell(unit)[0]} converts to ${val} ${spell(unit)[1]}` });
}

const galToL = 3.78541, lbsToKg = 0.453592, miToKm = 1.60934;

app.get('/api/convert', (req, res) => {
  const input = req.query.input || '';
  const m = input.match(/^([0-9./]*)([a-zA-Z]*)$/);
  if (!m) return res.json({ error: 'invalid number and unit' });
  let [, numStr, unit] = m;
  let num;
  if (numStr === '') num = 1;
  else {
    try {
      if (numStr.includes('/')) {
        const parts = numStr.split('/');
        if (parts.length !== 2) throw new Error();
        const frac = parts.map(p => eval(p));
        if (frac.some(f => typeof f !== 'number' || isNaN(f))) throw new Error();
        num = frac[0] / frac[1];
      } else {
        num = parseFloat(numStr);
      }
    } catch (e) { return res.json({ error: 'invalid number' }); }
  }
  if (isNaN(num)) return res.json({ error: 'invalid number' });
  const units = { gal: ['gallons', 'L'], L: ['liters', 'gal'], mi: ['miles', 'km'], km: ['kilometers', 'mi'], lbs: ['pounds', 'kg'], kg: ['kilograms', 'lbs'] };
  unit = unit === 'l' ? 'L' : unit;
  if (!units[unit]) return res.json({ error: 'invalid unit' });
  const conv = { gal: [x => x * galToL, 'L'], L: [x => x / galToL, 'gal'], mi: [x => x * miToKm, 'km'], km: [x => x / miToKm, 'mi'], lbs: [x => x * lbsToKg, 'kg'], kg: [x => x / lbsToKg, 'lbs'] };
  const val = parseFloat(conv[unit][0](num).toFixed(5));
  res.json({ initNum: num, initUnit: unit, returnNum: val, returnUnit: conv[unit][1], string: `${num} ${units[unit][0]} converts to ${val} ${units[conv[unit][1]][0]}` });
});

const listener = app.listen(process.env.PORT || 3000, () => console.log('Listening'));
module.exports = app;
