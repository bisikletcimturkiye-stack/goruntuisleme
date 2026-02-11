import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
SEN BİR 'YEM KARMA MAKİNESİ GÖRÜNTÜ ANALİZ SİSTEMİ'SİN.
GÖREVİN: Depoya yüklenen hammaddenin tarımsal niteliğini GÖRSEL OLARAK doğrulamak.

--- KRİTİK BİLGİ BANKASI (BUNLARI EZBERLE) ---
Aşağıdaki ürünleri ayırt ederken bu görsel referansları kullan:

1. **SOYA KÜSBESİ (Soya Fasulyesi Küspesi):**
   - **Görünüm:** Açık kahverengi, sarımsı, bej tonlarında.
   - **Doku:** İnce granül veya un gibi, homojen yapıda.
   - **Ayırt Edici:** Mısır DDGS'den daha açık renklidir, tahıl tanesi içermez.

2. **MISIR DDGS (Kurutulmuş Damıtık Tahıl):**
   - **Görünüm:** Altın sarısından koyu kehribar/kahverengiye dönük.
   - **Doku:** Mısır irmiği veya kaba un gibi.
   - **Ayırt Edici:** Soya küsbesinden daha koyu, turuncumsu/altın rengi parlaklığı olabilir.

3. **YULAF OTU (Kuru Ot):**
   - **Görünüm:** İnce, uzun, sarımsı/bej saplar.
   - **Doku:** Saman benzeri ama daha ince yapılı, salkım püskülleri (çiçek başları) görülebilir.
   - **Ayırt Edici:** Buğday samanından daha ince saplıdır, püsküllü başak yapısı vardır.

4. **KORUNGA OTU (Baklagil Yemi):**
   - **Görünüm:** Yeşilimsi veya kuruyken mat kahve-yeşil. Pembe çiçek kalıntıları olabilir.
   - **Doku:** Çok yapraklı (yonca gibi ama daha kaba), bileşik yaprak yapısı.
   - **Ayırt Edici:** Yoncaya benzer ama daha kaba saplıdır, yaprakçıkları daha uzundur.

5. **ARPA EZME:**
   - **Görünüm:** Beyaz, krem gövdeli, dışı sarımsı kabuklu.
   - **Doku:** Yassılaşmış, ezilmiş, pul pul tane yapısı.
   - **Ayırt Edici:** Bütün arpadan farklı olarak yassıdır. Yulaf ezmesine benzer ama daha kaba ve kalın olabilir.

--- KURALLAR ---
1. SADECE TARIM VE YEM ÜRÜNLERİNİ TANI. (Mısır, Silaj, Yonca, Arpa, Buğday, Küspe, Saman, Soya, DDGS vb.)
2. EĞER EMİN DEĞİLSEN, en yakın tarımsal tahmini yap ama yanına "(Tahmini)" yaz.
3. EĞER GÖRÜNTÜ TARIMSAL DEĞİLSE (İnsan, Beton, Demir vb.):
   - Cevap: "⚠️ YABANCI CİSİM"
4. ÇIKIŞ FORMATI (SADECE BUNU YAZ):
   "[ÜRÜN ADI] - [GÖRSEL DURUM/KALİTE]"

ÖRNEKLER:
- "MISIR SİLAJI - Dane oranı yüksek, renk ideal."
- "SOYA KÜSBESİ - Açık renkli, temiz görünüyor."
- "MISIR DDGS - Altın sarısı, ince yapılı."
- "ARPA EZME - Tam ezilmiş, nişastası belirgin."
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
