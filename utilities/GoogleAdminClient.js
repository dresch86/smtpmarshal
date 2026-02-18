import { Base64 } from 'js-base64';
import { google } from 'googleapis';
import gConfig from '../config.js';

export default class GoogleAdminClient {
    jwtAdminKey = null;
    
    constructor() {
        this.jwtAdminKey = new google.auth.JWT({    
            email: gConfig.credentials.client_email,
            key: gConfig.credentials.private_key,
            keyId: gConfig.credentials.private_key_id,
            scopes: 
            [
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/admin.directory.user.readonly',
                'https://www.googleapis.com/auth/admin.directory.group.readonly'
            ],
            subject: gConfig.adminEmail
        }
      );
    }

    async userExists(email) {
        return new Promise((resolve, reject) => {
            this.jwtAdminKey.authorize().then(credentials => {
                const gDirectory = google.admin({version: 'directory_v1', auth: this.jwtAdminKey});
                gDirectory.users.get({userKey: email}).then(result => {
                    if (result.status == 200) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(err => {
                    resolve(false);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }

    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            this.jwtAdminKey.authorize().then(credentials => {
                const gmail = google.gmail({
                    version: 'v1',
                    auth: this.jwtAdminKey
                });

                gmail.users.messages.send({
                    userId: gConfig.adminEmail,
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