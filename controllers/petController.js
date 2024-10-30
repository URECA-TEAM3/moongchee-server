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

// 회원별 반려동물 리스트 조회
exports.getPet = async (req, res) => {
  const userId = req.params.id;
  try {
    const [pets] = await db.query('SELECT * FROM pet WHERE user_id = ?', [userId]);
    res.status(200).json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "반려동물 조회 실패"})
  }
}

// 반려동물별 정보 조회
exports.getPetDetail = async (req, res) => {
  const petId = req.params.id;
  try {
    const pet = await db.query('SELECT * FROM pet WHERE id=?', [petId]);
    res.status(200).json(pet[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "반려동물 정보 조회 실패"})
  }
}