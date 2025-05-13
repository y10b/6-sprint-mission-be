export const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
};
