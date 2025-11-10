const fetch = require('node-fetch');

async function testYouTubeAPI() {
  const apiKey = 'AIzaSyDfm8NvIx7jQtPJvfy1cLZrYAvz5nF4ljs';
  const query = 'Python tutorial';
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=long&order=viewCount&maxResults=3&key=${apiKey}`;
  
  console.log('Testing YouTube API...');
  console.log('URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Success! Found videos:', data.items?.length || 0);
    
    if (data.items && data.items.length > 0) {
      const firstVideo = data.items[0];
      console.log('First video:', {
        title: firstVideo.snippet.title,
        videoId: firstVideo.id.videoId,
        url: `https://www.youtube.com/watch?v=${firstVideo.id.videoId}`
      });
    }
    
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testYouTubeAPI();