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

  const username = 'digitalxiaoiu5';

  // HÀNG CHỜ 4 API KEY (GỒM TẤT CẢ KEY BẠN CUNG CẤP)
  const API_QUEUE = [
    {
      name: 'TIKWM Key 4',
      key: process.env.RAPIDAPI_KEY || '9501866ceemsh9971b65b8c55e4bp104004jsn3fdd39dae46c'
    },
    {
      name: 'TIKWM Key 3',
      key: process.env.RAPIDAPI_KEY_BACKUP_1 || '668c54186cmsh1597c621acf9447p1dc5e6jsn5ba76fd94c98'
    },
    {
      name: 'TIKWM Key 2',
      key: process.env.RAPIDAPI_KEY_BACKUP_2 || 'b3dc678213mshe8b68548ffc9a05p1fa523jsn2069cea1f6b3'
    },
    {
      name: 'TIKWM Key 1',
      key: process.env.RAPIDAPI_KEY_BACKUP_3 || 'c44132496amshb351fa2abe14f69p13cc3djsn0e6292941d9f'
    }
  ];

  let lastError = null;

  // Thu lan luot tung Key trong hang cho
  for (let i = 0; i < API_QUEUE.length; i++) {
    const activeKey = API_QUEUE[i].key;

    try {
      const options = {
        method: 'GET',
        url: 'https://tiktok-scraper7.p.rapidapi.com/user/info',
        params: { unique_id: username },
        headers: {
          'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com',
          'x-rapidapi-key': activeKey
        },
        timeout: 4000
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
      }
    } catch (error) {
      console.warn(`[QUEUE SWAP] Key thu ${i + 1} loi hoac het luot. Dang doi sang Key tiep theo...`);
      lastError = error;
    }
  }

  // Truong hop tat ca 4 Key deu loi hoac het luot
  const executionTime = Date.now() - startTime;
  console.error('Loi Tat ca RapidAPI Keys:', lastError?.response?.data || lastError?.message);
  return res.status(500).json({
    success: false,
    message: 'Loi ket noi den RapidAPI Scraper.',
    latency_ms: executionTime
  });
};
