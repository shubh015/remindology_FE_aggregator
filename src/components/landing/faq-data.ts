export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'What is Remindology?',
    a: 'Remindology is an AI-powered study tool that automatically transforms any study material — articles, textbook chapters, or notes — into concise summaries, structured revision notes, and practice MCQs. It is currently built for students preparing for UPSC CSE, SSC (CGL, CHSL, and related), and State PSC examinations, with K-12 boards and more exams actively in development.',
  },
  {
    q: 'Which exams does Remindology currently support?',
    a: 'Remindology currently supports three government exam families: UPSC CSE (and related UPSC exams), SSC (CGL, CHSL, CPO, and variants), and State PSCs. Support for CBSE/ICSE K-12 boards, JEE, NEET, Banking (IBPS/SBI PO), GATE, and CA exams is on our roadmap — we\'re building these out next.',
  },
  {
    q: 'How does Remindology generate summaries, notes, and MCQs?',
    a: "Once you paste study material, Remindology's AI reads and analyses the content to identify key concepts, important facts, and exam-relevant information. It then generates a concise summary, structured bullet-point revision notes, multiple-choice practice questions with correct answers highlighted, and a list of key topics — all in under 10 seconds.",
  },
  {
    q: 'Is Remindology free to use?',
    a: 'Yes. Remindology offers a free tier with no credit card required. You can upload study material and generate summaries, revision notes, and MCQs immediately after signing up.',
  },
  {
    q: 'How accurate are the AI-generated notes and MCQs?',
    a: 'The AI generates notes and MCQs based strictly on the content you provide. For standard textbooks, NCERT chapters, and reputable sources the output is highly relevant and accurate. As with any AI tool, we recommend reviewing the generated content — especially for MCQs — before using it as your sole study resource.',
  },
  {
    q: 'Will Remindology support Class 10 and Class 12 board exam preparation?',
    a: 'K-12 board support (CBSE, ICSE, and state boards) is one of our top priorities and is actively being built. Right now, Remindology is focused on government competitive exams — UPSC CSE, SSC, and State PSCs. Once K-12 launches, it will cover all major subjects: Science, Social Science, History, Geography, Economics, and more.',
  },
  {
    q: 'How long does it take to generate study materials?',
    a: 'Remindology typically analyses a standard document or article and generates all outputs — summary, revision notes, MCQs, and key topics — in under 10 seconds.',
  },
  {
    q: 'How is Remindology different from using ChatGPT?',
    a: "Unlike ChatGPT, Remindology is purpose-built for exam preparation. It generates a consistent set of study outputs in a structured format every time, without you needing to write prompts. All your materials are saved in a searchable dashboard, so you can build a revision library over time rather than losing results when you close a chat window.",
  },
];
