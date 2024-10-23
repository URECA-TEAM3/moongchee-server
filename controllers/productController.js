const db = require('../config/db');

// 모든 상품 조회
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM product');
    res.status(200).json({ message: '상품 조회 성공', data: products });
  } catch (error) {
    console.error('상품 조회 오류:', error);
    res.status(500).json({ message: '상품 조회 실패' });
  }
};
