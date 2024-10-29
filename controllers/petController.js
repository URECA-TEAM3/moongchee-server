const db = require('../config/db');

exports.registerPet = async (req, res) => {
  const { userId, name, age, weight, species, gender, surgery, animalImageUrl } = req.body;
  console.log('받은 요청 데이터:', req.body);

  if (!userId || !name || !age || !weight || !species || !gender) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    const query = `
        INSERT INTO pet (user_id, name, age, weight, species, gender, surgery, animal_image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
    const values = [userId, name, age, weight, species, gender, surgery, animalImageUrl];

    const [result] = await db.query(query, values);

    res.status(201).json({ message: '반려동물 정보 저장 성공', petId: result.insertId });
  } catch (error) {
    console.error('반려동물 정보 저장 오류:', error);
    res.status(500).json({ message: '반려동물 정보 저장 실패' });
  }
};
