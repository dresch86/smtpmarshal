import * as log4js from 'log4js';
import { SMTPServer } from 'smtp-server';

import * as appCfg from './config.js';
import SMTPMarshal from './SMTPMarshal.js';

log4js.configure({
    appenders: { main: { type: 'file', filename: appCfg.logging.path } },
    categories: { default: { appenders: ['main'], level: appCfg.logging.level } },
    pm2: appCfg.logging.pm2
});  

global.Base64 = {
    encode: function(str) {
      return Buffer.from(str).toString('base64');
    },
    encodeURI: function(str) {
        return Buffer.from(str).toString('base64');
    }
};

const Logger = log4js.getLogger('SMTPMarshal');
const SMTPController = new SMTPMarshal(appCfg);

const smtpCfg = {
    name: appCfg.server.hostname,
    secure: false,
    authMethods: ['LOGIN'],
    disabledCommands: ['STARTTLS'],
    onAuth: (auth, session, callback) => SMTPController.onAuth(auth, session, callback),
    onMailFrom: (address, session, callback) => SMTPController.onMailFrom(address, session, callback),
    onData: (stream, session, callback) => SMTPController.onData(stream, session, callback)
};

const server = new SMTPServer(smtpCfg);

server.on('error', err => {
    Logger.error(err.message);
    process.exit();
});

server.listen(appCfg.server.port, appCfg.server.address, () => {
    Logger.info('SMTP Marshal Listening...');
    console.log('SMTP Marshal Listening...');
});