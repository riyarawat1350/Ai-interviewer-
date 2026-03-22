import mongoose from 'mongoose';
import config from './src/config/index.js';
import DailyQuestion from './src/models/DailyQuestion.js';

// Seeds today's date with 5 questions per category (static fallback)
const today = new Date().toISOString().split('T')[0];
const dates = [today];

const buildQuestions = (d) => ({
    date: d,
    categories: {
        communication: [
            { questionText: `What is active listening?`, options: [{id:"A", text:"Focusing only on the words"}, {id:"B", text:"Interrupting to clarify"}, {id:"C", text:"Giving full attention and understanding meanings"}, {id:"D", text:"Taking notes while talking"}], correctAnswer: "C", explanation: "Active listening involves fully concentrating, understanding, responding, and remembering what is said.", difficulty: "easy" },
            { questionText: `Which of the following best describes 'non-verbal communication'?`, options: [{id:"A", text:"Writing emails"}, {id:"B", text:"Body language, gestures, and facial expressions"}, {id:"C", text:"Talking on the phone"}, {id:"D", text:"Sending text messages"}], correctAnswer: "B", explanation: "Non-verbal communication includes body language, gestures, facial expressions, and eye contact.", difficulty: "easy" },
            { questionText: `What is the most effective way to handle a misunderstanding in a professional setting?`, options: [{id:"A", text:"Ignore it and move on"}, {id:"B", text:"Address it privately and calmly with the person involved"}, {id:"C", text:"Send a group email about it"}, {id:"D", text:"Complain to your manager immediately"}], correctAnswer: "B", explanation: "Addressing misunderstandings privately and calmly helps resolve issues professionally and preserves relationships.", difficulty: "medium" },
            { questionText: `Which communication style is typically most effective in a workplace?`, options: [{id:"A", text:"Passive"}, {id:"B", text:"Aggressive"}, {id:"C", text:"Assertive"}, {id:"D", text:"Passive-Aggressive"}], correctAnswer: "C", explanation: "Assertive communication is direct, honest, and respectful — the gold standard for professional environments.", difficulty: "medium" },
            { questionText: `In a presentation, what does 'signposting' mean?`, options: [{id:"A", text:"Using physical signs on stage"}, {id:"B", text:"Verbally guiding the audience through the structure of your talk"}, {id:"C", text:"Distributing printed materials"}, {id:"D", text:"Adding images to slides"}], correctAnswer: "B", explanation: "Signposting means using verbal cues to guide the audience (e.g., 'First...', 'Moving on to...', 'In conclusion...').", difficulty: "hard" }
        ],
        aptitude: [
            { questionText: `What is 25% of 200?`, options: [{id:"A", text:"40"}, {id:"B", text:"50"}, {id:"C", text:"60"}, {id:"D", text:"75"}], correctAnswer: "B", explanation: "25% of 200 = 200 × 0.25 = 50.", difficulty: "easy" },
            { questionText: `If a train travels 60 km in 45 minutes, what is its speed in km/h?`, options: [{id:"A", text:"70"}, {id:"B", text:"80"}, {id:"C", text:"75"}, {id:"D", text:"90"}], correctAnswer: "B", explanation: "Speed = Distance / Time = 60 / (45/60) = 60 × (60/45) = 80 km/h.", difficulty: "easy" },
            { questionText: `A sequence is: 2, 6, 12, 20, 30, __. What is the next number?`, options: [{id:"A", text:"40"}, {id:"B", text:"42"}, {id:"C", text:"44"}, {id:"D", text:"46"}], correctAnswer: "B", explanation: "The differences are 4, 6, 8, 10, 12... So 30 + 12 = 42.", difficulty: "medium" },
            { questionText: `If A is 2 ranks below B, and B is 3 ranks above C, what is A's rank relative to C?`, options: [{id:"A", text:"1 rank above C"}, {id:"B", text:"1 rank below C"}, {id:"C", text:"Same as C"}, {id:"D", text:"5 ranks above C"}], correctAnswer: "B", explanation: "B = C + 3, A = B - 2 = C + 3 - 2 = C + 1. So A is 1 rank above C.", difficulty: "medium" },
            { questionText: `A shopkeeper bought goods for ₹800 and sold them at a 25% profit. At what price were they sold?`, options: [{id:"A", text:"₹900"}, {id:"B", text:"₹950"}, {id:"C", text:"₹1000"}, {id:"D", text:"₹1100"}], correctAnswer: "C", explanation: "Selling Price = Cost × (1 + Profit%) = 800 × 1.25 = ₹1000.", difficulty: "hard" }
        ],
        generalKnowledge: [
            { questionText: `Which is the largest planet in our solar system?`, options: [{id:"A", text:"Earth"}, {id:"B", text:"Mars"}, {id:"C", text:"Jupiter"}, {id:"D", text:"Saturn"}], correctAnswer: "C", explanation: "Jupiter is the largest planet by both diameter and mass.", difficulty: "easy" },
            { questionText: `Who wrote the play 'Romeo and Juliet'?`, options: [{id:"A", text:"Charles Dickens"}, {id:"B", text:"William Shakespeare"}, {id:"C", text:"Jane Austen"}, {id:"D", text:"Mark Twain"}], correctAnswer: "B", explanation: "Romeo and Juliet was written by William Shakespeare around 1594–1596.", difficulty: "easy" },
            { questionText: `What is the capital of Australia?`, options: [{id:"A", text:"Sydney"}, {id:"B", text:"Melbourne"}, {id:"C", text:"Brisbane"}, {id:"D", text:"Canberra"}], correctAnswer: "D", explanation: "Canberra is the capital of Australia, chosen as a compromise between Sydney and Melbourne.", difficulty: "medium" },
            { questionText: `Which element has the chemical symbol 'Au'?`, options: [{id:"A", text:"Silver"}, {id:"B", text:"Aluminum"}, {id:"C", text:"Gold"}, {id:"D", text:"Argon"}], correctAnswer: "C", explanation: "'Au' comes from the Latin word 'Aurum', meaning gold.", difficulty: "medium" },
            { questionText: `The term 'GDP' stands for what in economics?`, options: [{id:"A", text:"Global Data Processing"}, {id:"B", text:"Gross Domestic Product"}, {id:"C", text:"General Development Plan"}, {id:"D", text:"Growth and Development Percentage"}], correctAnswer: "B", explanation: "GDP (Gross Domestic Product) measures the total monetary value of all goods and services produced in a country.", difficulty: "hard" }
        ]
    },
    generatedAt: new Date(),
    isActive: true
});

async function seed() {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB:', config.mongodb.uri.split('/').pop().split('?')[0]);

    for (const d of dates) {
        await DailyQuestion.deleteMany({ date: d });
        await DailyQuestion.create(buildQuestions(d));
        console.log(`✅ Seeded 5 questions per category for ${d}`);
    }

    await mongoose.disconnect();
    console.log('✅ Done!');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
