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

// 반려동물 정보 수정
exports.updateProfile = async (req, res) => {
  const {id, name, age, gender, surgery, weight, animal_image_url} = req.body;

  if (!id) {
    return res.status(400).json('유효한 반려동물 ID가 필요합니다.');
  }

  try {
    const query = `
      UPDATE pet
      SET name=?, age=?, gender=?, surgery=?, animal_image_url=?, weight=?
      WHERE id=?
    `;

    const values = [name, age, gender, surgery, animal_image_url, weight, id];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "반려동물을 찾을 수 없습니다." });
    }

    // 업데이트된 반려동물 데이터 반환
    res.status(200).json({
      id,
      age,
      name,
      surgery,
      weight,
      gender,
    });
  } catch (error) {
    console.error('반려동물 정보 업데이트 오류 : ', error);
    res.status(500).json({ message: '업데이트에 실패했습니다.' });
  }
}

// 반려동물 삭제
exports.deletePet = async (req, res) => {
  const petId = req.params.id;

  try {
    const query = 'DELETE FROM pet WHERE id=?';
    const [result] = await db.query(query, [petId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "반려동물을 찾을 수 없습니다." });
    } res.status(200).json({ message: "반려동물 정보가 삭제되었습니다." });
  } catch (error) {
    console.error('반려동물 정보 삭제 오류:', error);
    res.status(500).json({ message: "반려동물 삭제에 실패했습니다." });
  }
}