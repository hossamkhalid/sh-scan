// Initialize app
var myApp = new Framework7({
    pushState: true
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var osKey = "";
var cats = ['CT', 'TOPOGRAPHY', 'SONAR', 'ECG', 'MRI', 'X-RAY', 'PET', 'ECHO', 'MULTI-SLICE'];
var scanValue = "";
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
    return "f8618d33c25ab1927d1175a0b776357a";
}

function getApiBasePath() {
    return "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/api/";
}

function getOsBasePath() {
    return "https://lon.objectstorage.open.softlayer.com";
}

function constructTempUrl(path) {
    var currentTimestamp = Math.floor(Date.now() / 1000);
    currentTimestamp += 86400; // 1 day

    var host = getOsBasePath();

    var hmacOutput = '';
    try {
        var hmacText = 'GET' + '\n' + currentTimestamp + '\n' + decodeURIComponent(path);
        var hmacTextType = 'TEXT';
        var hmacKeyInput = osKey;
        var hmacKeyInputType = 'TEXT';
        var hmacVariant = 'SHA-1';
        var hmacOutputType = 'HEX';
        var hmacObj = new jsSHA(hmacVariant, hmacTextType);
        hmacObj.setHMACKey(hmacKeyInput, hmacKeyInputType);
        hmacObj.update(hmacText);
        hmacOutput = hmacObj.getHMAC(hmacOutputType);
    } catch (e) {
        hmacOutput = e.message
    }
    var tempUrl = host + path + '?temp_url_sig=' + hmacOutput + '&temp_url_expires=' + currentTimestamp;

    return tempUrl;
}

function timestampToDateTime(timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    var day = date.getDate();
    // Minutes part from the timestamp
    var month = "0" + (date.getMonth() + 1);
    // Seconds part from the timestamp
    var year = date.getFullYear();
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    var formattedDateTime = day + '/' + month.substr(-2) + '/' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedDateTime;
}

///////////////////////////Page Functions
function loadIndexPage() {
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: getApiBasePath() + "tempkeys",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            osKey = data[0].keyvalue;
        },
        error: function () {
            myApp.alert("bad");
        }
    });

    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: getApiBasePath() + "scans/count?where[and][0][patient]=" + getPatientId() + "&where[and][1][isnew]=Y",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            $$('#new-scans-badge').text(data.count);
        },
        error: function () {
            myApp.alert("Error: Main page");
        }
    });
}

function loadNewScans() {
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: getApiBasePath() + "scans?filter[where][and][0][patient]=" + getPatientId() + "&filter[where][and][1][isnew]=Y&filter[include]=lab",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var htmlObj = '';
            for (var i = 0; i < data.length; i++) {
                var folderHtml = '';
                if (data[i].isnew == 'Y') {
                    folderHtml = '<div class="item-media"><i class="f7-icons">folder_fill</i></div>';
                } else {
                    folderHtml = '<div class="item-media"><i class="f7-icons">folder</i></div>';
                }
                htmlObj += '<li><a href="#" class="item-link item-content pb-page" scanid="' + data[i].id + '" isnewscan="' + data[i].isnew + '">';
                htmlObj += folderHtml;
                htmlObj += '<div class="item-inner">';
                htmlObj += '<div class="item-title-row"><div class="item-title">' + data[i].category + '</div><div class="item-after">' + timestampToDateTime(data[i].scandate) + '</div></div>';
                htmlObj += '<div class="item-subtitle">' + data[i].lab.name + '</div>';
                htmlObj += '</div></a></li>';
            }
            $$('#new-scans-list').html(htmlObj);
        },
        error: function () {
            myApp.alert("Error: New scan page");
        }
    });
}

