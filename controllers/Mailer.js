'use strict';

/**
 * Mailer.js controller
 *
 * @description: A set of functions called "actions" of the `mailer` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.
    let orderId = ctx.params.id;

    let order = await Orders.findOne({_id: orderId});
    
    let message = `<h3>[Order]</h3>
                  <p>Serial: ${order.serial}</p>
                  <p>Payment Method: ${order.meta.payment}</p>
                  <br/>
                  <h3>[User]</h3>
                  <p>Name: ${order.user.meta.name}</p>
                  <p>Batch: ${order.user.meta.batch}</p>
                  <p>Email: ${order.user.meta.email}</p>
                  <p>Phone: ${order.user.meta.phone}</p>
    `;

    console.log(order);
    console.log(message);
    let mail = await strapi.plugins.mailer.services.mailer.sendMail("bitesizedigitalgroup@gmail.com", "mindlesh13@gmail.com", "Magis Watch Payment Update", message);

    // Send 200 `ok`
    ctx.send({
      message: mail
    });
  }
};
