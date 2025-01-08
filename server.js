const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Static pizza database
const pizzas = [
    {
      id: 1,
      name: "Margherita",
      price: 12.99,
      description: "Classic tomato and mozzarella",
      ingredients: ["Fresh Mozzarella", "Tomatoes", "Basil", "Olive Oil"],
      calories: 850,
      rating: 4.8,
      cookTime: "20 min",
      spicyLevel: 0,
      image: "https://via.placeholder.com/150?text=Margherita",
    },
    {
      id: 2,
      name: "Pepperoni",
      price: 14.99,
      description: "Spicy pepperoni with cheese",
      ingredients: ["Pepperoni", "Mozzarella", "Tomato Sauce"],
      calories: 1100,
      rating: 4.9,
      cookTime: "18 min",
      spicyLevel: 1,
      image: "https://via.placeholder.com/150?text=Pepperoni",
    },
    {
      id: 3,
      name: "Vegetarian",
      price: 13.99,
      description: "Mixed vegetables",
      ingredients: ["Bell Peppers", "Mushrooms", "Onions", "Olives"],
      calories: 780,
      rating: 4.7,
      cookTime: "22 min",
      spicyLevel: 0,
      image: "https://via.placeholder.com/150?text=Vegetarian",
    },
    {
      id: 4,
      name: "Hawaiian",
      price: 15.99,
      description: "Ham and pineapple",
      ingredients: ["Ham", "Pineapple", "Mozzarella", "Tomato Sauce"],
      calories: 950,
      rating: 4.6,
      cookTime: "20 min",
      spicyLevel: 0,
      image: "https://via.placeholder.com/150?text=Hawaiian",
    },
    {
      id: 5,
      name: "BBQ Chicken",
      price: 16.99,
      description: "Grilled chicken with BBQ sauce",
      ingredients: ["Chicken", "BBQ Sauce", "Red Onions", "Cilantro"],
      calories: 1020,
      rating: 4.8,
      cookTime: "25 min",
      spicyLevel: 1,
      image: "https://via.placeholder.com/150?text=BBQ+Chicken",
    },
    {
      id: 6,
      name: "Mushroom",
      price: 15.99,
      description: "Mixed mushrooms and truffle",
      ingredients: ["Mushroom Medley", "Truffle Oil", "Garlic", "Thyme"],
      calories: 880,
      rating: 4.8,
      cookTime: "21 min",
      spicyLevel: 0,
      image: "https://via.placeholder.com/150?text=Mushroom",
    },
    {
      id: 7,
      name: "Mediterranean",
      price: 16.99,
      description: "Mediterranean flavors",
      ingredients: ["Feta", "Olives", "Sun-dried Tomatoes", "Spinach"],
      calories: 920,
      rating: 4.6,
      cookTime: "24 min",
      spicyLevel: 0,
      image: "https://via.placeholder.com/150?text=Mediterranean",
    },
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
