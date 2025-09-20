import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '../../lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    console.log('Received messages:', messages);
    const response = await generateResponse(messages);
    console.log('Generated response:', response);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { response: 'Sorry, there was an error processing your request.' },
      { status: 200 }
    );
  }
}