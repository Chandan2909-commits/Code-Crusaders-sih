// Test script to check API
const testData = {
  role: "Software Engineer",
  company: "Google", 
  skills: ["JavaScript", "React"]
};

fetch('http://localhost:3000/api/get-role-skills', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));