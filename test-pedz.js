const fs = require('fs');
eval(fs.readFileSync('modules/bsa.js', 'utf8'));
eval(fs.readFileSync('modules/pedz-bsa.js', 'utf8'));
eval(fs.readFileSync('modules/pedz-zscore.js', 'utf8'));
window = { lang: { convert: function(s) { return s; } } };
eval(fs.readFileSync('modules/pedz-common.js', 'utf8'));
eval(fs.readFileSync('modules/pedz-mmode.js', 'utf8'));

try {
  let obj = new peterssenMpa(1.0, 15, 100);
  console.log('Peterssen BSA:', obj.bsa);
  console.log('Peterssen MeanRaw:', obj.getValueFromZ(0));
} catch(e) {
  console.log('Peterssen error:', e);
}

try {
  let kObj = new kampmannRvdd(1.0, 15, 100);
  console.log('Kampmann BSA:', kObj.bsa);
  console.log('Kampmann MeanRaw:', kObj.getValueFromZ(0));
} catch(e) {
  console.log('Kampmann error:', e);
}
