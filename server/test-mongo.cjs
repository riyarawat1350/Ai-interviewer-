const mongoose = require('mongoose');
const uri = 'mongodb://Anmol:anmol4328@ac-gulklf0-shard-00-00.2fi6kaz.mongodb.net:27017,ac-gulklf0-shard-00-01.2fi6kaz.mongodb.net:27017,ac-gulklf0-shard-00-02.2fi6kaz.mongodb.net:27017/deforestation?ssl=true&replicaSet=atlas-qs4fl8-shard-0&authSource=admin&retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully!");
    process.exit(0);
  } catch (err) {
    console.error("CONNECTION ERROR DETAILS:");
    console.error(err);
    process.exit(1);
  }
}
run();
