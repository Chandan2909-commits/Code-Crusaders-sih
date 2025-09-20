import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface SkillAnalysisRequest {
  role: string;
  company: string;
  skills: string[];
}

interface MissingSkill {
  skill: string;
  video: string;
}

interface SkillRoadmap {
  title: string;
  skills: MissingSkill[];
}

interface SkillAnalysisResponse {
  status: 'ready' | 'missing_skills' | 'beginner_roadmap';
  message?: string;
  missing_skills?: MissingSkill[];
  roadmaps?: SkillRoadmap[];
}

async function searchWeb(query: string): Promise<string> {
  try {
    if (!process.env.TAVILY_API_KEY) {
      console.log('Tavily API key not found, skipping web search');
      return '';
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error('Tavily API response not ok:', response.status, response.statusText);
      return '';
    }

    const data = await response.json();
    return data.results?.map((r: any) => r.content).join('\n') || '';
  } catch (error) {
    console.error('Web search failed:', error);
    return '';
  }
}

function getAdvancedSkills(role: string): string[] {
  const roleSkills: { [key: string]: string[] } = {
    'software engineer': ['System Design', 'Microservices', 'Cloud Architecture', 'DevOps', 'Security', 'Performance Optimization'],
    'sde': ['System Design', 'Distributed Systems', 'Cloud Platforms', 'Kubernetes', 'CI/CD', 'Monitoring'],
    'data scientist': ['Deep Learning', 'MLOps', 'Big Data', 'Cloud ML', 'A/B Testing', 'Model Deployment'],
    'web developer': ['Advanced React', 'GraphQL', 'Microservices', 'Performance', 'Security', 'Testing'],
    'frontend developer': ['Advanced JavaScript', 'State Management', 'Performance', 'Testing', 'Build Tools', 'Accessibility'],
    'backend developer': ['Microservices', 'Caching', 'Message Queues', 'Load Balancing', 'Security', 'Monitoring'],
    'mobile developer': ['Advanced Frameworks', 'Performance', 'Security', 'CI/CD', 'App Store', 'Analytics'],
    'devops engineer': ['Kubernetes', 'Infrastructure as Code', 'Monitoring', 'Security', 'Automation', 'Cloud Architecture'],
    'product manager': ['Data Analytics', 'A/B Testing', 'Growth Hacking', 'Strategy', 'Leadership', 'Metrics'],
    'ui/ux designer': ['Advanced Prototyping', 'Design Systems', 'User Psychology', 'Accessibility', 'Design Ops', 'Research Methods']
  };
  
  const normalizedRole = role.toLowerCase();
  
  for (const [key, skills] of Object.entries(roleSkills)) {
    if (normalizedRole.includes(key) || key.includes(normalizedRole)) {
      return skills;
    }
  }
  
  return ['Advanced Programming', 'System Architecture', 'Leadership', 'Mentoring', 'Strategy', 'Innovation'];
}

function getBeginnerSkills(role: string): string[] {
  const roleSkills: { [key: string]: string[] } = {
    'software engineer': ['Programming Basics', 'Git', 'Data Structures', 'Algorithms', 'HTML CSS', 'JavaScript'],
    'sde': ['Programming Basics', 'Git', 'Data Structures', 'Algorithms', 'System Design', 'Database'],
    'data scientist': ['Python', 'Statistics', 'SQL', 'Excel', 'Data Visualization', 'Machine Learning'],
    'web developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git'],
    'frontend developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Responsive Design'],
    'backend developer': ['Programming', 'Database', 'API', 'Git', 'Server', 'Authentication'],
    'mobile developer': ['Programming', 'Mobile Framework', 'Git', 'UI Design', 'API Integration', 'Testing'],
    'devops engineer': ['Linux', 'Git', 'Docker', 'Cloud Basics', 'Scripting', 'Monitoring'],
    'product manager': ['Analytics', 'User Research', 'Project Management', 'Communication', 'Market Research', 'Agile'],
    'ui/ux designer': ['Design Tools', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing']
  };
  
  const normalizedRole = role.toLowerCase();
  
  // Find matching role or use default
  for (const [key, skills] of Object.entries(roleSkills)) {
    if (normalizedRole.includes(key) || key.includes(normalizedRole)) {
      return skills;
    }
  }
  
  // Default for any tech role
  return ['Programming Basics', 'Git', 'Problem Solving', 'Communication', 'Learning Skills', 'Project Management'];
}

// Curated high-quality tutorial videos for common skills
const curatedVideos: { [key: string]: string } = {
  'python': 'https://www.youtube.com/watch?v=rfscVS0vtbw',
  'javascript': 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
  'react': 'https://www.youtube.com/watch?v=bMknfKXIFA8',
  'html': 'https://www.youtube.com/watch?v=UB1O30fR-EE',
  'css': 'https://www.youtube.com/watch?v=yfoY53QXEnI',
  'sql': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
  'git': 'https://www.youtube.com/watch?v=RGOj5yH7evk',
  'machine learning': 'https://www.youtube.com/watch?v=GwIo3gDZCVQ',
  'data visualization': 'https://www.youtube.com/watch?v=a9UrKTVEeZA',
  'excel': 'https://www.youtube.com/watch?v=Vl0H-qTclOg',
  'statistics': 'https://www.youtube.com/watch?v=xxpc-HPKN28',
  'data analysis': 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
  'nodejs': 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
  'docker': 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
  'kubernetes': 'https://www.youtube.com/watch?v=X48VuDVv0do'
};

