const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const callGemini = async (prompt: string, apiKey: string) => {
  if (!apiKey) throw new Error("API key is missing");

  const content = prompt;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'user', content }
      ],
      temperature: 0.2,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit reached. Please wait 1-2 minutes and try again.");
    }
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to fetch from Groq API");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const extractSkills = async (jd: string, resumeText: string, apiKey: string): Promise<string[]> => {
  const prompt = `You are an expert technical recruiter. Based on the provided Job Description text and the candidate's Resume, extract a list of 5 key technical skills that are essential for the job and are present in the JD. Return ONLY a valid JSON array of strings (e.g., ["React", "TypeScript", "Node.js"]). Do not include markdown formatting or any other text.\n\nJob Description: ${jd}\n\nResume Content: ${resumeText}`;

  const responseText = await callGemini(prompt, apiKey);
  try {
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText).slice(0, 5);
  } catch (e) {
    console.error("Failed to parse skills from Gemini", responseText);
    return ['React', 'TypeScript', 'Node.js', 'System Design', 'REST APIs'];
  }
};

export const generateQuestion = async (jd: string, skill: string, apiKey: string): Promise<string> => {
  const prompt = `You are conducting a technical interview. The job description is: "${jd}". Generate a single, conversational interview question to assess the candidate's proficiency in "${skill}". The question should be answerable in 2-3 sentences — no coding required. Focus on concepts, experience, and understanding. Keep it friendly and conversational like a real interview. Return ONLY the question text, no surrounding quotes or extra text.`;
  const responseText = await callGemini(prompt, apiKey);
  return responseText.trim();
};

export const scoreAnswer = async (skill: string, question: string, answer: string, apiKey: string): Promise<{ score: number, reasoning: string }> => {
  const prompt = `You are a technical interviewer assessing a candidate's skill in "${skill}".
Question asked: "${question}"
Candidate's answer: "${answer}"

Provide a score from 1 to 10 evaluating their proficiency based on this answer. 
Also provide a 1-line reasoning for the score.
Return ONLY a valid JSON object in this exact format, with no markdown formatting:
{"score": 8, "reasoning": "The candidate clearly explained..."}`;

  const responseText = await callGemini(prompt, apiKey);
  try {
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse score from Gemini", responseText);
    return { score: 5, reasoning: "Error assessing answer." };
  }
};

export interface LearningResource {
  type: string;
  name: string;
  link: string;
}

export interface LearningPlanItem {
  skill: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
  resources: LearningResource[];
}

export const generateLearningPlan = async (scores: {skill: string, score: number}[], apiKey: string): Promise<LearningPlanItem[]> => {
  const gapSkills = scores.filter(s => s.score < 7).map(s => s.skill).join(", ");
  if (!gapSkills) return [];

  const prompt = `You are an AI career coach. The candidate has skill gaps (score < 7) in the following areas: ${gapSkills}.
For each of these skills, create a personalized learning plan.
Return ONLY a valid JSON array of objects, with no markdown formatting. The format MUST be exactly:
[
  {
    "skill": "Skill Name",
    "priority": "High",
    "time": "e.g., 2 Weeks",
    "resources": [
      { "type": "Course", "name": "Resource Name", "link": "#" },
      { "type": "Video", "name": "Resource Name", "link": "#" }
    ]
  }
]`;

  const responseText = await callGemini(prompt, apiKey);
  try {
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse learning plan from Gemini", responseText);
    return [];
  }
};
