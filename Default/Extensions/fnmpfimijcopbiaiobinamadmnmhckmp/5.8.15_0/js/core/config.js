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

define('config', ['underscore'], function (_) {
    return {
        Locales: {
            en: 'English',
            ru: 'Русский',
            de: 'Deutsch',
            es: 'Español',
            fr: '‪Français',
            it: '‪Italiano‬‬',
            pt_BR: 'Português (Brasil)',
            pl: 'Polski',
            uk: 'Українська‬'
        },

        Routing: [{
            'id': 'skyload',
            'matches': ['*://skyload.io/*', '*://*.skyload.io/*'],
            'js': ['js/content/views/skyload.js']
        }, {
            'id': 'ok',
            'matches': ['*://www.odnoklassniki.ru/*', '*://ok.ru/*', '*://www.ok.ru/*'],
            'js': ['js/vendor/js-md5/js/md5.js', 'js/libs/vimeo.js', 'js/libs/odnoklassniki.js', 'js/content/views/ok.js'],
            'css': ['css/content/ok.css']
        }, {
            'id': 'vimeo',
            'matches': ['*://vimeo.com/*', '*://www.vimeo.com/*'],
            'js': ['js/libs/vimeo.js', 'js/content/views/vimeo.js'],
            'css': ['css/content/vimeo.css']
        }, {
            'id': 'gvimeo',
            'matches': ['*://player.vimeo.com/video/*'],
            'js': ['js/libs/vimeo.js', 'js/content/views/gvimeo.js'],
            'css': ['css/content/gvimeo.css'],
            'all_frames': true,
            'ignore_instance': true
        }, {
            'id': 'mya',
            'matches': ['*://music.yandex.ru/*', '*://music.yandex.ua/*', '*://music.yandex.by/*', '*://music.yandex.kz/*'],
            'js': ['js/vendor/js-md5/js/md5.js', 'js/libs/yandex.js', 'js/content/views/mya.js'],
            'css': ['css/content/mya.css']
        }, {
            'id': 'myr',
            'matches': ['*://radio.yandex.ru/*', '*://radio.yandex.ua/*', '*://radio.yandex.by/*', '*://radio.yandex.kz/*'],
            'js': ['js/vendor/js-md5/js/md5.js', 'js/libs/yandex.js', 'js/content/views/myr.js']
        }, {
            'id': 'sc',
            'matches': ['*://soundcloud.com/*', '*://*.soundcloud.com/*'],
            'js': ['js/libs/soundcloud.js', 'js/content/views/sc.js'],
            'css': ['css/content/sc.css'],
            'all_frames': true
        }, {
            'id': 'gm',
            'matches': ['*://play.google.com/music/*'],
            'js': ['js/content/views/gm.js'],
            'ignore_available_url': true
        }, {
            'id': 'wimp',
            'matches': ['*://play.wimpmusic.com/*'],
            'js': ['js/content/views/wimp.js'],
            'ignore_available_url': true
        }, {
            'id': 'dz',
            'matches': ['*://deezer.com/*', '*://www.deezer.com/*'],
            'js': ['js/content/views/dz.js'],
            'ignore_available_url': true
        }],

        DataBase: {
            id: "skyload",
            description: "Skyload database for audio, video, photo, file and profile models",
            nolog: true,
            migrations: [{
                version: 1,
                migrate: function migrate(transaction, next) {
                    var table = {};
                    var namespace = _.extend({}, Skyload.CacheNamespace);

                    _.each(['download', 'access'], function (index) {
                        delete namespace[index];
                    });

                    _.each(namespace, function (name, index) {
                        table[index] = transaction.db.createObjectStore(index, {keyPath: 'index'});

                        table[index].createIndex('index', 'index', {unique: true});
                        table[index].createIndex('id', 'id', {unique: false});
                        table[index].createIndex('source', 'source', {unique: false});
                    });

                    next();
                }
            }, {
                version: 2,
                migrate: function migrate(transaction, next) {
                    var download = transaction.db.createObjectStore('download', {keyPath: 'index'});
                    download.createIndex('id', 'id', {unique: false});
                    download.createIndex('index', 'index', {unique: false});

                    next();
                }
            }, {
                version: 3,
                migrate: function migrate(transaction, next) {
                    var access = transaction.db.createObjectStore('access', {keyPath: 'domain'});
                    access.createIndex('domain', 'domain', {unique: true});

                    next();
                }
            }]
        }
    };
});