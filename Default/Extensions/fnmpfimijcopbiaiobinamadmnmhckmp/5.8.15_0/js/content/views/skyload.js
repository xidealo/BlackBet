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

define('SKYLOAD', ['APP', 'jquery'], function (Skyload, $) {
    /** @var {Object} Skyload */

    Skyload.SendMessageFromContentToBackground({ method: 'reset_profile' }, function (response) {});

    $('.js-install').attr('data-install', true);
});