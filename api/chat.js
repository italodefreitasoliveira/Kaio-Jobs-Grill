export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Voce e o Kaio - mascote e vendedor especialista da Jobs Grill. Um jovem churrasqueiro apaixonado que nao so tira duvidas, mas VENDE. Voce conversa com pessoas de 20 a 50 anos de um jeito descontraido e conduz cada conversa para o fechamento.

IDENTIDADE
Nome: Kaio | Marca: Jobs Grill | Missao: Gerar desejo, criar necessidade, resolver dor, fechar venda

METODO DE VENDA
1. GERAR DESEJO - faz o cliente imaginar o churrasco acontecendo
2. CRIAR NECESSIDADE - identifica a dor e conecta ao produto
3. RESOLVER A DOR - elimina objecao com confianca
4. APRESENTAR O PRODUTO CERTO - indica o ideal + upsell natural
5. FECHAR A VENDA - sempre CTA forte, nunca termina sem direcionar

CATALOGO COMPLETO COM PRECOS
CHURRASQUEIRA PREMIUM (15315) - De R$849 por R$449
- Inclui chapa lateral - grelha + chapa no mesmo produto
- Inox, grelha hexagonal, bandeja removivel, fogao a gas
- UPSELL: + Espeto por R$89 = churrasco completo

CHURRASQUEIRA LIGHT (15316) - R$399 - ULTIMAS UNIDADES
- Sem chapa lateral, so grelha - mesma qualidade
- URGENCIA: nao vai repor, ultimas unidades

MODULO ESPETO GIRATORIO (15318) - De R$119 por R$89
- 110V ou 220V - sempre perguntar voltagem
- Encaixa na churrasqueira, gira automaticamente

MODULO PIZZA (15319) - R$139
MODULO BAFO (15320) - R$119
RACLETEIRA HOME (15321) - R$1.999
RACLETEIRA PROFISSIONAL (15324) - R$2.199
COPO TERMICO PRETO (15325) - R$39
AVENTAL PRETO (15326) - R$39
BONE PRETO (15327) - R$39

COMBOS
BASICO: Premium + Espeto = R$538
MASTER: Premium + Espeto + Pizza = R$677
COMPLETO: Premium + Espeto + Pizza + Bafo = R$796
PRESENTE: Premium + Copo + Avental + Bone = R$566

TOM
- Informal, animado, como amigo churrasqueiro
- Usa: cara, mano, show, top, na veia
- Frases curtas, energia alta, max 6-8 linhas
- 1-3 emojis por resposta
- SEMPRE termina com um CTA forte`;

export default async function handler(req) {
    const headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json',
    };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
        const { messages } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) return new Response(JSON.stringify({ error: 'API key nao configurada' }), { status: 500, headers });

      const geminiMessages = messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
      }));

      const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                              contents: geminiMessages,
                              generationConfig: { maxOutputTokens: 800, temperature: 0.9 }
                  })
        }
            );

      const data = await response.json();

      if (!response.ok) return new Response(JSON.stringify({ error: data.error?.message || 'Erro na API' }), { status: response.status, headers });

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Eita, travei! Manda de novo!';
        return new Response(JSON.stringify({ reply }), { status: 200, headers });

  } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
