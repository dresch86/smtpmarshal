import { google } from 'googleapis';
import gConfig from '../config.js';

export default class GoogleUserClient {
    userEmail = '';
    jwtUserKey = null;
    
    constructor(userEmail) {
        this.userEmail = userEmail;
        this.jwtUserKey = new google.auth.JWT({    
            email: gConfig.credentials.client_email,
            key: gConfig.credentials.private_key,
            keyId: gConfig.credentials.private_key_id,
            scopes: 
            [
                'https://www.googleapis.com/auth/gmail.send'
            ],
            subject: userEmail
        }
      );
    }

    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            this.jwtUserKey.authorize().then(credentials => {
                const gmail = google.gmail({
                    version: 'v1',
                    auth: this.jwtUserKey
                });

                gmail.users.messages.send({
                    userId: this.userEmail,
                    requestBody: {
                        raw: Base64.encodeURI(message)
                    }
                })
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }
}