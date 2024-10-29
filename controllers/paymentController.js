// const uuid = require('uuid').v4;

// exports.getPaymentInfo = async (req, res) => {
//   res.render('index', {
//     title: 'order',
//     orderId: uuid(),
//     orderName: '토스 티셔츠',
//     price: 50000,
//     customerName: 'Toss Kim',
//     customerKey: uuid(),
//   });
// };

exports.confirmPayment = async (req, res) => {
  // 클라이언트에서 받은 JSON 요청 바디입니다.
  const { paymentKey, orderId, amount } = req.body;

  //TODO: 결제 정보가 올바른지 검증하는 로직 구현

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
    console.log(responseBody);
    res.status(response.status).json(responseBody);
  } else {
    // 결제 실패 비즈니스 로직을 구현하세요.
    console.log(responseBody);
    res.status(response.status).json(responseBody);
  }
};

//   got
//     .post('https://api.tosspayments.com/v1/payments/confirm', {
//       headers: {
//         Authorization: encryptedSecretKey,
//         'Content-Type': 'application/json',
//       },
//       json: {
//         orderId: req.query.orderId,
//         amount: req.query.amount,
//         paymentKey: req.query.paymentKey,
//       },
//       responseType: 'json',
//     })
//     .then(function (response) {
//       // 결제 성공 비즈니스 로직을 구현하세요.
//       console.log(response.body);
//       res.status(response.statusCode).json(response.body);
//     })
//     .catch(function (error) {
//       // 결제 실패 비즈니스 로직을 구현하세요.
//       console.log(error.response.body);
//       res.status(error.response.statusCode).json(error.response.body);
//     });
// };

exports.failPayment = async (req, res) => {
  res.render('fail', {
    message: req.query.message,
    code: req.query.code,
  });
};
