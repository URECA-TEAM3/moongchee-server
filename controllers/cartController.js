const db = require('../config/db');
require('dotenv').config();

// 장바구니에 담긴 상품 조회
exports.getAllCartItems = async (req, res) => {
  const { user_id } = req.params;
  const numericUserId = Number(user_id);
  try {
    const [cartItems] = await db.query(
      `
      SELECT 
        cart.id AS cart_id,
        cart.product_id,
        cart.user_id,
        cart.quantity,
        cart.checked,
        product.image,
        product.name,
        product.price
      FROM cart
      JOIN product ON cart.product_id = product.id
      WHERE cart.user_id = ?
      `,
      [numericUserId]
    );

    res.status(200).json({ message: '장바구니 조회 성공', data: cartItems });
  } catch (error) {
    console.error('장바구니 조회 오류:', error);
    res.status(500).json({ message: '장바구니 조회 실패' });
  }
};

// 장바구니 상품 추가
exports.postAllCartItems = async (req, res) => {
  const { product_id, user_id, quantity, checked } = req.body;

  try {
    const [existingItem] = await db.query('SELECT quantity FROM cart WHERE product_id = ? AND user_id = ?', [product_id, user_id]);

    if (existingItem.length > 0) {
      await db.query('UPDATE cart SET quantity = quantity + ?, checked = ? WHERE product_id = ? AND user_id = ?', [quantity, checked, product_id, user_id]);

      res.status(200).json({ message: '상품 수량이 업데이트되었습니다' });
    } else {
      await db.query('INSERT INTO cart (product_id, user_id, quantity, checked) VALUES (?, ?, ?, ?)', [product_id, user_id, quantity, checked]);

      res.status(201).json({ message: '상품이 장바구니에 추가되었습니다' });
    }
  } catch (error) {
    console.error('장바구니 상품 추가 오류:', error);
    res.status(500).json({ message: '장바구니 상품 추가 실패' });
  }
};

exports.saveCartItems = async (req, res) => {
  const cartData = req.body.cartData.cartToSend;
  const user_id = req.body.cartData.user_id;

  if (!user_id) {
    return res.status(400).send('User ID is required');
  } else {
    console.log('user_id 존재', user_id, cartData);
  }

  try {
    for (const item of cartData) {
      const { cart_id, quantity, checked } = item;

      await db.query('UPDATE cart SET quantity = ?, checked = ? WHERE id = ? AND user_id = ?', [quantity, checked, cart_id, user_id]);
    }

    res.status(200).json({ message: '장바구니 데이터가 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('장바구니 업데이트 오류:', error);
    res.status(500).json({ message: '장바구니 데이터 업데이트 실패' });
  }
};

exports.DeleteCartItems = async (req, res) => {
  const { cart_id } = req.params; // cart_id를 직접 가져옵니다.
  try {
    await db.query('DELETE FROM cart WHERE id = ?', [cart_id]);
    res.status(200).json({ message: '장바구니 상품 삭제 성공.' });
  } catch (error) {
    console.error('장바구니 삭제 오류:', error);
    res.status(500).json({ message: '장바구니 상품 삭제 실패' });
  }
};

exports.postPayItems = async (req, res) => {
  const { userId, status, total, productData, date } = req.body;

  try {
    // 1. order_table에 주문 정보 저장
    const [orderResult] = await db.query('INSERT INTO order_table (user_id, total) VALUES (?, ?)', [userId, total]);

    const orderId = orderResult.insertId;

    // 2. order_item 테이블에 상품 정보 저장
    const orderItemsQueries = productData.map((p) => {
      return db.query(
        `
        INSERT INTO order_item (product_id, order_id, quantity, price, status, order_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [p.product_id, orderId, p.quantity, p.price, status, date]
      );
    });

    // 모든 주문상품 쿼리를 동시에 실행
    await Promise.all(orderItemsQueries);

    // 3. 주문한 상품들 장바구니에서 제거
    await db.query('DELETE FROM cart WHERE user_id = ? AND checked = true', [userId]);

    // 4. 결제금액만큼 포인트 차감
    // 유저 포인트 조회
    const result = await db.query('SELECT point FROM member WHERE id = ?', [userId]);
    const userPoint = result[0][0].point;

    // 결제 후 차감된 포인트 업데이트
    await db.query('UPDATE member SET point = ? WHERE id = ?', [userPoint - total, userId]);

    res.status(200).json({ message: '결제 완료' });
  } catch (error) {
    console.error('주문 저장 중 오류 발생:', error);
    res.status(500).json({ message: '결제 실패' });
  }
};
