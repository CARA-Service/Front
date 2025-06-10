export async function postRecommendation(payload) {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/v1/llm/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return await response.json();
  }