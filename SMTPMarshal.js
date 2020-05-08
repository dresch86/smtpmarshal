import mariadb from 'mariadb';
import * as log4js from 'log4js';
import MailGovernor from './utilities/MailGovernor';
import GoogleUserClient from './utilities/GoogleUserClient';
import GoogleAdminClient from './utilities/GoogleAdminClient';

const Logger = log4js.getLogger('SMTPMarshal');

export default class SMTPMarshal {
    appConfig = null;
    mgThrottleHandler = null;
    gcGoogleAdminHandler = null;

    constructor(cfg) {
        this.appConfig = cfg;
        this.gcGoogleAdminHandler = new GoogleAdminClient();

        this.dbpDBPool = mariadb.createPool({
            host: this.appConfig.db.host, 
            database: this.appConfig.db.name,
            user: this.appConfig.db.user, 
            password: this.appConfig.db.password,
            connectionLimit: 10
        });

        this.mgThrottleHandler = new MailGovernor(this.dbpDBPool);
    }

    async onAuth(auth, session, callback) {
        try {
            let boolUserExists = await this.gcGoogleAdminHandler.userExists(auth.username);

            if (boolUserExists) {
                if (this.appConfig.server.password == auth.password) {
                    Logger.info('Authenticated user [' + auth.username + ']');
                    return callback(null, {user: auth.username});
                } else {
                    Logger.warn('User authentication failed [' + auth.username + ']');
                    return callback(new Error('Bad authentication credentials'));
                }
            } else {
                Logger.error('User not found [' + auth.username + ']');
                return callback(new Error('User ' + address.address + ' does not exist in our system!'));
            }
        } catch (error) {
            Logger.fatal(error);
            return callback(error);
        }
    }

    async onMailFrom(address, session, callback) {
        // Username and fromAddress should be the same to avoid spoofed message errors
        if (address.address == session.user) {
            Logger.info('Mail accepted from sender [' + address.address + ']');
            return callback();
        } else {
            let sError = 'Mail rejected from sender [' + address.address + '] due to authentication mismatch [' + session.user + ']';
            Logger.warn(sError);
            return callback(new Error(sError));
        }
    }

    onData(stream, session, callback) {
        let iMessageLength = 0;
        let sMessage = '';
        
        stream.on('data', chunk => {
            iMessageLength += chunk.length;
            sMessage += chunk;
        });

        stream.on('end', async () => {
            let sFromAddress = session.envelope.mailFrom.address;

            try {
                if (!await this.mgThrottleHandler.throttled(sFromAddress)) {
                    Logger.trace('Sending message from ' + sFromAddress + '...');
                    let boolSendResult = false;

                    if (sFromAddress == this.appConfig.adminEmail) {
                        boolSendResult = await this.gcGoogleAdminHandler.sendMessage(sMessage);
                    } else {
                        let gclUserTokenHandler = new GoogleUserClient(sFromAddress);
                        boolSendResult = await gclUserTokenHandler.sendMessage(sMessage);
                    }
    
                    if (boolSendResult) {
                        let aQueryVals = [];
                        let conDBHandle = null;

                        session.envelope.rcptTo.forEach(recipent => {
                            aQueryVals.push([sFromAddress, recipent.address]);
                        });

                        try {
                            conDBHandle = await this.dbpDBPool.getConnection();
                            await conDBHandle.beginTransaction();

                            let resQueryRes = await conDBHandle.batch('INSERT INTO `sentlog` (`from`, `to`) VALUES(?, ?)', aQueryVals);

                            if (resQueryRes.affectedRows >= 1) {
                                Logger.info('Transaction appended to send log [@id=' + resQueryRes.insertId + ']');
                            } else {
                                Logger.warn('Message sent but logging [SQLSTATUS=' + resQueryRes.warningStatus + '] failed');
                            }

                            conDBHandle.commit();
                        } catch (error) {
                            if (conDBHandle) conDBHandle.rollback();
                            Logger.error(error.message);
                        } finally {
                            if (conDBHandle) conDBHandle.release();
                            Logger.trace('Connection released');
                        }
                        
                        this.mgThrottleHandler.increment(sFromAddress);
                        return callback();
                    } else {
                        Logger.error('Sending error [' + sFromAddress + ']');
                        return callback(new Error('E-mail from ' + sFromAddress + ' failed to send'));
                    }
                } else {
                    //TODO Queue the email in the database until throttle resets
                    return callback();
                }
            } catch (error) {
                Logger.error(error);
                return callback(error);
            }
        });
    }
}