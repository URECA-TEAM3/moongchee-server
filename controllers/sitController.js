const db = require('../config/db');
require('dotenv').config();

// 시터 리스트 조회
exports.getSitterList = async (req, res) => {
  const { weekdays, startTime, endTime, userId } = req.query;
  const searchDays = weekdays ? weekdays.split(',') : [];
  const dayConditions = searchDays.map((day) => `FIND_IN_SET('${day}', weekdays) > 0`).join(' OR ');

  let query = `SELECT * FROM sitter`;
  const conditions = [];

  if (userId) {
    conditions.push(`userId != ${db.escape(userId)}`);
  }

  if (dayConditions) {
    conditions.push(`(${dayConditions})`);
  }

  if (startTime && endTime) {
    conditions.push(`startTime <= '${startTime}'`);
    conditions.push(`endTime >= '${endTime}'`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  try {
    const [sitters] = await db.query(query);
    res.status(200).json({ message: 'list called succesfully', data: sitters });
  } catch (error) {
    console.error('list calling error:', error);
    res.status(500).json({ message: 'failed' });
  }
};

// 시터 상세 조회
exports.getSitterByUserId = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const [sitter] = await db.query(`SELECT * FROM sitter WHERE userId = ?`, [id]);

    if (sitter.length === 0) {
      return res.status(404).json({ message: 'Sitter not found' });
    }

    res.status(200).json({ message: 'Sitter data retrieved successfully', data: sitter[0] });
  } catch (error) {
    console.error('Error fetching sitter data:', error);
    res.status(500).json({ message: 'Failed to retrieve sitter data' });
  }
};

