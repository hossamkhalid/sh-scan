// Initialize app
var myApp = new Framework7({
    pushState: true
});


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    domCache: true
});

function photoBroswer() {
    myApp.alert('Here comes About page3 Reinit');
}

function getClientId() {
    return "57987393-262e-4445-a056-254bd3196e14";
}

function getClientSecret() {
    return "T3tS7bG7fT1tD2wS6tR7eG7jX3uO6kE6kF3fE3fA7dA8nM1yK0";
}

function getPatientId() {
    return "d6f4ffec6b8cdeb5cdc8d98a5c6c69cd";
}


$$('.pb-page').on('click', function () {
    var myPhotoBrowserPage = myApp.photoBrowser({
        photos: [
            'img/01.jpg',
            'img/02.jpg',
            'img/03.jpg',
            'img/04.jpg',
            'img/05.jpg',
            'img/06.jpg',
            'img/07.jpg',
            'img/08.jpg',
            'img/09.jpg',
            'img/10#.jpg'
        ],
        maxZoom: 4,
        minZoom: 2,
        zoom: true,
        type: 'page',
        backLinkText: 'Back'
    });
    myPhotoBrowserPage.open();
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");

    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/sh-scan/batches/new/count/" + getPatientId(),
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            $$('#new-scans-badge').text(data.count);
        },
        error: function () {
            myApp.alert("bad");
        }
    });
});

$$(document).on('pageInit', '.page[data-page="new-scans"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"

    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/sh-scan/batches/new/" + getPatientId(),
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var htmlObj = '';
            for (var i = 0; i < data.length; i++) {
                htmlObj += '<li><a href="#" class="item-link item-content">';
                htmlObj += '<div class="item-media"><i class="f7-icons">folder</i></div>';
                htmlObj += '<div class="item-inner">';
                htmlObj += '<div class="item-title">' + data[i].title + '</div>';
                htmlObj += '<div class="item-after"></div>';
                htmlObj += '</div></a></li>';
            }

            $$('#new-scans-list').html(htmlObj);
        },
        error: function () {
            myApp.alert("bad");
        }
    });
    //photoBroswer();
})

$$(document).on('pageReinit', '.page[data-page="new-scans"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //photoBroswer();
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/sh-scan/batches/new/" + getPatientId(),
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var htmlObj = '';
            for (var i = 0; i < data.length; i++) {
                htmlObj += '<li><a href="#" class="item-link item-content">';
                htmlObj += '<div class="item-media"><i class="f7-icons">folder</i></div>';
                htmlObj += '<div class="item-inner">';
                htmlObj += '<div class="item-title">' + data[i].title + '</div>';
                htmlObj += '<div class="item-after"></div>';
                htmlObj += '</div></a></li>';
            }

            $$('#new-scans-list').html(htmlObj);
        },
        error: function () {
            myApp.alert("bad");
        }
    });
})

$$(document).on('pageInit', '.page[data-page="history"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"

    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/sh-scan/batches/" + getPatientId(),
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var htmlObj = '';
            for (var i = 0; i < data.length; i++) {
                htmlObj += '<li><a href="#" class="item-link item-content">';
                htmlObj += '<div class="item-media"><i class="f7-icons">folder</i></div>';
                htmlObj += '<div class="item-inner">';
                htmlObj += '<div class="item-title">' + data[i].title + '</div>';
                htmlObj += '<div class="item-after"></div>';
                htmlObj += '</div></a></li>';
            }

            $$('#history-scans-list').html(htmlObj);
        },
        error: function () {
            myApp.alert("bad");
        }
    });
    //photoBroswer();
})

$$(document).on('pageReinit', '.page[data-page="history"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //photoBroswer();
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/sh-scan/batches/" + getPatientId(),
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var htmlObj = '';
            for (var i = 0; i < data.length; i++) {
                htmlObj += '<li><a href="#" class="item-link item-content">';
                htmlObj += '<div class="item-media"><i class="f7-icons">folder</i></div>';
                htmlObj += '<div class="item-inner">';
                htmlObj += '<div class="item-title">' + data[i].title + '</div>';
                htmlObj += '<div class="item-after"></div>';
                htmlObj += '</div></a></li>';
            }

            $$('#history-scans-list').html(htmlObj);
        },
        error: function () {
            myApp.alert("bad");
        }
    });
})

