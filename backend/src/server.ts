import express from "express"
import type {Request, Response} from "express"
import cors from "cors"
import { clerkMiddleware, requireAuth } from "@clerk/express"
import dotenv from "dotenv"
import Groq from "groq-sdk"
import { enhancePrompt, errorFixPrompt, systemConstraint } from "./prompts.js"
import { clerkRateLimiter } from "./rateLimit.js"

dotenv.config()

const app = express()
const PORT= process.env.PORT || 3000
const groq = new Groq({apiKey : process.env.GROQ_API_KEY})

app.use(cors({
    origin:true,
    credentials:true,
    allowedHeaders:["Content-Type", "Authorization"]
}))

app.use(express.json())
app.use(clerkMiddleware())

app.get("/health",(req , res)=>{
    res.json({msg: "service deployed", status:"ok"})
})

app.post("/chat",requireAuth(), clerkRateLimiter , async (req : Request ,res : Response)=>{
    const {userPrompt} = req.body 
    console.log(userPrompt)
    try {
        const enhanced = await groq.chat.completions.create({
            model : "qwen/qwen3-32b",
            messages : [
                {role : 'user', content: userPrompt},
                {role : "system", content: enhancePrompt}
            ]
        })   

        if(!enhanced.choices[0]?.message.content)return

        const llmResponse = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages : [
                {role: "system", content: systemConstraint},
                {role : 'user', content : enhanced.choices[0]?.message.content},
            ],
            
        })

        const responseCode = llmResponse.choices[0]?.message.content
        const processedResponse = responseCode?.replace(/<think>[\s\S]*?<\/think>/, '').trim();
        console.log(responseCode)
        res.json({response : processedResponse})
    }catch (e: any) {
    console.error(e);
    res.json({error : "internal server error"})
  }

})

app.post("/update",requireAuth(), clerkRateLimiter, async (req , res)=>{
    const {userPrompt, code} = req.body;
    console.log("request reached")
    try{
        const llmResponse = await groq.chat.completions.create({
            model:"openai/gpt-oss-120b",
            messages: [
                { role: "system", content: systemConstraint },
                { role: "user", content: `CHANGE REQUEST:\n${userPrompt}` },
                { role: "user", content: `CURRENT CODE:\n${code}` }
            ]
        })

        const responseCode = llmResponse.choices[0]?.message.content
        const processedResponse = responseCode?.replace(/<think>[\s\S]*?<\/think>/, '')
        console.log(processedResponse)
        res.json({response: processedResponse})
    }catch(e){
        console.error(e)
        res.json({error: "intenal server error"})
    }
})

app.post("/fixError", requireAuth(), clerkRateLimiter ,async (req :Request, res: Response)=>{
    const {code, buildErrors} = req.body
    console.log("request reached")
    await new Promise(r => setTimeout(r,3000))

    try {
        const llmResponse = await groq.chat.completions.create({
            model : "qwen/qwen3-32b",
            messages : [
                {role : 'system', content : errorFixPrompt},
                {role : 'user', content : `CODE:\n${code}\n${buildErrors}`},
            ]
        })

        const responseCode = llmResponse.choices[0]?.message.content
        const processedResponse = responseCode?.replace(/<think>[\s\S]*?<\/think>/, '').trim();
        console.log(processedResponse)
        res.json({response : processedResponse})
    }catch(e:any){
        console.error(e);
        res.json({error : "internal server error"})
    }
})

app.listen(PORT,()=>console.log("listening on ", PORT))