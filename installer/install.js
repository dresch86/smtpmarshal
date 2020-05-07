import path from 'path';
import * as log4js from 'log4js';
import * as appCfg from '../config';
import Importer from 'mysql-import';

log4js.configure({
    appenders: { main: { type: 'file', filename: (path.resolve(__dirname, 'log', 'install.log')) } },
    categories: { default: { appenders: ['main'], level: 'info' } }
});  

const Logger = log4js.getLogger('SMTPMarshalInstaller');
var conDBHandle;

(async () => {
    try {
        const impSQLHandler = new Importer({
            host: appCfg.db.host, 
            user: appCfg.db.user, 
            password: appCfg.db.password, 
            database: appCfg.db.name
        });
    
        await impSQLHandler.import(path.resolve(__dirname, 'smtpmarshal.sql'));
        Logger.info('Database installed successfully');
    } catch (err) {
        Logger.fatal(err.message);
    } finally {
        // release to pool
        if (conDBHandle) conDBHandle.release();
        Logger.info('Database connection closed');
    }
})();