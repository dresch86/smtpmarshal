import * as cfg from './config';
import nodemailer from 'nodemailer';

(async () => {
    try {
        let transporter = nodemailer.createTransport(cfg.transporter);
        let info = await transporter.sendMail(cfg.send);
        console.log(info);
    } catch (err) {
        console.error(err.message);
    }
})();