function getOSToken() {
    var osData = {
        "auth": {
            "identity": {
                "methods": ["password"],
                "password": {
                    "user": {
                        "id": "4b16f07df0254fcb854c1c734cf780d8",
                        "password": "A^Kg2YLj-M~TY4H["
                    }
                }
            }, "scope": {
                "project": {
                    "id": "030eb5e2bee640ecb5fcee9bfe779bdf"
                }
            }
        }
    };

    var token = "";
    $$.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(osData),
        url: "https://lon-identity.open.softlayer.com/v3/auth/tokens",
        timeout: 15000,
        cache: false,
        success: function (res, status, xhr) {
            token = xhr.getResponseHeader("X-Subject-Token");
            $$('#imageGalleyDiv').html("");
            var htmlObjList = "";
            for (var i = 1; i < 2; i++) {
                var img = "0" + i + ".jpg";
                var base64 = "";

                $$.ajax({
                    type: "GET",
                    headers: { "X-Auth-Token": token },
                    url: "https://lon.objectstorage.open.softlayer.com/v1/AUTH_030eb5e2bee640ecb5fcee9bfe779bdf/SH-SCAN/"+img,
                    timeout: 15000,
                    cache: false,
                    success: function (resImg, statusImg, xhrImg) {
                        var base64EncodedStr = resImg;
                        console.log("here");
                        var u = "https://lon.objectstorage.open.softlayer.com/v1/AUTH_030eb5e2bee640ecb5fcee9bfe779bdf/SH-SCAN/" + img;
                        var h = token;
                        dtu(u,h);
                        //$$('#imageGalleyDiv').text(xhrImg.response);
                        /*
                        var htmlObj = '';
                        htmlObj = '<div class="responsive">';
                        htmlObj += '<div class="gallery">';
                        htmlObj += '<a target="_blank" href="' + img + '">';
                        htmlObj += '<img src="data:image/jpeg;raw,'+resImg+'"width="300" height="200">';
                        htmlObj += '</a>';
                        htmlObj += '<div class="desc">' + i + '</div>';
                        htmlObj += '</div>';
                        htmlObj += '</div>';
                        htmlObjList += htmlObj;
                        */
                        //$$('#imageGalleyDiv').text(base64EncodedStr);
                        //var decodedFile = new Buffer(resImg, 'base64');
                        //var reader = new window.FileReader();
                        
                       

                        //$$('#imageGalleyDiv').text();
                        //$$('#imageGalleyDiv').html(htmlObj);
                    },
                    error: function () {
                        myApp.alert("bad");
                    }
                });





                
                
            }
            //$$('#imageGalleyDiv').html(res);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            token = "Error";
            myApp.alert(token);
        }
    });
}

var handleFileSelect = function (file) {
    var reader = new window.FileReader();
    console.log('created reader');

    try {
        var i, l, d, arr;
        d = file;
        l = d.length;
        console.log(l);
        arr = new Uint8Array(l);
        for (var i = 0; i < l; i++) {
            arr[i] = d.charCodeAt(i);
        }
        var b = new Blob(arr, { type: 'image/jpeg' });

        console.log(Base64.encode('dankogai'));
        console.log("created blob");
        console.log(btoa(escape(file)));
        console.log(b);

        var str2 = decodeURIComponent(escape(window.atob(file)));
        
        //console.log(str2);
    }
    catch (err) {
        console.log(err.message);
    }

};

function reqListener() {
    console.log(this.response);
}

function dtu(u, h) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", u, true);
    //oReq.responseType = 'arraybuffer';
    oReq.setRequestHeader("X-Auth-Token", h);
    oReq.send();
}

function toDataURL2() {
    try {
        console.log("c");
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://jsfiddle.net/img/logo.png', true);
        xhr.responseType = 'arraybuffer';
        xhr.send();
        console.log("c:"+xhr.response);
    }
    catch (err) {

        console.log(err.message);
    }
}


$$(document).on('pageInit', '.page[data-page="imgpage"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    getOSToken();
})

$$(document).on('pageReinit', '.page[data-page="imgpage"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    getOSToken();
})