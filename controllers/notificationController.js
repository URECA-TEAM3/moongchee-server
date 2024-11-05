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

exports.saveNotification = async (req, res) => {
    const { sending_name, receive_id, receive_name, type, status } = req.body;
  
    try {
        const query = `INSERT INTO notification (sending_name, receive_id, receive_name, type, status) VALUES (?, ?, ?, ?, ?)`;
        const values = [sending_name, receive_id, receive_name, type, status];
        const [result] = await db.query(query, values);
    
        res.status(200).json({ message: '알림 저장 성공'});
        } catch (error) {
        console.error('결제 정보 임시 저장 오류:', error);
    }
};