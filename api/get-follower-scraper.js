const axios = require('axios');

module.exports = async function handler(req, res) {
  const startTime = Date.now();

  // Cau hinh CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // TAT CACHE HOAN TOAN: Ep lay du lieu thoi gian thuc 100%
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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
    const executionTime = Date.now() - startTime;

    const followerCount = apiData?.data?.user?.fans ?? apiData?.data?.stats?.followerCount;

    if (followerCount !== undefined && followerCount !== null) {
      return res.status(200).json({
        success: true,
        username: username,
        follower_count: followerCount,
        latency_ms: executionTime,
        timestamp: Date.now()
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay du lieu follower.',
        latency_ms: executionTime
      });
    }

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('Loi RapidAPI:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Loi ket noi den RapidAPI Scraper.',
      latency_ms: executionTime
    });
  }
};