function loadHistory() {
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: getApiBasePath() + "scans?filter[where][and][0][patient]=" + getPatientId() + "&filter[where][and][1][category]=" + scanValue + "&filter[include]=lab",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var htmlObj = '';
            for (var i = 0; i < data.length; i++) {
                var folderHtml = '';
                if (data[i].isnew == 'Y') {
                    folderHtml = '<div class="item-media"><i class="f7-icons">folder_fill</i></div>';
                } else {
                    folderHtml = '<div class="item-media"><i class="f7-icons">folder</i></div>';
                }
                htmlObj += '<li><a href="#" class="item-link item-content pb-page" scanid="' + data[i].id + '" isnewscan="' + data[i].isnew + '">';
                htmlObj += folderHtml;
                htmlObj += '<div class="item-inner">';
                htmlObj += '<div class="item-title-row"><div class="item-title">' + data[i].category + '</div><div class="item-after">' + timestampToDateTime(data[i].scandate) + '</div></div>';
                htmlObj += '<div class="item-subtitle">' + data[i].lab.name + '</div>';
                htmlObj += '</div></a></li>';
            }
            $$('#history-scans-list').html(htmlObj);
        },
        error: function () {
            myApp.alert("Error: History page");
        }
    });
}

function loadHistoryCategory() { 
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: getApiBasePath() + "scans?filter[where][patient]=f8618d33c25ab1927d1175a0b776357a",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            for (var i = 0; i < cats.length; i++) {
                $$('#history-category-' + cats[i]).text(0);
                $$('#history-category-new-' + cats[i]).text("folder");
            }

            for (var i = 0; i < data.length; i++) {
                var count = $$('#history-category-' + data[i].category).text();
                count++;
                $$('#history-category-' + data[i].category).text(count);

                if(data[i].isnew == "Y") {
                    var icon = $$('#history-category-new-' + data[i].category).text();
                    icon += "_fill";
                    $$('#history-category-new-' + data[i].category).text(icon);
                }
            }

            
        },
        error: function (xhr, ajaxOptions, thrownError) {
            myApp.alert("Error: History Category Error - " + thrownError);
        }
    });
}

function openPhotoBrowser(scanid) {
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: getApiBasePath() + "images?filter[where][scan]=" + scanid,
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var htmlObj = '';
            var imagesArray = [];
            for (var i = 0; i < data.length; i++) {
                imagesArray[imagesArray.length] = constructTempUrl(data[i].url);
            }

            var myPhotoBrowserPage = myApp.photoBrowser({
                photos: imagesArray,
                type: 'page',
                lazyLoading: true,
                lazyLoadingOnTransitionStart: true,
                backLinkText: 'Back'
            });

            updateScanReadValue(scanid);

            myPhotoBrowserPage.open();

        },
        error: function (e) {
            myApp.alert("Error: Image Viewer - " + e.message);
        }
    });
}

function updateScanReadValue(scanid) {
    $$.ajax({
        type: "POST",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: {
            "isnew": "N"
        },
        url: getApiBasePath() + "scans/update?where[id]=" + scanid,
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {

        },
        error: function (e) {
            myApp.alert("Error: Image Viewer - " + e.message);
        }
    });
}

// Handle Cordova Device Events
$$(document).on('deviceready', function () {
    loadIndexPage();
});

$$(document).on('pageReinit', '.page[data-page="index"]', function (e) {
    loadIndexPage();
})

$$(document).on('pageInit', '.page[data-page="new-scans"]', function (e) {
    loadNewScans();
})

$$(document).on('pageReinit', '.page[data-page="new-scans"]', function (e) {
    loadNewScans();
})

$$(document).on('pageInit', '.page[data-page="history"]', function (e) {
    loadHistory();
})

$$(document).on('pageReinit', '.page[data-page="history"]', function (e) {
    loadHistory();
})

$$(document).on('pageInit', '.page[data-page="history-category"]', function (e) {
    loadHistoryCategory();
})

$$(document).on('pageReinit', '.page[data-page="history-category"]', function (e) {
    loadHistoryCategory();
})

$$(document).on('click', '.pb-page', function (e) {
    var scanid = $$(this).attr("scanid");
    var isNewScan = $$(this).attr("isnewscan");
    openPhotoBrowser(scanid);

    if (isNewScan == "Y")
        updateScanReadValue(scanid);
});

$$(document).on('click', 'a[scan-type="history-category"]', function (e) {
    scanValue = $$(this).attr("scan-value");
    loadHistory(scanValue);
});