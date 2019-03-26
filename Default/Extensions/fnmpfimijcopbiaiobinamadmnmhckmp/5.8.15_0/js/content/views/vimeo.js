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

define('VIMEO', ['APP', 'backbone', 'underscore', 'jquery', 'vimeo'], function (Skyload, Backbone, _, $) {
    Skyload.Custodian.Require('VIMEO', function () {
        var Vimeo = _.extend({}, SkyloadDefaultComponents);

        Vimeo.Settings = Backbone.Model.extend({
            defaults: {
                sig: Skyload.SOURCE_VIMEO,
                loading_class: 'skyload-loading',
                delay: 1000
            }
        });

        var Settings = new Vimeo.Settings();
        var VideoCollection = Skyload.Instance.GetInstance(Skyload.TYPE_VIDEO, Settings.get('sig'));

        Vimeo.Views.Box = Backbone.View.extend({
            tagName: 'div',
            className: 'clip_info-user_actions vimeo__box-container',
            template: _.template('<div class="vimeo__box-download-icon"><%= download %></div>' + '<div class="vimeo__box-videos js-videos"></div>'),
            render: function render() {
                var _this = this;

                this.$el.html(this.template({ download: Skyload.getLocale('download_video') }));

                this.model.getVideo().sortByField('size').each(function (model) {
                    _this.$el.find('.js-videos').append(new Vimeo.Views.BoxItem({ model: _this.model }).render(model).el);
                });

                return this;
            }
        });

        Vimeo.Views.BoxItem = Skyload.VideoView.extend({
            tagName: 'div',
            className: 'vimeo__box-item',
            template: _.template('<%= format %>(<%= quality %>)'),
            events: {
                'click': 'downloadVideo'
            },
            render: function render(model) {
                this.specialModel = model;

                this.$el.html(this.template({
                    format: this.specialModel.get('format'),
                    quality: this.specialModel.get('quality')
                })).attr('title', this.getTitle());

                return this;
            },
            downloadVideo: function downloadVideo() {
                this.download('Vimeo', 'Box');
            }
        });

        return Skyload.AppView.extend({
            id: null,
            initialize: function initialize() {
                this.init();
                this.parse = true;

                this.listenToOnce(VideoCollection, 'reset', this.render);
                this.parseElem('[skyload-type=video]', VideoCollection);

                this.checkAccess();
            },
            render: function render() {
                var _this2 = this;

                setInterval(function () {
                    try {
                        if (!_this2.isActive()) {
                            return;
                        }

                        var id = parseInt(_.chain(location.pathname.split('/')).compact().last().value());
                        var $elem = _this2.$el.find('.clip_info-subline--watch').first();
                        var insert = true;

                        if (!_.isNumber(id) || _.isNaN(id)) {
                            return;
                        }

                        if (!$elem.length) {
                            $elem = _this2.$el.find('#wrap');
                            insert = false;
                        }

                        if ($elem.length && id != _this2.id) {
                            $elem.find('.vimeo__box-container').remove();

                            var index = [Settings.get('sig'), id].join('_');
                            var model = VideoCollection.get(index);

                            _this2.markElem($elem, [Skyload.TYPE_VIDEO, index]);

                            if (model instanceof Backbone.Model && model.isCached()) {
                                model.set('insert', insert).set('view', $elem);

                                _this2.setVideoPreload(false).setVideoTemplate(model);
                            } else {
                                _this2.setVideoPreload(true);

                                Skyload.Vimeo.Get(id).then(function (model) {
                                    return VideoCollection.save(model);
                                }).then(function (model) {
                                    model.set('insert', insert).set('view', $elem);

                                    _this2.setVideoPreload(false).setVideoTemplate(model);
                                }).catch(function (e) {
                                    _this2.setVideoPreload(false);

                                    Skyload.setLog('Vimeo', 'Error', e.stack);
                                    Skyload.Analytics('Vimeo', 'Error', 'ID : ' + id + ' ' + e.message);
                                });
                            }
                        }

                        _this2.id = id;
                    } catch (e) {
                        Skyload.setLog('Vimeo', 'Parse error', e.stack);
                    }
                }, Settings.get('delay'));

                return this;
            },
            setVideoTemplate: function setVideoTemplate(model) {
                var $container = model.get('view');

                this.markElem($container, model);

                if ($container.length && model.get('insert') === true) {
                    $container.append(new Vimeo.Views.Box({ model: model }).render().el);
                    $container.attr('skyload', 'mod');
                }

                Skyload.Analytics('Vimeo', 'View', model.get('id'));

                return this;
            }
        });
    });
});