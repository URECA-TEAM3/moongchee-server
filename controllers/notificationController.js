const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    const { id: userId } = req.params;
    const numericUserId = parseInt(userId, 10);

    try {
        const [result] = await db.query('SELECT * FROM notification WHERE receive_id = ? AND status = ?', [numericUserId, 'unread']);
        res.status(200).json({message: '알람 조회 성공', data: result});
    } catch (error) {
        console.error('알람 조회 오류 : ', error);
        res.status(500).json({message: '알람 조회 실패'});
    }
};

exports.updateNotiStatus = async (req, res) => {
    const { id, status } = req.body;

    try {
        const [result] = await db.query(`
            UPDATE notification SET status = ? WHERE receive_id = ?
            `, [status, id]);
    } catch (error) {
        console.error(error);
    }
}