import { ActionFunctionArgs } from "@remix-run/node";
import { OpenAI } from "openai";

export async function action({ request }: ActionFunctionArgs){
    const formData = await request.formData();
    const text = formData.get("text") as string;
    const completionText = await getCompletion(text);
    return completionText;
}

async function getCompletion(text: string){
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const openAI = new OpenAI({ apiKey: OPENAI_API_KEY});
    const result = await openAI.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "あなたは優秀な日本語の作文アシスタントです。ユーザーが入力した文章の続きを、自然で文法的に正しい日本語で簡潔に生成してください。与えられた文脈を考慮し、ユーザーの意図を汲み取って適切な文章を生成することを心がけてください。"
            },
            {
                role: "assistant",
                content: `承知しました。ユーザーの入力文に続く自然な日本語の文章を簡潔に生成いたします。以下の文脈情報を参考にします。`,
            },
            {
                role: "user",
                content: `次の文章の続きを、文脈を考慮して自然な日本語で簡潔に生成してください。40文字程度でお願いします。\n「${text}」`,
            }
        ],
        model: 'gpt-3.5-turbo'
    });
    const completion = result.choices[0].message.content
    return completion
}
