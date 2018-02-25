const nodemailer = require('nodemailer');
const SMTPTransport = require('nodemailer-smtp-transport');
const stubTransport = require('nodemailer-stub-transport');

const htmlToText = require('nodemailer-html-to-text').htmlToText;

let mailTransport = null;
let from = '';
//https://www.youtube.com/watch?v=JJ44WA_eV8E
//https://www.youtube.com/watch?v=nF9g1825mwk

const createTransport = (options) => {
    if (process.env.NODE_ENV === 'test')
        mailTransport = nodemailer.createTransport(stubTransport());
    else{
        mailTransport = nodemailer.createTransport(new SMTPTransport({
            host: options.host,
            secure: options.secure, // use SSL
            port: options.port,
            auth: {
                user: options.user,
                pass: options.pass
            }/*,
            tls: { //for lochalhost only
                rejectUnauthorized: false
            }*/
        }));

        from = options.email;
        mailTransport.use('compile', htmlToText());
    }
};

const sendMail = (message) => {
    message.from = from;
    /*message = {
        from: 'sergiy@qubyx.com',
        to: 'darkbrother@ukr.net',
        subject: 'Message title',
        text: 'Plaintext version of the message',
        html: '<p>HTML version of the message</p>'
    };*/

    if (!mailTransport)
        return Promise.reject(new Error('mailTransport is null. Please create mailTransport first'));
    else
        return mailTransport.sendMail(message);
}

module.exports = {
    createTransport,
    sendMail
};
