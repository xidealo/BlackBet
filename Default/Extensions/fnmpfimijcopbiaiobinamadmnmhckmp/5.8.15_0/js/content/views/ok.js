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

define('OK', ['APP', 'backbone', 'underscore', 'jquery', 'odnoklassniki'], function (Skyload, Bakcbone, _, $) {
    Skyload.Custodian.Require('OK', function () {
        var OK = _.extend({}, SkyloadDefaultComponents);

        OK.Settings = Backbone.Model.extend({
            defaults: {
                delay: 1000,
                sig: Skyload.SOURCE_ODNOKLASSNIKI
            }
        });

        var Settings = new OK.Settings();

        var SoundCollection = Skyload.Instance.GetInstance(Skyload.TYPE_SOUND, Settings.get('sig'));
        var VideoCollection = Skyload.Instance.GetInstance(Skyload.TYPE_VIDEO);

        OK.Views.SoundDownloadButton = Skyload.SoundView.extend({
            tagName: 'a',
            className: 'ok__download-button ok__load',
            events: {
                'click': 'downloadSound'
            },
            initialize: function initialize() {
                this.listenTo(this.model, 'change:size', this.setTitle);

                this.$el.attr('onclick', 'event.cancelBubble=true;');
            },
            render: function render() {
                this.$el.attr({
                    href: this.model.get('play'),
                    download: this.getFileName()
                }).removeClass('ok__load');

                this.setTitle(this.model);

                return this;
            },
            setTitle: function setTitle(model) {
                this.$el.attr('title', this.getTitle());

                return this;
            },
            downloadSound: function downloadSound(e) {
                e.preventDefault();

                if (!this.$el.is('.ok__load')) {
                    this.download('OK', 'Download sound');
                }
            }
        });

        OK.Views.VideoDownloadButton = Backbone.View.extend({
            tagName: 'li',
            className: 'widget-list_i ok__download_video_widget',
            move: false,
            move_timeout: null,
            videos: [],
            template: _.template('<div class="__vis">' + '<div class="widget">' + '<a href="javascript:void(0);" class="h-mod widget_cnt js-button ok__download-video-button">' + '<span class="widget_ico ok__download-video-button__icon"></span>' + '<span class="widget_tx"><%= download %></span>' + '<span class="widget_delim"></span>' + '<span class="widget_count"><%= count %></span>' + '</a>' + '</div>' + '</div>' + '<div class="h-mod sc-menu_w js-menu-container">' + '<div class="posR">' + '<div style="display: none;" class="sc-menu js-menu">' + '<div>' + '<ul class="ucard-mini-list js-videos"></ul>' + '</div>' + '<div class="sc-menu_arw_w">' + '<div class="sc-menu_arw"></div>' + '</div>' + '</div>' + '</div>' + '</div>'),
            events: {
                'click .js-button': 'download',
                'mouseenter a': 'showList',
                'mouseleave': 'hideList',
                'mousemove': 'setMove'
            },
            initialize: function initialize() {
                this.$el.attr('id', 'skyload-video-download-button');
            },
            render: function render() {
                var _this = this;

                this.videos = this.model.getVideo().chain().map(function (video) {
                    if (video.get('without_audio')) {
                        return;
                    }

                    return new OK.Views.VideoDownloadListItem({
                        model: _this.model
                    }).render(video);
                }).compact().value();

                this.$el.html(this.template({
                    download: Skyload.getLocale('download_video'),
                    count: this.videos.length
                }));

                _.each(this.videos, function (item) {
                    return _this.$el.find('.js-videos').append(item.el);
                });

                return this;
            },
            showList: function showList() {
                var $button = this.$el.find('.js-button');
                var $menu = this.$el.find('.js-menu');

                $menu.removeClass('sc-menu__top').css({ display: 'block', visibility: 'hidden', top: 0 });

                var button_width = $button.width();
                var button_height = $button.height();
                var menu_width = $menu.width();
                var menu_height = $menu.height();
                var menu_top = $menu.offset().top;

                var doc_top = $(document).scrollTop();
                var win_height = $(window).height();
                var left = (menu_width > button_width ? menu_width - button_width : button_width - menu_width) / 2;

                var is_top = menu_top + menu_height > doc_top + win_height;

                $menu.css('left', (menu_width > button_width ? '-' : '') + left + 'px').css('top', is_top ? -(menu_height + button_height * 2.5) : 0).css('visibility', 'visible');

                if (is_top) {
                    $menu.addClass('sc-menu__top');
                }

                return this;
            },
            hideList: function hideList() {
                var _this2 = this;

                this.move = false;
                clearTimeout(this.move_timeout);

                this.move_timeout = setTimeout(function () {
                    if (!_this2.move) {
                        _this2.$el.find('.js-menu').hide();
                    }
                }, 1000);

                return this;
            },
            setMove: function setMove() {
                this.move = true;
                return this;
            },
            download: function download() {
                try {
                    var view = _.chain(this.videos).filter(function (video) {
                        return video.getSpecialModel().get('format').toUpperCase() == 'MP4';
                    }).sortBy(function (video) {
                        return video.getSpecialModel().get('size');
                    }).last().value();

                    if (!(view instanceof Skyload.VideoView)) {
                        view = _.first(this.videos);
                    }

                    view.download('OK', 'Button');
                } catch (e) {
                    Skyload.setLog('OK', 'Download via button error', e.stack);
                }

                return this;
            }
        });

        OK.Views.VideoDownloadListItem = Skyload.VideoView.extend({
            tagName: 'li',
            className: 'ucard-mini-list_li ok__video-item',
            template: _.template('<a href="javascript:void(0);" class="ucard-mini o">' + '<div style="background-image: url(<%= cover %>);" class="ucard-mini_im ok__video-item-cover"></div>' + '<div class="ucard-mini_cnt">' + '<div class="ucard-mini_cnt_i ellip">' + '<b><%= format %></b> (<%= quality %>)<br />' + '<%= size %>' + '</div>' + '</div>' + '</a>'),
            events: {
                'click a': 'downloadVideo'
            },
            render: function render(model) {
                var _this3 = this;

                if (!(this.specialModel instanceof Backbone.Model)) {
                    this.listenTo(model, 'change:size', function (model) {
                        _this3.render(model);
                    });
                }

                if (model instanceof Backbone.Model) {
                    this.specialModel = model;
                }

                this.$el.html(this.template({
                    link: this.specialModel.get('url'),
                    cover: this.model.get('cover'),
                    format: this.specialModel.get('format'),
                    quality: this.specialModel.get('quality'),
                    size: this.getSizeTitle()
                }));

                return this;
            },
            downloadVideo: function downloadVideo(e) {
                e.preventDefault();
                this.download('OK');

                return this;
            }
        });

        return Skyload.AppView.extend({
            initialize: function initialize() {
                this.init();

                this.parse = this;

                var render = _.after(2, this.render);

                this.listenToOnce(SoundCollection, 'reset', render);
                this.listenToOnce(VideoCollection, 'reset', render);

                this.checkAccess();

                Skyload.Odnoklassniki.SetParams(location.protocol, location.host);
                Skyload.SendMessageFromContentToBackground({
                    method: 'set_libs_default',
                    source: Settings.get('sig')
                });
            },
            render: function render() {
                var _this4 = this;

                this.parseElem('div.mus-tr_i[skyload],#vp_w[skyload][skyload-type=video],.feed[skyload][skyload-type=video]', [SoundCollection, VideoCollection]);

                setInterval(function () {
                    if (_this4.isActive()) {
                        _this4.renderSound().renderVideo();
                    }
                }, Settings.get('delay'));

                return this;
            },
            renderSound: function renderSound() {
                var _this5 = this;

                try {
                    var $elem = this.$el.find('div.mus-tr_i:not([skyload])');

                    if ($elem.length) {
                        $elem.each(function (i, elem) {
                            var $this = $(elem);

                            var id = $this.data('query').trackId;
                            var index = [Settings.get('sig'), id].join('_');
                            var model = SoundCollection.get(index);

                            if (!(model instanceof Backbone.Model)) {
                                Skyload.Odnoklassniki.GetSoundModel(id).then(function (model) {
                                    return SoundCollection.save(model);
                                }).catch(function (e) {
                                    Skyload.setLog('OK', 'Get sound model error', e.stack);
                                });
                            }

                            _this5.markElem($this, [Skyload.TYPE_SOUND, index]);
                        });
                    }

                    this.renderTemplate('div.mus-tr_i[skyload=set]', SoundCollection);
                } catch (e) {
                    Skyload.setLog('OK', 'Parse sound error', e.stack);
                }

                return this;
            },
            renderVideo: function renderVideo() {
                var _this6 = this;

                try {
                    var render = function render($elem) {
                        var data = $elem.find('[data-module="OKVideo"]').data('options');

                        if (_.isObject(data) && 'flashvars' in data) {
                            data = data.flashvars;

                            $elem.attr('skyload', 'set');
                            _this6.setVideoPreload(true);

                            Skyload.Odnoklassniki.GetIndexFromData(data).then(function (info) {
                                var index = info.index;
                                var model = VideoCollection.get(index);

                                _this6.markElem($elem, [Skyload.TYPE_VIDEO, index]);

                                if (model instanceof Backbone.Model && model.isCached()) {
                                    model.set('view', $elem);
                                    _this6.setVideoPreload(false).setVideoTemplate(model);
                                } else {
                                    Skyload.Odnoklassniki.GetVideoModel(data).then(function (model) {
                                        return VideoCollection.save(model, Skyload.COLLECTION_MODE_IGNORE_SIZE);
                                    }).then(function () {
                                        return _this6.setVideoPreload(false);
                                    }).catch(function (e) {
                                        _this6.setVideoPreload(false);
                                        Skyload.setLog('OK', 'Get video model error', e.stack);
                                    });
                                }
                            }, function (e) {
                                Skyload.setLog('OK', 'Check video', e.stack);
                                _this6.setVideoPreload(false);
                            });
                        }
                    };

                    /* Modal video */
                    var $elem = this.$el.find('#vp_w:not([skyload])');

                    if ($elem.length) {
                        render($elem);
                    }

                    /* Posts video */
                    $elem = this.$el.find('.feed:not([skyload])');

                    if ($elem.length) {
                        $elem.each(function (i, post) {
                            try {
                                var $post = $(post);
                                var data = $post.data('l');

                                if (_.isString(data)) {
                                    render($post);
                                }
                            } catch (e) {
                                Skyload.setLog('OK', 'Parse video feed error', e.stack);
                            }
                        });
                    }

                    /* Insert videos */
                    this.renderTemplate('#vp_w[skyload=set],.feed[skyload=set]', VideoCollection);
                } catch (e) {
                    Skyload.setLog('OK', 'Parse video error', e.stack);
                }

                return this;
            },
            setSoundTemplate: function setSoundTemplate(model) {
                var $item = model.get('view');
                var $before = $item.find('span.mus-tr_play');

                if ($before.length) {
                    var view = new OK.Views.SoundDownloadButton({ model: model });

                    $before.before(view.render().el);
                    $item.attr('skyload', 'mod');
                }

                return this;
            },
            setVideoTemplate: function setVideoTemplate(model) {
                var $elem = model.get('view');

                if ($elem.length) {
                    var $container = $elem.find('.widget-list').first();
                    var $button = $elem.find('#skyload-video-download-button');

                    if ($container.length) {
                        var view = new OK.Views.VideoDownloadButton({ model: model });

                        if ($button.length) {
                            $button.replaceWith(view.render().el);
                        } else {
                            $container.prepend(view.render().el);
                        }

                        this.markElem($elem, model);
                        $elem.attr('skyload', 'mod');
                    }
                }

                return this;
            }
        });
    });
});