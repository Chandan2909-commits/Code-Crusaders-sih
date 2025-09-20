export const generateResponse = async (messages: Array<{role: string, content: string}>) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Please add your GROQ_API_KEY to the .env.local file.";
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      return "Sorry, there was an error with the AI service.";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Groq API error:', error);
    return "Sorry, there was an error processing your request.";
  }
};