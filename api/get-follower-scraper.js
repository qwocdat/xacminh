const axios = require('axios');

module.exports = async function handler(req, res) {
  // Cấu hình CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // Lưu Cache trên Vercel 5 phút (300 giây) để tiết kiệm 300 lượt gọi/tháng
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const username = 'digitalxiaoiu';

    // Gọi API lấy thông tin profile của TIKWM trên RapidAPI
    const options = {
      method: 'GET',
      url: 'https://tiktok-scraper7.p.rapidapi.com/user/info',
      params: { unique_id: username },
      headers: {
        'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'c44132496amshb351fa2abe14f69p13cc3djsn0e6292941d9f'
      }
    };

    const response = await axios.request(options);
    const apiData = response.data;

    // Bóc tách số lượng follower từ cấu trúc JSON trả về
    const followerCount = apiData?.data?.user?.fans ?? apiData?.data?.stats?.followerCount;

    if (followerCount !== undefined && followerCount !== null) {
      return res.status(200).json({
        success: true,
        username: username,
        follower_count: followerCount,
        formatted_count: followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + 'K' : followerCount.toString()
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thấy thong tin follower trong phan hoi API.'
      });
    }

  } catch (error) {
    console.error('Loi khi goi RapidAPI:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Loi ket noi den RapidAPI Scraper.'
    });
  }
};
