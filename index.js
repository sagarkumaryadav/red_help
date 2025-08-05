const fs = require('fs');
const path = require('path');
const { allocateDiscount } = require('./allocator');

(async () => {
  const inputList = JSON.parse(fs.readFileSync('./data/sample-input.json', 'utf-8'));

  for (let i = 0; i < inputList.length; i++) {
    const input = inputList[i];
    const result = await allocateDiscount(input.siteKitty, input.salesAgents);

    const filename = `case-${i + 1}-${input.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    const filePath = path.join(__dirname, 'output', filename);

    fs.writeFileSync(filePath, JSON.stringify({ title: input.title, allocations: result }, null, 2));
    console.log(` ${input.title} => written to output/${filename}`);
  }
})();
