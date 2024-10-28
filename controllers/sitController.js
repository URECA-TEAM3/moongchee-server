const db = require('../config/db');
require('dotenv').config();

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
