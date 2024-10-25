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

// 인기 상품 조회
exports.getPopularProducts = async (req, res) => {
  try {
    const query = `
      SELECT * FROM product
      ORDER BY sales DESC
      LIMIT 4
    `;

    const [popularProducts] = await db.query(query);
    res.status(200).json({ message: '상위 4개 판매 상품 조회 성공', data: popularProducts });
  } catch (error) {
    console.error('인기 상품 조회 오류:', error);
    res.status(500).json({ message: '인기 상품 조회 실패' });
  }
};

// 새로운 상품 조회
exports.getNewProducts = async (req, res) => {
  try {
    const query = `
      SELECT * FROM product
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const [newProducts] = await db.query(query);
    res.status(200).json({ message: '새로운 상품 조회 성공', data: newProducts });
  } catch (error) {
    console.error('새로운 상품 조회 오류', error);
    res.status(500).json({ message: '새로운 상품 조회 실패' });
  }
};
