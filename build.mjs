import fs from 'fs';
// 'csv' is an umbrella for four packages, of which csv-parse is one https://csv.js.org/project/getting-started/
import csvParseSync from 'csv-parse/lib/sync.js';

import { connect } from './index.mjs';

const source= 'input';
const input = `CSV/${source}.csv`;

const importCsv = async (filename, db)=> {
  const content = fs.readFileSync(filename);
  const records = csvParseSync(content);
  return records  
}

const db = await connect();
const records = await importCsv(input, db)
console.log(records);

db.close();