//시터 지원
exports.applySitter = async (req, res) => {
  const { userId, name, image, region, description, experience, startTime, endTime, weekdays } = req.body;

  if (!userId || !name || !image || !region || !description || !experience || !startTime || !endTime || !weekdays) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    const [existingSitter] = await db.query(`SELECT * FROM sitter WHERE userId = ?`, [userId]);

    if (existingSitter.length > 0) {
      return res.status(409).json({ message: '이미 펫시터로 신청한 계정입니다.' });
    }

    const [result] = await db.query(
      `INSERT INTO sitter (userId, name, image, region, description, experience, startTime, endTime, weekdays, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [userId, name, image, region, description, experience, startTime, endTime, weekdays]
    );

    await db.query(`UPDATE member SET petsitter = 1 WHERE id = ?`, [userId]);

    res.status(200).json({ message: '펫시터 신청이 성공적으로 완료되었습니다.', sitterId: result.insertId });
  } catch (error) {
    console.error('펫시터 신청 에러:', error);
    res.status(500).json({ message: '펫시터 신청에 실패했습니다.' });
  }
};

exports.updateSitterByUserId = async (req, res) => {
  const { userId, name, image, region, description, experience, startTime, endTime, weekdays, status } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId는 필수입니다.' });
  }

  try {
    const [result] = await db.query(
      `UPDATE sitter SET name = ?, image = ?, region = ?, description = ?, experience = ?, startTime = ?, endTime = ?, weekdays = ?, status = ? WHERE userId = ?`,
      [name, image, region, description, experience, startTime, endTime, weekdays, status, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '해당 userId를 가진 시터를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '시터 정보가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('시터 정보 수정 에러:', error);
    res.status(500).json({ message: '시터 정보 수정에 실패했습니다.' });
  }
};

// 예약 전체 조회
exports.getUserReservations = async (req, res) => {
  const { user_id, user_type } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  if (user_type === 'user') {
    try {
      const [reservations] = await db.query(
        `
        SELECT 
            reservation.id AS reservation_id,
            reservation.user_id,
            reservation.sitter_id,
            reservation.requestDate,
            reservation.startTime,
            reservation.endTime,
            reservation.status,
            reservation.price,
            sitter.name AS name,
            sitter.image AS profile_image
        FROM 
            reservation
        JOIN 
            sitter ON reservation.sitter_id = sitter.id
        WHERE 
            reservation.user_id = ?;
      `,
        [user_id]
      );

      res.status(200).json({ message: 'Reservations fetched successfully', data: reservations });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ message: 'Failed to fetch reservations' });
    }
  } else {
    try {
      const [reservations] = await db.query(
        `
        SELECT 
            reservation.id AS reservation_id,
            reservation.user_id,
            reservation.sitter_id,
            reservation.requestDate,
            reservation.startTime,
            reservation.endTime,
            reservation.status,
            member.name AS name,
            member.profile_image_url AS profile_image
        FROM 
            reservation
        JOIN 
            member ON reservation.user_id = member.id
        WHERE 
            reservation.sitter_id = ?;
      `,
        [user_id]
      );

      res.status(200).json({ message: 'Reservations fetched successfully', data: reservations });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ message: 'Failed to fetch reservations' });
    }
  }
};

// 예약내역 상세조회
exports.getReservationWithDetails = async (req, res) => {
  const reservation_id = req.params.id;

  try {
    const [reservation] = await db.query(
      `
      SELECT 
        reservation.id AS reservation_id,
        reservation.user_id,
        reservation.sitter_id,
        reservation.requestDate,
        reservation.startTime,
        reservation.endTime,
        reservation.status,
        detail.request,
        detail.dogSize,
        detail.workingTime,
        detail.price,
        detail.pet
      FROM reservation
      JOIN reservation_details detail ON reservation.id = detail.reservation_id
      WHERE reservation.id = ?
    `,
      [reservation_id]
    );

    if (reservation.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json({ data: reservation[0] });
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    res.status(500).json({ message: 'Failed to fetch reservation details' });
  }
};

// 예약내역 추가
exports.createReservationWithDetails = async (req, res) => {
  const { user_id, sitter_id, requestDate, startTime, endTime, status, request, dogSize, pet, workingTime, price } = req.body;
  console.log(price);

  if (!user_id || !sitter_id || !requestDate || !startTime || !endTime || !price) {
    return res.status(400).json({ message: 'All main fields are required.' });
  }

  try {
    const [reservationResult] = await db.query(
      `INSERT INTO reservation (user_id, sitter_id, requestDate, startTime, endTime, status, price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, sitter_id, requestDate, startTime, endTime, status || 'reserved', price]
    );

    const reservationId = reservationResult.insertId;

    await db.query(`INSERT INTO reservation_details (reservation_id, request, dogSize, pet, workingTime, price) VALUES (?, ?, ?, ?, ?, ?)`, [
      reservationId,
      request,
      dogSize,
      pet,
      workingTime,
      price,
    ]);

    res.status(200).json({ message: 'Reservation with details created successfully', reservationId });
  } catch (error) {
    console.error('Error creating reservation with details:', error);
    res.status(500).json({ message: 'Failed to create reservation with details' });
  }
};

// 예약 확정
exports.confirmReservation = async (req, res) => {
  const { reservation_id } = req.body;

  if (!reservation_id) {
    return res.status(400).json({ message: 'reservation_id is required' });
  }

  try {
    const result = await db.query(`UPDATE reservation SET status = 'confirmed' WHERE id = ?`, [reservation_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json({ message: 'Reservation confirmed successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Failed to confirm reservation' });
  }
};

// 예약내역 삭제
exports.cancelReservation = async (req, res) => {
  const { reservation_id } = req.body;

  if (!reservation_id) {
    return res.status(400).json({ message: 'reservation_id is required' });
  }

  try {
    const result = await db.query(`UPDATE reservation SET status = 'cancelled' WHERE id = ?`, [reservation_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Failed to cancel reservation' });
  }
};

exports.getSitterInfoById = async (req, res) => {
  // const { userId } = req.params.id;
  // console.log(req.params.id);

  try {
    const [result] = await db.query(`SELECT * FROM sitter WHERE userId=?`, [req.params.id]);
    res.status(200).json({message: '펫시터 정보 조회 성공', data: result})
  } catch (error) {
    console.error(error);
  }
}