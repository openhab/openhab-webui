#!/usr/bin/env node

//
// This hook copies various resource files
// from our version control system directories
// into the appropriate platform specific location
//


// configure all the files to copy.
// Key of object is the source file,
// value is the destination location.
// It's fine to put all platforms' icons
// and splash screen files here, even if
// we don't build for all platforms
// on each developer's box.

var filestocopy = [{
    "images/android/drawable/icon.png": "platforms/android/res/drawable/icon.png"
}, {
    "images/android/drawable-hdpi/icon.png": "platforms/android/res/drawable-hdpi/icon.png"
}, {
    "images/android/drawable-ldpi/icon.png": "platforms/android/res/drawable-ldpi/icon.png"
}, {
    "images/android/drawable-mdpi/icon.png": "platforms/android/res/drawable-mdpi/icon.png"
}, {
    "images/android/drawable-xhdpi/icon.png": "platforms/android/res/drawable-xhdpi/icon.png"
}, {
    "images/android/drawable/splash.png": "platforms/android/res/drawable/splash.png"
}, {
    "images/android/drawable-hdpi/splash.png": "platforms/android/res/drawable-hdpi/splash.png"
}, {
    "images/android/drawable-ldpi/splash.png": "platforms/android/res/drawable-ldpi/splash.png"
}, {
    "images/android/drawable-mdpi/splash.png": "platforms/android/res/drawable-mdpi/splash.png"
}, {
    "images/android/drawable-xhdpi/splash.png": "platforms/android/res/drawable-xhdpi/splash.png"
}, {
    "config/ios/Resources/icons/icon-72.png": "platforms/ios/YourAppName/Resources/icons/icon-72.png"
}, {
    "config/ios/Resources/icons/icon.png": "platforms/ios/YourAppName/Resources/icons/icon.png"
}, {
    "config/ios/Resources/icons/icon@2x.png": "platforms/ios/YourAppName/Resources/icons/icon@2x.png"
}, {
    "config/ios/Resources/icons/icon-72@2x.png": "platforms/ios/YourAppName/Resources/icons/icon-72@2x.png"
}, {
    "config/ios/Resources/splash/Default@2x~iphone.png": "platforms/ios/YourAppName/Resources/splash/Default@2x~iphone.png"
}, {
    "config/ios/Resources/splash/Default-568h@2x~iphone.png": "platforms/ios/YourAppName/Resources/splash/Default-568h@2x~iphone.png"
}, {
    "config/ios/Resources/splash/Default~iphone.png": "platforms/ios/YourAppName/Resources/splash/Default~iphone.png"
}, {
    "config/ios/Resources/splash/Default-Portrait~ipad.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait~ipad.png"
}, {
    "config/ios/Resources/splash/Default-Portrait@2x~ipad.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait@2x~ipad.png"
},];

var fs = require('fs');
var path = require('path');

// no need to configure below
var rootdir = process.argv[2];

filestocopy.forEach(function (obj) {
    Object.keys(obj).forEach(function (key) {
        var val = obj[key];
        var srcfile = path.join(rootdir, key);
        var destfile = path.join(rootdir, val);
        console.log("copying "+srcfile+" to "+destfile);
        var destdir = path.dirname(destfile);
        if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
            fs.createReadStream(srcfile).pipe(
                fs.createWriteStream(destfile));
        }
    });
});