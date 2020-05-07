module.exports = {
    transporter: {
        port: 25,
        host:'127.0.0.1',
        secure: false,
        ignoreTLS: true,
        auth: {
            user: 'userToImpersonate@mydomain.com',
            pass: 'smtpmarshalPassword!'
        }
    },
    send: {
        to: 'Someone Else <someoneElse@mydomain.com>',
        from: 'User Impersonates <userToImpersonate@mydomain.com>',
        subject: 'SMTPMarshal Test',
        text: 'Did the email send correctly?'
    }
}