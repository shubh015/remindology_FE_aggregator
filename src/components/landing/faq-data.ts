export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'What is Remindology?',
    a: 'Remindology is an AI-powered study tool that automatically transforms any study material — articles, textbook chapters, or notes — into concise summaries, structured revision notes, and practice MCQs. It is designed for students preparing for any exam, from Class 8–12 boards to UPSC, SSC, and more.',
  },
  {
    q: 'Which exams and subjects does Remindology support?',
    a: 'Remindology supports all text-based subjects and 21+ exam categories, including CBSE, ICSE, and state boards (Class 8–12), competitive entrances like UPSC CSE, SSC CGL, Banking PO. Because it works with any text input, it adapts to any subject regardless of board or exam type.',
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
    a: 'The AI generates notes and MCQs based on the content you provide. For standard textbooks, NCERT chapters, and reputable sources, the output is highly relevant and accurate. As with any AI tool, we recommend reviewing the generated content before using it as your sole study resource.',
  },
  {
    q: 'Can I use Remindology for Class 10 or Class 12 board exam preparation?',
    a: 'Absolutely. Remindology works with NCERT, CBSE, ICSE, and state board content across all subjects — Science, Social Science, History, Geography, Economics, and more. Simply paste a chapter or topic and get revision notes and practice questions instantly.',
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
