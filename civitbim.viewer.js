// CivitBim.viewer.js

var CivitBim = {};

function LoadAutodeskLibrary(callback) {
    var script = document.createElement('script');
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js'; // Replace with the actual script URL
    script.onload = function () {
        // Wait for the Autodesk Viewer script to load before executing the callback
        callback();
    };
    script.onerror = function () {
        console.error('Failed to load Autodesk Viewer script.');
        // Optionally, you can handle the error here
    };
    document.head.appendChild(script); // Append the script element to the document
}

CivitBim.Viewer = (function () {
    // Define the Initialize and Load functions within the Viewer object
    var viewer = {};

    viewer.Initialize = async function (container, accessToken) {
        return new Promise(function (resolve, reject) {
            // Wait for Autodesk Viewer script to be fully loaded
            LoadAutodeskLibrary(function () {
                var options = {
                    env: 'AutodeskProduction',
                    getAccessToken: accessToken
                };

            //Autodesk.Viewing.Initializer requires access token as a callback, function value resolves internally by Autodesk Initializer
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
                resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry(true)));
            }
            function onDocumentLoadFailure(code, message, errors) {
                reject({ code, message, errors });
            }
            viewer.setLightPreset(0);
            Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
    };

    return viewer;
})();
