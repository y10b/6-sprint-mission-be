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
            PORT: 5000
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