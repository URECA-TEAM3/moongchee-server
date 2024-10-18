const express = require('express');
const app = express();
const axios = require('axios');

const cors = require('cors');
app.use(cors());

app.use(express.json());

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
  res.send('Hello, Express');
});

app.post('/api/google-login', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '토큰이 없습니다.' });
  }

  console.log('받은 토큰:', token);

  res.json({ message: '로그인 성공', token });
});

app.post('/api/kakao-login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '토큰이 없습니다.' });
  }

  try {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data;
    console.log('카카오 사용자 정보:', userData);

    res.json({ message: '로그인 성공', user: userData });
  } catch (error) {
    console.error('카카오 로그인 오류:', error);
    res.status(500).json({ message: '카카오 로그인 실패' });
  }
});

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}번 포트에서 서버 실행 중`);
});
