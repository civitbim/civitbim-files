// CivitBim.viewer.js

var CivitBim = {};

function LoadAutodeskLibrary(callback) {
    var script = document.createElement('script');
    script.src = 'https://developer.api.autodesk.com/viewingservice/v1/viewers/7.*/viewer3D.js';
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

    viewer.Load = async function (viewer, urn) {
        return new Promise(function (resolve, reject) {

            function onDocumentLoadSuccess(doc) {
                resolve(
                    viewer.loadDocumentNode(
                        doc,
                        doc.getRoot().getDefaultGeometry(true)
                    )
                );
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
avatar
Ask In Chat
Ask In Chat
