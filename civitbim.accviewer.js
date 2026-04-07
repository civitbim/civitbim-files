// CivitBim.viewer.js
var CivitBim = {};
function LoadAutodeskLibrary(callback, reject) {
    if (window.Autodesk && Autodesk.Viewing) {
        callback();
        return;
    }

    var script = document.createElement('script');
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js';

    script.onload = function () {
        Autodesk.Viewing.FeatureFlags.set("DS_ENDPOINTS", true);
        callback();
    };

    script.onerror = function () {
        reject(new Error('Failed to load Autodesk Viewer script.'));
    };

    document.head.appendChild(script);
}
CivitBim.Viewer = (function () {
    var viewer = {};
    viewer.Initialize = async function (container, accessToken) {
        return new Promise(function (resolve, reject) {
            LoadAutodeskLibrary(function () {
                var options = {
                    env: 'AutodeskProduction2',
                    api: 'streamingV2',
                    getAccessToken: accessToken
                };
                Autodesk.Viewing.Initializer(options, function () {
                    const config = {
                        extensions: ['Autodesk.DocumentBrowser']
                    };
                    const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
                    viewer.start();
                    viewer.setTheme('light-theme');
                    resolve(viewer);
                });
            });
        });
    };
    viewer.Load = async function (viewer, urn, options) {
        if (!options) options = {};
        return new Promise(function (resolve, reject) {
            function onDocumentLoadSuccess(doc) {
                var defaultModel = doc.getRoot().getDefaultGeometry(true);
                if (!defaultModel) {
                    reject({ code: -1, message: "No default geometry found in document" });
                    return;
                }
                viewer.loadDocumentNode(doc, defaultModel, options)
                    .then(resolve).catch(reject);
            }
            function onDocumentLoadFailure(code, message, errors) {
                reject({ code: code, message: message, errors: errors });
            }
            viewer.setLightPreset(0);
            Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
    };
    return viewer;
})();
