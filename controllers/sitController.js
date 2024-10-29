const db = require('../config/db');
require('dotenv').config();

// 시터 리스트 조회
exports.getSitterList = async (req, res) => {
  const { weekdays, startTime, endTime } = req.query;
  const searchDays = weekdays ? weekdays.split(',') : [];
  const dayConditions = searchDays.map((day) => `FIND_IN_SET('${day}', weekdays) > 0`).join(' OR ');

  let query = `SELECT * FROM sitter`;
  const conditions = [];

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
            member.name AS name,
            member.profile_image_url AS sitter_profile_image
        FROM 
            reservation
        JOIN 
            member ON reservation.sitter_id = member.id
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
            member.profile_image_url AS sitter_profile_image
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

//예약내역 삭제
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
