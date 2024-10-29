const db = require('../config/db');

exports.savePaymentInfo = async (req, res) => {
  const { orderId, amount } = req.body;

  try {
    const query = `INSERT INTO payment_verification (orderId, amount) VALUES (?, ?)`;
    const values = [orderId, amount];
    const [result] = await db.query(query, values);

    res.status(201).json({ message: '결제 정보 임시 저장 성공', orderId: result.insertId });
  } catch (error) {
    console.error('결제 정보 임시 저장 오류:', error);
    res.status(500).json({ message: '결제 정보 임시 저장 실패' });
  }
};

exports.confirmPayment = async (req, res) => {
  // 클라이언트에서 받은 JSON 요청 바디입니다.
  const { orderId, amount, paymentKey } = req.body;

  //결제 정보가 올바른지 검증
  try {
    const query = `SELECT * FROM payment_verification WHERE orderId = ?`;
    const [rows] = await db.query(query, orderId);

    if (rows[0].orderId == orderId && rows[0].amount != amount) {
      return res.status(400).json({ message: '결제 요청과 일치하지 않습니다.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '다시 시도해주세요.' });
  }

  // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
  // 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
  const widgetSecretKey = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';
  const encryptedSecretKey = 'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

  // 결제를 승인하면 결제수단에서 금액이 차감돼요.
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: encryptedSecretKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      amount,
      paymentKey,
    }),
  });

  const responseBody = await response.json();

  if (response.ok) {
    // 결제 성공 비즈니스 로직을 구현하세요.
    console.log('성공');
    console.log(responseBody);
    res.status(response.status).json(responseBody);
  } else {
    // 결제 실패 비즈니스 로직을 구현하세요.
    console.log('실패');
    console.log(responseBody);
    res.status(response.status).json(responseBody);
  }
};

exports.failPayment = async (req, res) => {
  res.render('fail', {
    message: req.query.message,
    code: req.query.code,
  });
};
