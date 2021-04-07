import fs from 'fs';
// 'csv' is an umbrella for four packages, of which csv-parse is one https://csv.js.org/project/getting-started/
import csvParseSync from 'csv-parse/lib/sync.js';

import { connect } from './index.mjs';

const source= 'input';
const collection= 'new collection';
const input = `CSV/${source}.csv`;

// toDocumentFactory creates a closure to reuse the headers
const toDocumentFactory = headers=> {
  // Boolean is fine to filter empty strings, since ""==false
  const test = Boolean;

  if (!headers)
    headers=new Array
      .from(20)
      .fill(undefined)
      .map((_,idx)=>idx);
  console.log('Using headers:', headers);
  
  const converters= headers.map(
    (header, idx)=> 
      (document, datum)=> { 
        if (test(datum)) document[header]=datum;
    });
  const convertRecord = data=>{
    const document={};
    headers.forEach((_, idx)=> converters[idx](document, data[idx]));
    return document
  }
  return convertRecord
}

const bundleFns = fns=>{
  // untested reduce - probably crazy ;)
  // intended to pass on all args passed to the bundled function and continue passing them, 
  // but on each subsequent call, replace only the first argument to the next function
  if (Array.isArray(fns))
    return (...args)=> {
      fns.reduce((accArgs, currFn, idx, [...args])=> {
        const result = currFn(...accArgs);
        if (result!==undefined)
          accArgs[0] = result;
        return accArgs
    })}
  else if (fns==='function')
    return fns
  else 
    return x=>x
}


// rather than importCsv, consider using:
// sudo apt install mongodb-tools && mongoimport -d mydb -c things --type csv --headerline --file CSV/my.csv

// ignoreRows should be >= headerRows (but both are optional)
// filterOutliers is a function used for testing for outliers at the CSV import stage, which should populate some external state if its resultsa re to be retained
const importCsv = async (filename, db, options={} )=> {
  const { headerRows, ignoreRows, ignorelastRows=0, filterOutliers } = options;
  const { recordProcessors, documentProcessors } = options;
  const preProcessRecord = bundleFns(recordProcessors);
  const preProcessDocument = bundleFns(documentProcessors);

  const content = fs.readFileSync(filename);
  const records = csvParseSync(content);
  const headers = records.splice(0,(ignoreRows || headerRows)).slice(0, headerRows)
  const toDocument = toDocumentFactory(headers[0]);
  
  let count=0;
  records
    .slice(0, records.length-ignorelastRows)
    // .map(preProcessRecord)
    .map(toDocument)
    .map(preProcessDocument)
    .forEach(console.log)

  return headers
}

const { headers, records } = await importCsv(input, db,
  { 
    headerRows: 1
  }
)

db.close();