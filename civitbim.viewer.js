// CivitBim.viewer.js

var CivitBim = {};

function LoadAutodeskLibrary(callback) {
    var script = document.createElement('script');
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
    script.onload = function () {
        callback();
    };
    script.onerror = function () {
        console.error('Failed to load Autodesk Viewer script.');
    };
    document.head.appendChild(script);
}

CivitBim.Viewer = (function () {
    var viewer = {};

    viewer.Initialize = async function (container, accessToken) {
        return new Promise(function (resolve, reject) {
            LoadAutodeskLibrary(function () {

                var options = {
                    env: 'AutodeskProduction',
                    api: 'streamingV2', // ✅ REQUIRED FOR ACC MODELS
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

    viewer.Load = async function (viewer, urn, options = {}) {
    return new Promise(function (resolve, reject) {

        function onDocumentLoadSuccess(doc) {
            const defaultModel = doc.getRoot().getDefaultGeometry(true);
            if (!defaultModel) {
                reject({
                    code: -1,
                    message: "No default geometry found in document"
                });
                return;
            }

            viewer.loadDocumentNode(
                doc,
                defaultModel,
                options   // 👈 THIS is the key (keepCurrentModels)
            ).then(resolve).catch(reject);
        }

        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }

        viewer.setLightPreset(0);

        Autodesk.Viewing.Document.load(
            'urn:' + urn,
            onDocumentLoadSuccess,
            onDocumentLoadFailure
        );
    });
};

    return viewer;
})();
