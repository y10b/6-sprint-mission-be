export const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const filePath = `/uploads/${req.file.filename}`;  // 클라이언트에게 제공할 경로
    res.status(200).json({ imagePath: filePath });
};
