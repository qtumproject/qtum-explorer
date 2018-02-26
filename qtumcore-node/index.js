'use strict';

var BaseService = require('./service');
var inherits = require('util').inherits;
var fs = require('fs');

var InsightUI = function(options) {
  BaseService.call(this, options);

  var packageJSON = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));

  this.packageVersion = packageJSON.version;

  if (typeof options.apiPrefix !== 'undefined') {
    this.apiPrefix = options.apiPrefix;
  } else {
    this.apiPrefix = 'qtum-insight-api';
  }
  if (typeof options.routePrefix !== 'undefined') {
    this.routePrefix = options.routePrefix;
  } else {
    this.routePrefix = 'insight';
  }

  if (typeof options.nodemapLink !== 'undefined') {
      this.nodemapLink = options.nodemapLink;
  } else {
      this.nodemapLink = '';
  }

  this.network = options.node.network;

};

InsightUI.dependencies = ['qtum-insight-api'];

inherits(InsightUI, BaseService);

InsightUI.prototype.start = function(callback) {
  this.indexFile = this.filterIndexHTML(fs.readFileSync(__dirname + '/../public/index.html', {encoding: 'utf8'}));
  this.underAttackFile = this.filterIndexHTML(fs.readFileSync(__dirname + '/../public/under-attack.html', {encoding: 'utf8'}));
  setImmediate(callback);
};

InsightUI.prototype.getRoutePrefix = function() {
  return this.routePrefix;
};

InsightUI.prototype.setupRoutes = function(app, express) {
  var self = this;

  app.get('/under-attack', function(req, res) {

      res.setHeader('Content-Type', 'text/html');

      return res.send(self.underAttackFile);

  });

  app.use(express.static(__dirname + '/../public', {index: false}));

  app.use('/', function(req, res){

    if (req.headers.accept && req.headers.accept.indexOf('text/html') !== -1 && req.headers["X-Requested-With"] !== 'XMLHttpRequest') {
      res.setHeader('Content-Type', 'text/html');
      res.send(self.indexFile);
    }

  });


};

InsightUI.prototype.filterIndexHTML = function(data) {
  var transformed = data
    .replace(/{{version}}/g, 'v' + this.packageVersion)
    .replace(/{{year}}/, (new Date()).getFullYear())
    .replace(/apiPrefix = '\/api'/, "apiPrefix = '/" + this.apiPrefix + "'")
    .replace(/nodemapLink = ''/, "nodemapLink = '" + this.nodemapLink + "'")
    .replace(/current_network = null/, "current_network = '" + (this.network.name === 'testnet' ? 'testnet' : 'livenet') + "'");

  if (this.routePrefix) {
    transformed = transformed.replace(/<base href=\"\/\"/, '<base href="/' + this.routePrefix + '/"');
  }

  return transformed;
};

module.exports = InsightUI;
