const axios=require("axios")
const OpenAI = require('openai');
const dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAI({apiKey:process.env.OPENAI_API});

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
      return null;
    }
  }


  
const getFormattedSummary = async (transcript) => {
var thread= await openai.beta.threads.create({
    messages:[
      {role:"user",content:`Make me a formatted summary based on the files you already have and this transcript\n ${transcript}`}
    ]
  });
console.log(thread)
  var run = await openai.beta.threads.runs.create(thread.id,{
   assistant_id:"asst_bgqlLbIPVp6NOpKAhPCLKqNZ",
   
    });
   
    console.log("run created "+ run.id)

    while(run.status!=="completed"){
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

      run=await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      )
      console.log("run status")
      console.log(run.status);
    }
    const result = await openai.beta.threads.messages.list(
      thread.id
    )
    return result.data[0].content[0].text.value
}
  

  module.exports={getSummary,getFormattedSummary}
  