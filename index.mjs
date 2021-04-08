import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;
import assert  from 'assert';

// const MongoClient = require('mongodb').MongoClient
// const assert = require('assert');

// Connection URLs
const urls = {
  local: 'mongodb://localhost:27017/myproject',
};

const urlsObj = {
  local: { ip: 'localhost', port: '27017', dbName: 'myproject' },
};

// Use connect method to connect to the server
const connect = async ({ url, location='local', ip, port, dbName }={} )=> {
  if (!url) {
    const defaultUrl = urlsObj[location];
    console.log(defaultUrl);
    url = `mongodb://${ip || defaultUrl.ip}:${port || defaultUrl.port}/${dbName || defaultUrl.dbName}`
  }
  console.log('Connecting to: ', url);

  const db = await new MongoClient(url).connect();
  console.log(`Connected successfully`);  
  
  return db;  
}

export { connect }

// Remember to start:
// mongod --dbpath data
