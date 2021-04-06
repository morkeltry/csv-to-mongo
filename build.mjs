import fs from 'fs';
// 'csv' is an umbrella for four packages, of which csv-parse is one https://csv.js.org/project/getting-started/
import csvParseSync from 'csv-parse/lib/sync.js';

import { connect } from './index.mjs';

const source= 'input';
const input = `CSV/${source}.csv`;

// ignoreRows should be >= headerRows (but both are optional)
// filterOutliers is a function used for testing for outliers at the CSV import stage, which should populate some external state if its resultsa re to be retained
const importCsv = async (filename, db, options={} )=> {
  const { headerRows, ignoreRows, ignorelastRows=0, filterOutliers } = options;

  const content = fs.readFileSync(filename);
  const records = csvParseSync(content);
  const headers = records.splice(0,(ignoreRows || headerRows)).slice(0, headerRows)
  return {
    headers,
    records: records.slice(0, records.length-ignorelastRows)
  }
}

const db = await connect();
const { headers, records } = await importCsv(input, db,
  { 
  }
)

db.close();