// token handling in session
const request = require('request');

// web framework
const express = require('express');
const url = require('url');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const WS = require('./webhookService')

router.post('/register', jsonParser, function (req, res) {
  let WebhookService = new WS(req.session);
  console.log(req.body);
  WebhookService.registerHook(req.body.webhook).then(result => {
    res.status(200).json(result);
  })
  .catch(err => {
    res.status(200).json(err);
  });
});

router.get('/getall', function (req, res) {
  let WebhookService = new WS(req.session);
  WebhookService.getAllHooks().then(result => {
    res.status(200).json(result);
  })
  .catch(err => {
    console.log(err);
    res.status(200).json(err);
  });
});

router.post('/delete', jsonParser, function (req, res) {
  let WebhookService = new WS(req.session);
  WebhookService.deleteHook(req.body).then(result => {
    res.status(200).json({status: 'success'});
  })
  .catch(err => {
    res.status(200).json(err);
  });
});

module.exports = router;