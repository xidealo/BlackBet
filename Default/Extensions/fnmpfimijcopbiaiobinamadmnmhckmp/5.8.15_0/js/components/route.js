/**
 * Skyload - Download manager for media content
 * @link http://skyload.io
 *
 * @version v5.8.14
 *
 * License Agreement:
 * http://skyload.io/eula
 *
 * Privacy Policy:
 * http://skyload.io/privacy-policy
 *
 * Support and FAQ:
 * http://skyload.io/help
 * support@skyload.io
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define('route', ['backbone', 'underscore'], function (Backbone, _) {
    /* Routes */
    var RouteModel = Backbone.Model.extend({
        defaults: {
            'id': null,
            'matches': [],
            'ignore_matches': [],
            'js': [],
            'css': [],
            'all_frames': false,
            'ignore_instance': false,
            'ignore_available_url': false,
            'ads': false
        },
        idAttribute: 'id',
        getId: function getId() {
            return this.get('id');
        },
        isForAllFrames: function isForAllFrames() {
            return this.get('all_frames');
        },
        ignoreInstance: function ignoreInstance() {
            return this.get('ignore_instance');
        },
        ignoreAvailableURL: function ignoreAvailableURL() {
            return this.get('ignore_available_url');
        },
        isAds: function isAds() {
            return this.get('ads');
        }
    });

    var RouteCollection = Backbone.Collection.extend({
        model: RouteModel,
        findRouteByUrl: function findRouteByUrl(url) {
            url = Skyload.parseURL(url);

            var isset = function isset(matches) {
                return !!_.filter(matches, function (match) {
                    if (match.indexOf('<') == 0 && match.indexOf('>') == match.length - 1) {
                        var symbol = match.substr(1, match.length - 2);

                        if (symbol == 'all_urls') {
                            return true;
                        }

                        return url.host.indexOf(symbol) >= 0;
                    }

                    return _.every(Skyload.parseURL(match), function (value, key) {
                        var piece = key in url ? url[key] : value;

                        switch (key) {
                            case 'host':
                                return value == piece || value.indexOf('*.') == 0 && piece.indexOf(value.split('*.')[1]) >= 0;

                                break;
                            case 'path':
                                return value == '/*' || value == piece || value.indexOf('*') > 0 && piece.indexOf(value.split('*')[0]) >= 0;

                                break;
                        }

                        return true;
                    });
                }).length;
            };

            return this.chain().filter(function (model) {
                return isset(model.get('matches')) && !isset(model.get('ignore_matches'));
            });
        },
        isAvailableURL: function isAvailableURL(url) {
            if (Skyload.isURL(url)) {
                return !!this.findRouteByUrl(url).filter(function (model) {
                    return !model.ignoreAvailableURL();
                }).value().length;
            }

            return false;
        }
    });

    /* Frames */
    var RouteFrameModel = Backbone.Model.extend({
        defaults: {
            'tab_id': 0,
            'frame_id': 0,
            'url': null,
            'route_collection': new RouteCollection()
        },
        idAttribute: 'url',
        getCSS: function getCSS() {
            return this.getRouteCollection().chain().map(function (model) {
                return model.get('css');
            }).reduce(function (list, css) {
                return list.concat(css);
            }, []).value();
        },
        getJS: function getJS() {
            return this.getRouteCollection().chain().map(function (model) {
                return model.get('js');
            }).reduce(function (list, js) {
                return list.concat(js);
            }, []).value();
        },
        getRouteCollection: function getRouteCollection() {
            return this.get('route_collection');
        },
        hasInstance: function hasInstance(name) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                Skyload.SendMessageFromBackgroundToContentFrame(_this.get('tab_id'), _this.get('frame_id'), {
                    method: 'has_instance',
                    name: name
                }, function (response) {
                    try {
                        if (_.isUndefined(response) || !_.isObject(response)) {
                            return resolve(false);
                        }

                        if (response.code != 0) {
                            throw new Error('Some error for has instance callback; tab_id = ' + _this.get('tab_id') + ', frame_id = ' + _this.get('frame_id') + ', url = ' + _this.get('url'));
                        }

                        resolve(response.has);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }
    });

    var RouteFrameCollection = Backbone.Collection.extend({
        model: RouteFrameModel
    });

    /* Class */

    var Route = function () {
        function Route(route) {
            _classCallCheck(this, Route);

            this.route = route;
            this.collection = new RouteCollection(this.route);

            this.showAds = true;
        }

        _createClass(Route, [{
            key: 'SetShowAds',
            value: function SetShowAds(value) {
                this.showAds = value;
                return this;
            }
        }, {
            key: 'IsAvailableURL',
            value: function IsAvailableURL(url) {
                return this.collection.isAvailableURL(url);
            }
        }, {
            key: 'GetFrameCollection',
            value: function GetFrameCollection(tabId) {
                var _this2 = this;

                return Skyload.GetAllFramesOnTab(tabId).then(function (frames) {
                    return _.reduce(frames, function (frameCollection, frame) {
                        var url = frame.url;
                        var frameId = frame.frameId;

                        if (Skyload.isURL(url)) {
                            var routeCollection = _this2.collection.findRouteByUrl(url).filter(function (model) {
                                return frameId == 0 || frameId != 0 && model.isForAllFrames() === true;
                            }).value();

                            if (routeCollection.length) {
                                routeCollection = new RouteCollection(routeCollection);

                                frameCollection.add({
                                    'url': url,
                                    'tab_id': tabId,
                                    'frame_id': frameId,
                                    'route_collection': routeCollection
                                });
                            }
                        }

                        return frameCollection;
                    }, new RouteFrameCollection());
                });
            }
        }, {
            key: 'ExecuteResource',
            value: function ExecuteResource(tabId, type) {
                var _this3 = this;

                return this.GetFrameCollection(tabId).then(function (frameCollection) {
                    frameCollection.each(function (frameModel) {
                        frameModel.getRouteCollection().each(function (routeModel) {
                            if (routeModel.isAds() && _this3.showAds == false) {
                                return;
                            }

                            var execute = function execute() {
                                var resources = {
                                    css: frameModel.getCSS(),
                                    js: frameModel.getJS()
                                };

                                if (_.isString(type)) {
                                    delete resources[type];
                                }

                                _.each(resources, function (list, type) {
                                    _.each(list, function (src) {
                                        var details = {
                                            frameId: frameModel.get('frame_id')
                                        };

                                        details[src.substr(-(type.length + 1)) == '.' + type ? 'file' : 'code'] = src;

                                        switch (type) {
                                            case 'css':
                                                Skyload.InsertCSS(tabId, details).catch(function (e) {
                                                    Skyload.setLog('Route', 'Insert CSS error', e.stack);
                                                });

                                                break;
                                            case 'js':
                                                Skyload.ExecuteScript(tabId, details).catch(function (e) {
                                                    Skyload.setLog('Route', 'Execute script error', e.stack);
                                                });

                                                break;
                                        }
                                    });
                                });
                            };

                            if (routeModel.ignoreInstance()) {
                                execute();
                            } else {
                                frameModel.hasInstance(routeModel.getId()).then(function (has) {
                                    if (!has) {
                                        execute();
                                    }
                                }).catch(function (e) {
                                    Skyload.setLog('Route', 'Some error on has instance callback', e.stack);
                                });
                            }
                        });
                    });
                });
            }
        }]);

        return Route;
    }();

    return Route;
});