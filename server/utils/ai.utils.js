import https from "https";

const geminiCall = (prompt) => {
  return new Promise((resolve, reject) => {
    const key = process.env.GEMINI_API_KEY;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    });
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          console.log("Gemini raw response:", JSON.stringify(json).slice(0, 300));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          resolve(text.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

export const extractSkillsFromJobDescription = async (description) => {
  try {
    const prompt = `Extract technical skills from this job description. Return ONLY a JSON array like ["React","Node.js"]. Nothing else.\n\n${description}`;
    const text = await geminiCall(prompt);
    const clean = text.replace(/```json/g,"").replace(/```/g,"").trim();
    const skills = JSON.parse(clean);
    return Array.isArray(skills) ? skills : [];
  } catch (error) {
    console.error("Skill extraction failed:", error.message);
    return [];
  }
};

export const calculateMatchScore = (candidateSkills, requiredSkills) => {
  if (!requiredSkills?.length) return { score: 0, matchedSkills: [], missingSkills: [] };
  if (!candidateSkills?.length) return { score: 0, matchedSkills: [], missingSkills: requiredSkills };
  const candidateLower = candidateSkills.map(s => s.toLowerCase());
  const matchedSkills = requiredSkills.filter(s => candidateLower.includes(s.toLowerCase()));
  const missingSkills = requiredSkills.filter(s => !candidateLower.includes(s.toLowerCase()));
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return { score, matchedSkills, missingSkills };
};

export const analyzeResume = async (resumeText, targetJobTitle = "") => {
  try {
    const prompt = `Analyze this resume${targetJobTitle ? ` for "${targetJobTitle}"` : ""}. Return ONLY JSON: {"extractedSkills":[],"strengths":[],"weaknesses":[],"suggestions":[],"overallScore":0}\n\n${resumeText}`;
    const text = await geminiCall(prompt);
    const clean = text.replace(/```json/g,"").replace(/```/g,"").trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("Resume analysis failed:", error.message);
    return { extractedSkills:[], strengths:[], weaknesses:["Failed"], suggestions:["Retry"], overallScore:0 };
  }
};