const axios = require('axios');

module.exports = async function handler(req, res) {
  // Bắt buộc sử dụng phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Thieu duong link hinh anh tu R2.' });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ success: false, message: 'Chua cau hinh OPENROUTER_API_KEY tren Vercel.' });
    }

    // Prompt kiem tra nghiem ngat cho AI Vision Model
    const strictPrompt = `
Ban la mot he thong kiem tra va xac thuc anh chup man hinh TikTok tu dong mot cach NGHIEM NGAT.
Nhiem vu cua ban la phan tich hinh vuong chup giao dien Profile TikTok nay va tra loi theo dung dinh dang duoc yeu cau.

YEU CAU KIEM TRA:
1. Xac nhan dey co phai la trang ho so/profile TikTok cua tai khoan "@digitalxiaoiu" hoac "digitalxiaoiu" hay khong.
2. Kiem tra trang thai nut Follow/Theo doi:
   - Neu nut hien thi la "Dang theo doi", "Following", "Friends", "Ban be", hoac bieu tuong da follow -> Da follow.
   - Neu nut hien thi la "Follow", "Theo doi", "Follow lai" -> Chua follow.

QUY TAC TRA LOI (BAT BUOC):
Chi tra ve DUY NHAT mot chuoi JSON hop le voi dinh dang sau, tuyet doi khong kem bat ky loi giai thich hay ky tu/markdown nao khac:
{
  "is_correct_account": true/false,
  "is_following": true/false,
  "confidence_score": 0.0-1.0,
  "reason": "Ly do ngan gon bang tieng Viet"
}
`;

    // Goi OpenRouter API voi model google/gemma-3-27b-it
    const openrouterResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemma-3-27b-it',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: strictPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let responseText = openrouterResponse.data.choices[0].message.content.trim();

    // Làm sạch phản hồi nếu AI tự động bọc chuỗi trong markdown ```json
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const aiResult = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      data: aiResult
    });

  } catch (error) {
    console.error('Loi phan tich AI:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.error?.message || 'Loi trong qua trinh phan tich anh.'
    });
  }
};
