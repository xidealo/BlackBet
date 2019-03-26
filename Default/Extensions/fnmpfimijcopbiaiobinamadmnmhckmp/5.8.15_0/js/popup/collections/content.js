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

define('content_collection', ['backbone', 'content_item_model'], function (Backbone, ContentItemModel) {
    return Backbone.Collection.extend({
        model: ContentItemModel,
        initialize: function initialize() {
            var _this = this;

            this.each(function (model) {
                if (!model.isValid()) {
                    _this.remove(model);

                    Skyload.Analytics('ModelError', model.validationError);
                    Skyload.setLog('Collection validate', model.get('index'), model.get('name'), model.validationError);
                }
            });
        }
    });
});