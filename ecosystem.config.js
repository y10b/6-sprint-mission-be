module.exports = {
    apps: [{
        name: 'pandamarket-api',
        script: 'dist/app.js', // 빌드된 파일 경로
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
            PORT: 5000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 5000,
            DATABASE_URL: process.env.DATABASE_URL,
            JWT_SECRET: process.env.JWT_SECRET,
            JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
            AWS_REGION: process.env.AWS_REGION,
            AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
            CORS_ORIGINS: process.env.CORS_ORIGINS
        },

        // 로그 설정
        log_file: './logs/combined.log',
        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

        // 재시작 정책
        min_uptime: '10s',
        max_restarts: 10,
        restart_delay: 4000,

        // 에러 발생 시 재시작 대기시간
        exp_backoff_restart_delay: 100,

        // 클러스터 모드 (필요시)
        // instances: 'max',
        // exec_mode: 'cluster'
    }]
};