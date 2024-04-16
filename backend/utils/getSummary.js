const axios=require("axios")

const getSummary = async (transcript) => {
    const url = 'https://api.openai.com/v1/chat/completions';
  
    const headers = {
      'Authorization': `Bearer ${process.env.OPENAI_API}`,
      'Content-Type': 'application/json'
    };
    const data = {
      'model': 'gpt-3.5-turbo',
      'messages': [
        { "role": "user", "content": `give me the summary of this meeting ${transcript}` }
      ]
    };
  
    try {
      const response = await axios.post(url, data, { headers });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.log(error);
      return null; // Return null or handle error accordingly
    }
  }

  module.exports={getSummary}
  