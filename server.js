const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Static pizza database
const pizzas = [
  { id: 1, name: "Margherita", price: 12.99, description: "Classic tomato and mozzarella", vegetarian: true, calories: 850, spicyLevel: 0 },
  { id: 2, name: "Pepperoni", price: 14.99, description: "Spicy pepperoni with cheese", vegetarian: false, calories: 1100, spicyLevel: 1 },
  { id: 3, name: "Vegetarian", price: 13.99, description: "Mixed vegetables", vegetarian: true, calories: 780, spicyLevel: 0 },
  // Add other pizzas here
];

// Endpoint for pizza recommendations
app.post('/api/pizza-recommendations', async (req, res) => {
    try {
      const userQuery = req.body.query || '';
      console.log(`User Query: ${userQuery}`);
  
      const systemPrompt = `
        You are a Pizza Recommendation Assistant. Recommend pizzas based on user preferences like spiciness, vegetarian options, price range, and calorie count.
        Available pizzas: ${JSON.stringify(pizzas)}.
  
        Rules:
        - ONLY return a valid JSON object in this exact format:
        {
          "recommendations": [pizza_ids],
          "explanation": "short explanation of why these pizzas were selected"
        }
        - DO NOT include any additional text, comments, or explanations outside the JSON.
  
        User Query: "${userQuery}"
      `;
  
      const requestBody = {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
      };
  
      console.log('Request Body Sent to Together AI:', requestBody);
  
      const response = await axios.post('https://api.together.xyz/v1/chat/completions', requestBody, {
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
  
      const rawContent = response.data.choices[0]?.message?.content || '{}';
      console.log('Raw Content from Together AI:', rawContent);
  
      // Validate JSON response
      try {
        const recommendations = JSON.parse(rawContent);
        res.json(recommendations);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError.message);
        res.status(500).json({
          error: 'Failed to parse response from Together AI. Please ensure your query is valid.',
          rawResponse: rawContent,
        });
      }
    } catch (error) {
      console.error('Error Response from Together AI:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
