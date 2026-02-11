import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
SEN BİR 'YEM KARMA MAKİNESİ GÖRÜNTÜ ANALİZ SİSTEMİ'SİN.
GÖREVİN: Depoya yüklenen hammaddenin tarımsal niteliğini doğrulamak.

KURALLAR:
1. SADECE YEM VE TAHIL ANALİZİ YAP (Mısır, Silaj, Yonca, Arpa, Buğday, Küspe, Saman vb.).
2. EĞER GÖRÜNTÜDE YEM YOKSA (İnsan, Araba, Kedi, Telefon vb.):
   - Cevabın SADECE şu olmalı: "⚠️ YABANCI CİSİM / YEM DEĞİL"
3. Yem ise şunları raporla (TÜRKÇE KARAKTER KULLANABİLİRSİN):
   - ÜRÜN: (Örn: Mısır Silajı)
   - FORM: (Örn: İnce Kıyım / Dane / Ezme)
   - KALİTE: (Görsel olarak küf, bozulma veya nem durumu)

ÇIKIŞ FORMATI ÖRNEK:
"MISIR SİLAJI (İnce Kıyım) - Temiz Görünüyor, Nem Oranı İyi."
`;

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'Image data required' }, { status: 400 });
        }

        // Determine if user sent full data URI or just base64
        const base64Image = image.startsWith('data:image')
            ? image
            : `data:image/jpeg;base64,${image}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Bu yüklenen madde nedir?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 100,
        });

        const analysis = response.choices[0]?.message?.content || "Analiz yapılamadı.";
        return NextResponse.json({ result: analysis });

    } catch (error) {
        console.error('AI Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
