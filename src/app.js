const express = require("express")
const router = require("./modules")
const cors = require("cors")
const app = express()
const PORT = 5000

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions))
app.use(express.json())
app.use(router)//index.js의 라우터 이용

app.listen(PORT, () => {
    console.log(`서버가 작동 중입니다. ${PORT}`)
})