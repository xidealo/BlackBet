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

define('soundcloud', ['underscore', 'jquery', 'methods'], function (_, $) {
    var SoundCloud = function () {
        function SoundCloud() {
            _classCallCheck(this, SoundCloud);

            this.sig = Skyload.SOURCE_SOUNDCLOUD;
            this.client_id = '02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea';
            this.api_get_url_info = _.template('http://api.soundcloud.com/resolve.json?url=<%= url %>&client_id=<%= client_id %>');
            this.api_get_stream_url = _.template('https://api.soundcloud.com/i1/tracks/<%= id %>/streams?client_id=<%= client_id %>');

            this.protocol = 'https';
            this.host = 'soundcloud.com';
        }

        _createClass(SoundCloud, [{
            key: 'SetSchema',
            value: function SetSchema(protocol, host) {
                this.protocol = protocol;
                this.host = host;

                return this;
            }
        }, {
            key: 'SetClientId',
            value: function SetClientId(id) {
                this.client_id = id;

                return this;
            }
        }, {
            key: 'FetchClientId',
            value: function FetchClientId() {
                var _this = this;

                var url = this.protocol + '://' + this.host;

                return this.Fetch(url, false).then(function (html) {
                    var tags = html.match(/<script[\s\S]*?>[\s\S]*?<\/script>/gi);

                    if (_.isArray(tags) && tags.length) {
                        var src = _.chain(tags).map(function (tag) {
                            if (tag.indexOf('assets/app') >= 0) {
                                return $(tag).attr('src');
                            }

                            return null;
                        }).compact().first().value();

                        if (_.isString(src) && src.length) {
                            return _this.Fetch(src, false);
                        }
                    }

                    throw new Error('Not found script in page');
                }).then(function (script) {
                    var matches = script.match(/client_id:\s*\"([^\"]+)\"/);

                    if (matches) {
                        return matches[1];
                    }

                    throw new Error('Not found client id');
                });
            }
        }, {
            key: 'GetNormalURL',
            value: function GetNormalURL(url) {
                url = url.replace(/#.*$/i, '');

                if (url.search(/^\/\/(?:[\w-]+\.)?soundcloud\.com(?:\d+)?\//i) > -1) {
                    url = this.protocol + url;
                } else if (url.search(/https?:\/\//i) == -1) {
                    if (url.charAt(0) != '/') {
                        url = '/' + url;
                    }

                    url = this.protocol + '//' + this.host + url;
                }

                url = Skyload.parseURL(url);
                url = url.scheme + '://' + url.host + url.path.replace(/\/sets\//gi, '/');

                return url;
            }
        }, {
            key: 'Call',
            value: function Call(url, callback) {
                return this.Get(url).then(callback, function (e) {
                    Skyload.setLog('SoundCloud Libs', 'Get error', e.stack);
                    Skyload.Analytics('SoundCloud', 'Error', 'Get model', e.message);
                    callback(null);
                });
            }
        }, {
            key: 'Get',
            value: function Get(url) {
                return this.GetModel(url);
            }
        }, {
            key: 'GetModel',
            value: function GetModel(url) {
                var _this2 = this;

                var api = this.GetNormalURL(url);

                return this.GetConfigByUrl(api).catch(function () {
                    return _this2.Fetch(url, false).then(function (response) {
                        var json = response.match("var c=(.*?),o=Date")[1];
                        json = JSON.parse(json);

                        var track = _.last(json);
                        track = _.first(track.data);

                        return track;
                    });
                }).then(function (json) {
                    var model = {
                        index: [_this2.sig, json.id].join('_'),
                        id: parseInt(json.id),
                        source: _this2.sig,
                        cover: json.artwork_url || json.user.avatar_url,
                        author: json.user.username,
                        name: json.title,
                        genre: json.genre,
                        duration: Math.round(parseInt(json.duration) / 1000),
                        mime_type: Skyload.AUDIO_MIME_TYPE_MP3,
                        data: { link: url }
                    };

                    if ('stream_url' in json) {
                        model.play = json.stream_url + (json.stream_url.indexOf('?') == -1 ? '?' : '&') + 'client_id=' + _this2.client_id;

                        return model;
                    } else {
                        return _this2.GetStreamUrl(model.id).then(function (play) {
                            model.play = play;

                            return model;
                        });
                    }
                });
            }
        }, {
            key: 'GetStreamUrl',
            value: function GetStreamUrl(id) {
                return this.GetConfigById(id).then(function (json) {
                    return json.http_mp3_128_url;
                });
            }
        }, {
            key: 'GetConfigByUrl',
            value: function GetConfigByUrl(url) {
                url = this.api_get_url_info({
                    url: url,
                    client_id: this.client_id
                });

                return this.Fetch(url).then(function (json) {
                    if (json.kind != 'track' && json.tracks && json.tracks.length) {
                        json = _.first(json.tracks);
                    }

                    if (json.kind == 'track' && json.stream_url) {
                        return json;
                    }

                    throw new Error('Wrong output params');
                });
            }
        }, {
            key: 'GetConfigById',
            value: function GetConfigById(id) {
                var url = this.api_get_stream_url({
                    id: id,
                    client_id: this.client_id
                });

                return Skyload.Methods.Fetch(url, 'json');
            }
        }, {
            key: 'Fetch',
            value: function Fetch(url, toJson) {
                if (_.isUndefined(toJson)) {
                    toJson = true;
                }

                return new Promise(function (resolve, reject) {
                    Skyload.Methods.XHR(url, function (response) {
                        try {
                            response = response.response;

                            if (response.status == 200) {
                                resolve(toJson ? JSON.parse(response.responseText) : response.responseText);
                            } else {
                                throw new Error('Response bad status (' + response.status + ')');
                            }
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            }
        }]);

        return SoundCloud;
    }();

    if (!(Skyload.LIB_SOUNDCLOUD in Skyload)) {
        /** @class Skyload.SoundCloud */
        Skyload[Skyload.LIB_SOUNDCLOUD] = new SoundCloud();
    }

    return SoundCloud;
});