async function searchYouTube(skill: string): Promise<string> {
  try {
    // First try curated videos for common skills
    const normalizedSkill = skill.toLowerCase().trim();
    
    // Check for exact match
    if (curatedVideos[normalizedSkill]) {
      console.log(`Using curated video for ${skill}`);
      return curatedVideos[normalizedSkill];
    }
    
    // Check for partial matches
    for (const [key, video] of Object.entries(curatedVideos)) {
      if (normalizedSkill.includes(key) || key.includes(normalizedSkill)) {
        console.log(`Using curated video for ${skill} (matched ${key})`);
        return video;
      }
    }
    
    console.log(`Trying YouTube API for skill: ${skill}`);
    
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key missing');
    }

    const query = `${skill} tutorial`;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=long&order=viewCount&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      if (errorData.error?.reason === 'quotaExceeded') {
        console.log('YouTube API quota exceeded, using generic tutorial link');
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`;
      }
      throw new Error(`YouTube API failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (searchData.items && searchData.items.length > 0) {
      const videoUrl = `https://www.youtube.com/watch?v=${searchData.items[0].id.videoId}`;
      console.log(`Found YouTube video for ${skill}: ${videoUrl}`);
      return videoUrl;
    }
    
    throw new Error('No videos found');
    
  } catch (error) {
    console.error('YouTube search failed for skill:', skill, 'Error:', error.message);
    // Return a generic search as last resort
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API called - checking environment variables');
    console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
    console.log('YOUTUBE_API_KEY exists:', !!process.env.YOUTUBE_API_KEY);
    console.log('TAVILY_API_KEY exists:', !!process.env.TAVILY_API_KEY);

    const body: SkillAnalysisRequest = await request.json();
    const { role, company, skills } = body;
    console.log('Request body:', { role, company, skills });
    
    // Handle beginners with no skills
    const hasSkills = skills.length > 0 && skills.some(skill => skill.trim().length > 0);
    if (!hasSkills) {
      console.log('User has no skills - providing complete roadmap');
      
      const beginnerSkills = getBeginnerSkills(role);
      const advancedSkills = getAdvancedSkills(role);
      
      const beginnerRoadmap: MissingSkill[] = [];
      const advancedRoadmap: MissingSkill[] = [];
      
      // Get beginner skills with videos
      for (const skill of beginnerSkills) {
        const videoUrl = await searchYouTube(skill);
        beginnerRoadmap.push({ skill, video: videoUrl });
      }
      
      // Get advanced skills with videos
      for (const skill of advancedSkills) {
        const videoUrl = await searchYouTube(skill);
        advancedRoadmap.push({ skill, video: videoUrl });
      }
      
      return NextResponse.json({
        status: 'beginner_roadmap',
        roadmaps: [
          { title: '🚀 Beginner Roadmap - Start Here', skills: beginnerRoadmap },
          { title: '🎯 Advanced Skills - Master These Later', skills: advancedRoadmap }
        ]
      } as SkillAnalysisResponse);
    }

    // Search for required skills
    const searchQuery = `skills required for ${role} at ${company}`;
    console.log('Searching web for:', searchQuery);
    const webResults = await searchWeb(searchQuery);
    console.log('Web results length:', webResults.length);

    // Use Groq to analyze required skills
    const skillsPrompt = `
Analyze the skills required for a "${role}" position at "${company}" and compare with the user's current skills.

Web search results:
${webResults}

User's current skills: ${skills.join(', ')}

Respond ONLY with a valid JSON object in this exact format:
{
  "required_skills": ["skill1", "skill2", "skill3"],
  "missing_skills": ["missing_skill1", "missing_skill2"]
}

Focus on technical skills only. Keep skill names concise (1-3 words).
`;

    console.log('Calling Groq API...');
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: skillsPrompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    console.log('AI Response:', aiResponse);
    
    // Extract missing skills from AI response
    let missingSkills: string[] = [];
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        missingSkills = parsed.missing_skills || [];
      }
    } catch (error) {
      console.log('JSON parsing failed, using fallback');
      // Fallback: extract skills from the raw response
      const skillKeywords = [
        'spreadsheet software', 'data governance', 'data visualization', 
        'data analysis', 'data collection', 'data storage', 'data security',
        'machine learning', 'data-driven decision-making', 'data architecture',
        'big data', 'Google Sheets', 'pivot tables', 'charts', 'generative AI',
        'Excel', 'SQL', 'Python', 'R', 'Tableau', 'Power BI', 'statistics'
      ];
      
      // Extract skills mentioned in the response
      const responseText = aiResponse.toLowerCase();
      missingSkills = skillKeywords.filter(skill => 
        responseText.includes(skill.toLowerCase())
      ).slice(0, 8);
      
      // If no skills found, provide role-specific skills
      if (missingSkills.length === 0) {
        const roleBasedSkills = getBeginnerSkills(role);
        missingSkills = roleBasedSkills.slice(0, 6);
      }
    }

    console.log('Missing skills:', missingSkills);

    if (missingSkills.length === 0) {
      return NextResponse.json({
        status: 'ready',
        message: 'You are ready for the role! Just polish your skills and you will surely make it one day 🚀'
      } as SkillAnalysisResponse);
    }

    // Find YouTube videos for missing skills
    const skillsWithVideos: MissingSkill[] = [];
    
    for (const skill of missingSkills) {
      // Clean up skill name
      const cleanSkill = skill.trim().replace(/[^a-zA-Z0-9\s-]/g, '');
      if (cleanSkill.length === 0) continue;
      
      console.log('Searching YouTube for:', cleanSkill);
      const videoUrl = await searchYouTube(cleanSkill);
      skillsWithVideos.push({
        skill: cleanSkill,
        video: videoUrl
      });
    }

    console.log('Final result:', skillsWithVideos);

    return NextResponse.json({
      status: 'missing_skills',
      missing_skills: skillsWithVideos
    } as SkillAnalysisResponse);

  } catch (error) {
    console.error('Error in get-role-skills:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}