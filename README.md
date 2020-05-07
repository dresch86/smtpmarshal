# SMTPMarshal
This program is a simple passthrough service (not full server) that listens for incoming SMTP messages, and hands them off to the Gmail API for actual sending. With Google's annoucement that on June 1st, the "Allow Less Secure Apps" feature will start to be phased out, an intermediate interface with the Gmail API for legacy services can be useful. SMTPMarshal thus helps to avoid a full integration or recode of the legacy service using Gmail API at least in the shortrun.

**Note:** The SMTPMarshal service should **ONLY** be run on **the loopback interface** to avoid public access. 

## Getting Started
### Prerequisites
- Windows, MacOS, Linux
- NodeJS
- Administrator Privileges
- PM2 (Optional)

### Installing
1. Clone the repository
2. ```cd smtpmarshal```
3. ```(p)npm install```
4. Create a copy of the sample config file and name it config.js
5. Edit the config.js file, and add your credentials / settings
6. Make sure correct permissions are set on the config.js file since it contains private credentials
7. ```(p)npm run setup.db```
8. ```(p)npm run server``` OR ```pm2 start ecosystem.config.js```

## Future Goals:
- [ ] Add throttling functionality
- [ ] Add interface for configuration and logging