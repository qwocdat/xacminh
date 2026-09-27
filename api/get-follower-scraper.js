const axios = require('axios');

module.exports = async function handler(req, res) {
  // Cau hinh CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // Cache Vercel 5 phut de tiet kiem request RapidAPI
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const username = 'digitalxiaoiu';

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

    // Boc tach so follower tu JSON cua TIKWM
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
        message: 'Khong tim thay du lieu follower.'
      });
    }

  } catch (error) {
    console.error('Loi RapidAPI:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Loi ket noi den RapidAPI Scraper.'
    });
  }
};
