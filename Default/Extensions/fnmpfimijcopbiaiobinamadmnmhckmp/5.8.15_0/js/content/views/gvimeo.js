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

define('GVIMEO', ['APP', 'backbone', 'underscore', 'vimeo'], function (Skyload, Backbone, _) {
    Skyload.Custodian.Require('GVIMEO', function () {
        var GVimeo = _.extend({}, SkyloadDefaultComponents);

        GVimeo.Settings = Backbone.Model.extend({
            defaults: {
                sig: Skyload.SOURCE_VIMEO,
                delay: 1000
            }
        });

        var Settings = new GVimeo.Settings();
        var VideoCollection = Skyload.Instance.GetInstance(Skyload.TYPE_VIDEO, Settings.get('sig'));

        GVimeo.Views.Button = Backbone.View.extend({
            tagName: 'div',
            className: 'box vimeo-download-button',
            template: _.template('<label class="rounded-box download-label invisible hidden" role="presentation" hidden="">' + '<span>Download</span>' + '</label>' + '<button tabindex="50" class="download-button rounded-box" aria-label="Download">' + '<span class="download-icon"></span>' + '</button>'),
            events: {
                'mouseenter button': 'showTooltip',
                'mouseleave': 'hideTooltip'
            },
            render: function render() {
                var list = new GVimeo.Views.List({
                    model: this.model,
                    collection: this.model.getVideo()
                });

                this.$el.html(this.template()).find('.download-label').html(list.render().el);

                return this;
            },
            showTooltip: function showTooltip() {
                this.$el.find('.download-label').removeClass('hidden invisible').addClass('visible').removeAttr('hidden');
            },
            hideTooltip: function hideTooltip() {
                this.$el.find('.download-label').removeClass('visible').addClass('invisible hidden').attr('hidden', 'hidden');
            }
        });

        GVimeo.Views.List = Backbone.View.extend({
            tagName: 'span',
            render: function render() {
                var _this = this;

                this.$el.text(Skyload.getLocale('download') + ' - ');
                this.collection.sortByField('index').each(function (model) {
                    var item = new GVimeo.Views.ListItem({ model: _this.model });
                    _this.$el.append(item.render(model).el);
                });

                return this;
            }
        });

        GVimeo.Views.ListItem = Skyload.VideoView.extend({
            tagName: 'a',
            events: {
                'click': 'downloadVideo'
            },
            render: function render(model) {
                this.specialModel = model;

                this.$el.text(this.specialModel.get('quality')).attr({
                    href: this.specialModel.get('url'),
                    download: this.getFileName(),
                    title: Skyload.getLocale('download_video') + ' - ' + this.getTitle()
                });

                return this;
            },
            downloadVideo: function downloadVideo(e) {
                e.preventDefault();
                this.download('GlobalVimeo');
            }
        });

        return Skyload.AppView.extend({
            interval: null,
            lock: false,
            initialize: function initialize() {
                this.init();

                this.parse = true;
                this.listenToOnce(VideoCollection, 'reset', this.render);
                this.parseElem('[skyload-type=video]', VideoCollection);

                this.checkAccess();
            },
            render: function render() {
                var _this2 = this;

                this.interval = setInterval(function () {
                    try {
                        var id = parseInt(_.chain(location.pathname.split('/')).compact().last().value());

                        if (!_.isNumber(id) || _.isNaN(id) || _this2.lock === true) {
                            return _this2;
                        }

                        var $elem = _this2.$el.find('[role=toolbar]:not([skyload])');
                        var index = [Settings.get('sig'), id].join('_');
                        var model = VideoCollection.get(index);

                        if ($elem.length) {
                            if (model instanceof Backbone.Model && model.isCached()) {
                                model.set('view', $elem);
                                _this2.setVideoTemplate(model);
                            } else {
                                _this2.lock = true;

                                Skyload.Vimeo.Get(id).then(function (model) {
                                    return VideoCollection.save(model);
                                }).then(function (model) {
                                    model.set('view', $elem);
                                    _this2.setVideoTemplate(model);
                                }).catch(function (e) {
                                    Skyload.setLog('Global Vimeo', 'Error', e.stack);
                                    Skyload.Analytics('Vimeo', 'Error', 'G ID : ' + id + ' ' + e.message);
                                });
                            }
                        }
                    } catch (e) {
                        Skyload.setLog('Global Vimeo', 'Parse error', e.stack);
                    }
                }, Settings.get('delay'));

                return this;
            },
            setVideoTemplate: function setVideoTemplate(model) {
                var $toolbar = model.get('view');

                if ($toolbar.length) {
                    var button = new GVimeo.Views.Button({ model: model });
                    $toolbar.append(button.render(this).el);

                    this.markElem($toolbar, model);
                    clearInterval(this.interval);
                }

                this.lock = false;

                Skyload.Analytics('Vimeo', 'View', model.get('id'));

                return this;
            }
        });
    });
});