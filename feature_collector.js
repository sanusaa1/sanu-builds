
(function () {
    "use strict";

    /**
     * AnritVox Feature Collector
     * Safe browser feature detection.
     */

    function FeatureCollector(options = {}) {
        this.options = {
            collectBrowser: true,
            collectScreen: true,
            collectStorage: true,
            collectNetwork: true,
            ...options
        };
    }

    FeatureCollector.prototype.collect = function () {
        const data = {
            timestamp: new Date().toISOString(),
            browser: {},
            screen: {},
            storage: {},
            network: {}
        };

        if (this.options.collectBrowser) {
            data.browser = {
                language: navigator.language || null,
                languages: navigator.languages || [],
                platform: navigator.platform || null,
                online: navigator.onLine,
                cookieEnabled: navigator.cookieEnabled
            };
        }

        if (this.options.collectScreen) {
            data.screen = {
                width: window.screen.width,
                height: window.screen.height,
                availableWidth: window.screen.availWidth,
                availableHeight: window.screen.availHeight,
                devicePixelRatio: window.devicePixelRatio || 1
            };
        }

        if (this.options.collectStorage) {
            data.storage = {
                localStorage: isStorageAvailable("localStorage"),
                sessionStorage: isStorageAvailable("sessionStorage")
            };
        }

        if (this.options.collectNetwork) {
            data.network = {
                online: navigator.onLine,
                connection: getConnectionInfo()
            };
        }

        return data;
    };

    function isStorageAvailable(type) {
        try {
            const storage = window[type];
            const testKey = "__feature_test__";

            storage.setItem(testKey, "1");
            storage.removeItem(testKey);

            return true;
        } catch (error) {
            return false;
        }
    }

    function getConnectionInfo() {
        const connection =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        if (!connection) {
            return null;
        }

        return {
            effectiveType: connection.effectiveType || null,
            downlink: connection.downlink || null,
            rtt: connection.rtt || null,
            saveData: connection.saveData || false
        };
    }

    // Modern initialization:
    // Pass ONE configuration object instead of deprecated parameters.
    window.FeatureCollector = function (options = {}) {
        return new FeatureCollector(options);
    };

    // Optional automatic instance.
    window.AVFeatureCollector = new FeatureCollector();

})();
