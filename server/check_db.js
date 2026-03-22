import mongoose from 'mongoose';
import config from './src/config/index.js';
import DailyQuestion from './src/models/DailyQuestion.js';

async function check() {
    await mongoose.connect(config.mongodb.uri);
    const today = new Date().toISOString().split('T')[0];
    const question = await DailyQuestion.findOne({ date: today });
    if (question) {
        console.log('FOUND:', question.date);
    } else {
        console.log('NOT FOUND');
    }
    await mongoose.disconnect();
}
check();
