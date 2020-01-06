'use strict';

/**
 * Mailer.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */
const nodemailer = require('nodemailer');
const {addDays, format} = require('date-fns');

module.exports = {
    sendMail: async (from, to, subject, msg) => {
        const config = strapi.config.email;
        let auth={};

        if(config.authType === 'OAuth2') {
            auth = {
                type: 'OAuth2',
                user: config.user,
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                refreshToken: config.refreshToken,
                accessToken: config.accessToken
            };
        } else {
            auth = {
                user: config.user,
                pass: config.password
            }
        }

        let transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            requireTLS: true, //Force TLS
            tls: {  
                rejectUnauthorized: false
            },
            auth: auth
        });

        let res;
        console.log("Sending mail..");
        let _from = from;
        if(config.displayName) {
            _from = `${config.displayName} <${from}>`;
        }
       var _sendMail = new Promise(function(resolve, reject) {
            transporter.sendMail({
                from: _from,
                to: to,
                subject: subject,
                html: msg,
            }, (error, response) => {
                transporter.close();
                error ? reject(error) : resolve(response);
            });
        });

        try {
            res = await _sendMail;
            return res;
        } catch(err) {
            console.log(err);
            return err;
        }
    },

    sendMailOrder: async (id) => {

    const config = strapi.config.email;
    let order = await Orders.findOne({_id: id});
    let rec;
    let message = `
                  <h3>[User]</h3>
                  <p>Name: ${order.user.meta.name}</p>
                  <p>Batch: ${order.user.meta.batch}</p>
                  <p>Email: ${order.user.meta.email}</p>
                  <p>Phone: ${order.user.meta.phone}</p>
                  <br/>
                  <h3>[Order]</h3>
                  <p>Serial: ${order.serial}</p>
                  <p>Payment Method: ${order.meta.payment}</p>
                  
    `;
    if(order.meta.payment === "PAYMAYA") {
        rec = config.paymaya;
        let payment = await Payments.findOne({orderId: id});
        console.log(payment);
        message = `${message}
            <br/>
            <h3>[Payment] PAYMAYA</h3>
            <p>Pay ID: ${payment.payID}</p>
            <p>Date: ${payment.date}</p>
        `;
    } else {
        rec = config.deposit;
        message = `${message}
            <br/>
            <h3>[Payment] BANK DEPOSIT</h3>
            <p>Ref No.: ${order.proof.ref}</p>
            <p>Date: ${order.proof.date}</p>
            <p>Photo: </p>
            <img src='${order.proof.photo}' />
        `
    }
        let mail = await strapi.plugins.mailer.services.mailer.sendMail(config.user, rec, "Magis Watch Payment Update", message);
    },
    sendMailBankConfirm: async (id) => {
        const config = strapi.config.email;
        let order = await Orders.findOne({_id: id});
        const _date = addDays(new Date(order.date), 5);
        let message = 
        `Dear <b>${order.user.meta.name}</b>,

        <p>Your reservation for 1pc Limited Edition Magis Watch with serial number <b>${order.serial}</b> is confirmed.</p>

        <p>Please complete payment within 5 days and send details of your payment through this link: <a href="http://magiswatch.com/orders">magiswatch.com/orders</a> or you may go to our website <a href="http://magiswatch.com">MAGISWATCH.COM</a> and update your payment on the My Orders Page. Your reservation will be waived automatically if you are unable to complete payment by ${format(_date, "MMMM dd, yyyy")}.</p>
        <br/>
        <p>Sincerely,</p>

        <p style="margin: 0;">Joseph Gaisano, Jr.</p>
        <p style="margin: 0;">Alumni Batch 96 President</p>`;
        let mail = await strapi.plugins.mailer.services.mailer.sendMail(config.user, order.user.meta.email, "Magis Watch Reservation", message);
    },
    sendMailPaymayaConfirm: async (id) => {
        const config = strapi.config.email;
        let order = await Orders.findOne({_id: id});
        let message = 
        `Dear <b>${order.user.meta.name}</b>,

        <p>Thank you for your support and for purchasing your Limited Edition Magis Watch. You have just taken part of SHS-AdC history for owning one of the first 300 Magis Watches ever made.</p>

        <p>We will be sending you an update when your watch will be ready.</p>

        <p>Again, thank you for your support.</p>
        <br/>
        <p>Sincerely,</p>

        <p style="margin: 0;">Joseph Gaisano, Jr.</p>
        <p style="margin: 0;">Alumni Batch 96 President</p>`;
        let mail = await strapi.plugins.mailer.services.mailer.sendMail(config.user, order.user.meta.email, "Magis Watch Payment Confirmation", message);
    }

};
