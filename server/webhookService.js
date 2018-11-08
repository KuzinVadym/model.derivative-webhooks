
var token = require('./token');
let request = require('request');

class WebhookService {
  constructor(session) {
    this.hooks = [];
    this.session = session;
  }

  //add new webhook
  registerHook(hook) {
    return new Promise((resolve, reject) => {
      console.log('register webhook');
      let tokenSession = new token(this.session);

      let webhook = {
        callbackUrl: hook.callbackURL,
        scope: {
          workflow: `workflow-${hook.workflow}`
        }
      }

      tokenSession.getTokenInternal(function (tokenInternal) {
        request({
          url: `https://developer.api.autodesk.com/webhooks/v1/systems/derivative/events/${hook.type}/hooks`,//  extraction.finished for example
          method: "POST",
          headers: {
            'Authorization': 'Bearer ' + tokenInternal.access_token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(webhook)
        }, function (error, response, body) {
          if(response.statusCode === 201) {
            console.log('successfully');
            resolve({
              status: 'success',
              message: 'Webhook successfully created!'
            })
          } else {
            console.log('failed');
            const message = (body) ? JSON.parse(body).detail[0] : "Unknown error during webhook creation";
            reject({
              status: 'failed',
              message: message
            })
          }
        });
      });
    });
  }

  //delete webhook
  deleteHook(hook) {
    return new Promise((resolve, reject) => {
      console.log('delete webhook');
      let tokenSession = new token(this.session);
      let url = `https://developer.api.autodesk.com/webhooks/v1/systems/${hook.system}/events/${hook.event}/hooks/${hook.hookId}`; //  extraction.finished for example for event
      tokenSession.getTokenInternal(function (tokenInternal) {
        request({
          url: url,
          method: "DELETE",
          headers: {
            'Authorization': 'Bearer ' + tokenInternal.access_token,
          }
        }, function (error, response, body) {
          if(response.statusCode === 204) {
            console.log('successfully');
            resolve();
          } else {
            console.log('failed');
            reject({
              status: 'failed',
              message: `Failed to delete ${hook.hookId} webhook`
            })
          }
        });
      });

    });
  }

  getAllHooks() {
    return new Promise((resolve, reject) => {
      console.log('get all webhooks');
      let tokenSession = new token(this.session);

      tokenSession.getTokenInternal(function (tokenInternal) {
        request({
          url: 'https://developer.api.autodesk.com/webhooks/v1/systems/derivative/hooks',//  extraction.finished for example
          method: "GET",
          headers: {
            'Authorization': 'Bearer ' + tokenInternal.access_token,
            'Content-Type': 'application/json'
          }
        }, function (error, response, body) {
          if(response.statusCode === 200) {
            resolve(JSON.parse(body).data)
          } else {
            reject({
              status: 'failed',
              message: 'Failed to get All Webhooks'
            })
          }
        });
      });
    });
  }

}

module.exports =  WebhookService;