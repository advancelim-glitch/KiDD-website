// KiDD Joy Telegram real-time webhook (Cloudflare Workers)
// No persistent chat history or automatic Joy/Rose conversation.
const reply=(body,status=200)=>new Response(body,{status,headers:{"content-type":"text/plain;charset=utf-8"}});
const api=async(url,options={})=>{const r=await fetch(url,options);if(!r.ok)throw new Error("Upstream HTTP "+r.status);return r.json()};
async function send(env,chatId,text,replyId){
  const r=await api("https://api.telegram.org/bot"+env.TELEGRAM_BOT_TOKEN+"/sendMessage",{
    method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({chat_id:chatId,text,reply_parameters:{message_id:replyId,allow_sending_without_reply:true}})
  });if(!r.ok)throw new Error("Telegram rejected sendMessage");
}
async function processMessage(update,env){
  const msg=update?.message;
  if(!msg || !["group","supergroup"].includes(msg.chat?.type))return;
  if(String(msg.from?.id)!==String(env.TELEGRAM_OWNER_ID))return;
  const content=(msg.text||"").trim();
  const match=content.match(/^\/joy(?:@KiDD_Joy_Bot)?\s+([\s\S]+)$/i);
  if(!match)return;
  const question=match[1].trim().slice(0,1600);
  if(!question)return;
  if(env.TELEGRAM_GROUP_ID && String(msg.chat.id)!==String(env.TELEGRAM_GROUP_ID))return;
  // Optional KV binding for webhook retry de-duplication.
  const key="telegram-update-"+update.update_id;
  if(env.UPDATE_DEDUP_KV){
    const claimed=await env.UPDATE_DEDUP_KV.get(key);
    if(claimed)return;
    await env.UPDATE_DEDUP_KV.put(key,"claimed",{expirationTtl:86400});
  }
  try{
    const o=await api("https://api.openai.com/v1/responses",{
      method:"POST",headers:{"authorization":"Bearer "+env.OPENAI_API_KEY,"content-type":"application/json"},
      body:JSON.stringify({
        model:"gpt-4.1-mini",
        instructions:"너는 KiDD 공동연구실 GPT 기반 조이의 실시간 API 인스턴스다. 연구 윤리를 지키고 근거와 불확실성을 구별하며, 상대의 논점을 공정하게 검토하라. 기존 ChatGPT 채팅의 기억·권한을 자동으로 공유한다고 주장하지 마라. 한국어로 850자 이내로 간결히 답하라.",
        input:question,max_output_tokens:450,store:false
      })
    });
    const answer=(o.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\n").trim();
    if(!answer)throw new Error("Empty AI response");
    await send(env,msg.chat.id,"🌱 KiDD Joy (실시간 API)\n"+answer.slice(0,3000),msg.message_id);
  }catch(err){
    // Errors do not expose secrets or user messages in logs.
    console.log("Joy webhook processing failed:",String(err.message).replace(/[0-9]{8,}:[A-Za-z0-9_-]+/g,"[redacted]"));
    try{await send(env,msg.chat.id,"조이 연결 처리에 오류가 있어. 관리자에게 API/Worker 설정 확인이 필요해.",msg.message_id)}catch(_){}
  }
}
export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==="/health" && request.method==="GET")return reply("KiDD Joy webhook service ready");
    if(url.pathname!=="/telegram/joy"||request.method!=="POST")return reply("Not found",404);
    const received=request.headers.get("X-Telegram-Bot-Api-Secret-Token")||"";
    if(!env.TELEGRAM_WEBHOOK_SECRET || received!==env.TELEGRAM_WEBHOOK_SECRET)return reply("Unauthorized",401);
    let update;
    try{update=await request.json()}catch(_){return reply("Invalid JSON",400)}
    if(!env.TELEGRAM_BOT_TOKEN || !env.OPENAI_API_KEY || !env.TELEGRAM_OWNER_ID)return reply("Server configuration incomplete",503);
    ctx.waitUntil(processMessage(update,env));
    return reply("OK",200);
  }
};
