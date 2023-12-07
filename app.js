// בסיעתא דשמיא

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const { Configuration, OpenAIApi } = require('openai');
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config);
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/prompts', (req, res) => {
    const runPrompt = async () => {

        const greetingType = req.body["greetingType"];
        const recipient = req.body["recipient"];
        const eventType = req.body["eventType"];
        const age = req.body["age"];
        const mood = req.body["mood"];

        const prompt = `
        supply 3 ideas for ${greetingType} to ${recipient} on the occasion of his ${eventType} age ${age} in a ${mood} atmosphere.
        don't include in the response "creating", "creating an ai", "ai".
        also return the response in a parseable JSON format like follows:
        {
            "1":"...",
            "2":"...",
            "3":"..."
        }
        `;
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 1000,
        });

        const parseableJSONresponse = response.data.choices[0].text;

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(parseableJSONresponse)
        } catch (error) {
            console.error("Error parsing JSON response:", error);
            return {};
        }
        return { parsedResponse };
    }

    runPrompt().then(({ parsedResponse })=>{
        if (parsedResponse && Object.keys(parsedResponse).length>0){
            res.render('index', { content: 'prompts', response: parsedResponse, error: undefined});
        }
        else{
            res.render('index', { content: 'prompts', response: undefined, error: 'Unable to parse response from OpenAI.'});
        }
    });
});

app.listen(process.env.PORT, (req, res) => {
    console.log(`Application view at http://localhost:${process.env.PORT}`);
})