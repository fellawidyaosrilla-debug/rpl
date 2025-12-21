const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMyNotif = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil notif terbaru (urut dari yang paling baru)
        const notifs = await prisma.notifikasi.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ status: 'success', data: notifs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    // Fitur tambahan: Tandai sudah dibaca (opsional untuk nanti)
    try {
        await prisma.notifikasi.updateMany({
            where: { userId: Number(req.user.id), isRead: false },
            data: { isRead: true }
        });
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};