module.exports = {
    domain: "mydomain.com",
    adminEmail: "info@mydomain.com",
    adminName: "System Admin",
    logging: {
        pm2: false,
        level: 'error',
        path: '/var/log/smtpmarshal.log'
    },
    server: {
        port: 25,
        address: "127.0.0.1",
        hostname: "localhost",
        password: "password123!"
    },
    db: {
        name: "smtpmarshal",
        user: "smtpmarshal",
        password: "mypass123!",
        host: "localhost"
    },
    credentials: 
    {
        type: "service_account",
        project_id: "PROJECT_ID",
        private_key_id: "PRIVATE_KEY_ID",
        private_key: "SAFE GUARD THIS PRIVATE KEY",
        client_email: "service-account@email-address",
        client_id: "CLIENT_ID_NUM",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/the-service-acct-url"
    }
}