// ==========================================================================
// CLOUDFLARE WORKER — OpenAI kalitini yashiruvchi xavfsiz proksi
// Bu kodni Cloudflare Workers'ga joylashtirasiz (frontend'ga emas!)
// ==========================================================================

const SYSTEM_PROMPT = `Sen "Kelajak Texnologiyalari" to'garagining AI yordamchisisan.
Foydalanuvchilar 5-8 sinf o'quvchilari. Ular dasturlash (Python, HTML, CSS, JavaScript),
sun'iy intellekt, kiberxavfsizlik va IT sohalarini o'rganishmoqda.
Javoblaring: o'zbek tilida, qisqa (3-5 gap), sodda va tushunarli, do'stona ohangda bo'lsin.
Agar savol dasturlash yoki texnologiyaga aloqasi bo'lmasa ham, xushmuomalalik bilan javob ber,
lekin uzun-uzun mavzudan chetga chiqma.`;

export default {
  async fetch(request, env) {
    // CORS headerlar — GitHub Pages saytingizdan so'rov kelishiga ruxsat beradi
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Brauzer avval "OPTIONS" so'rovi yuboradi — shunga ruxsat beramiz
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Faqat POST so'rovlar qabul qilinadi." }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const body = await request.json();
      const userMessage = (body.message || "").toString().slice(0, 1000); // uzunlikni cheklaymiz

      if (!userMessage.trim()) {
        return new Response(JSON.stringify({ error: "Bo'sh xabar." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const errText = await openaiResponse.text();
        return new Response(JSON.stringify({ error: "OpenAI xatosi: " + errText }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const data = await openaiResponse.json();
      const reply = data.choices && data.choices[0] ? data.choices[0].message.content : "Javob topilmadi.";

      return new Response(JSON.stringify({ reply: reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Server xatosi: " + err.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
