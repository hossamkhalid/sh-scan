// Initialize app
var myApp = new Framework7({
    pushState: true,
    tapHold: true //enable tap hold events
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var osKey = "";
var cats = ['CT', 'ECG', 'ECHO', 'EYE-SONAR', 'FIELD-OF-VISION', 'FLUORESCEIN-ANGIO', 'MRI', 'MULTI-SLICE', 'OCT', 'PENTACAM', 'PET', 'SONAR', 'TOPOGRAPHY', 'X-RAY'];
var scanValue = "";
var ibmClientId = "";
var ibmClientSecret = "";
var patientId = "";

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
    return ibmClientId;
}

function getClientSecret() {
    return ibmClientSecret;
}

function getPatientId() {
    return patientId;
}

function getApiBasePath() {
    return "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/api/";
}

function getSecurityBasePath() {
    return "https://api.eu.apiconnect.ibmcloud.com/hksandbox-dev/shscancatalog/sh-scanner-security/";
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
    if (osKey == null || osKey == "") {
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
                loadSettings();
                loadHistoryCategory();
            },
            error: function (xhr, status) {
                myApp.alert("Error Getting Keys: " + xhr.responseText);
            }
        });
    } 

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
            if (data.count > 0) {
                var notificationHtml = "bell";
                window.localStorage.setItem("sh-scan-new-notification", data.count + "");
                $$('i[name="new-scans-notification"]').html(notificationHtml + '<span class="badge bg-red">' + data.count + '</span>');
            }
        },
        error: function (xhr, status) {
            myApp.alert("Error New Scan Count: " + xhr.responseText);
        }
    });
}

function loadNewScans() {
    myApp.showPreloader();
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
            myApp.hidePreloader();
        },
        error: function (xhr, status) {
            myApp.hidePreloader();
            myApp.alert("Error New Scans: " + xhr.responseText);
        }
    });
}

function loadHistory() {
    myApp.showPreloader();
    var newNotificationCount = window.localStorage.getItem("sh-scan-new-notification");
    var notificationHtml = "bell";
    if (newNotificationCount > 0) {
        $$('i[name="new-scans-notification"]').html(notificationHtml + '<span class="badge bg-red">' + newNotificationCount + '</span>');
    } else {
        $$('i[name="new-scans-notification"]').html(notificationHtml);
    }
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
                    folderHtml = '<div class="item-media"><i class="f7-icons color-teal">folder_fill</i></div>';
                } else {
                    folderHtml = '<div class="item-media"><i class="f7-icons color-teal">folder</i></div>';
                }
                htmlObj += '<li class="swipeout">';
                //htmlObj += '<div class="swipeout-content item-content">';
                htmlObj += '<a href="#" class="sharescan swipeout-content item-link item-content pb-page" scanid="' + data[i].id + '" isnewscan="' + data[i].isnew + '">';
                htmlObj += folderHtml;
                htmlObj += '<div class="item-inner">';
                htmlObj += '<div class="item-title-row">';
                htmlObj += '<div class="item-title">' + data[i].lab.name + '</div>';
                //htmlObj += '<div class="item-after">' + timestampToDateTime(data[i].scandate) + '</div>';
                htmlObj += '</div>';
                htmlObj += '<div class="item-subtitle">' + timestampToDateTime(data[i].scandate) + '</div>';
                htmlObj += '</div>';
                htmlObj += '</a>';
                //htmlObj += '</div>';
                htmlObj += '<div class="swipeout-actions-left"><a href="#" class="action1 bg-teal" linktype ="share" scanid="' + data[i].id + '"><i class="f7-icons">forward_fill</i></a></div>';
                htmlObj += '</li>';
            }
            $$('#history-scans-list').html(htmlObj);
            $$('#history-navbar-title').html(scanValue);
            myApp.hidePreloader();
        },
        error: function (xhr, status) {
            myApp.hidePreloader();
            myApp.alert("Error History: " + xhr.responseText);
        }
    });
}

function loadHistoryCategory() {
    myApp.showPreloader();

    console.log("start");
    var historyPageCache = window.localStorage.getItem("sh-scan-cache-history-category");
    var historyPageCacheExpiry = window.localStorage.getItem("sh-scan-cache-history-category-expiry");

    if (isCacheExpired(historyPageCacheExpiry)) {
        console.log("cache expired - history category page");
        $$.ajax({
            type: "GET",
            headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
            data: "",
            url: getApiBasePath() + "scans?filter[where][patient]=" + getPatientId(),
            timeout: 15000,
            dataType: 'json',
            cache: false,
            success: function (data) {
                for (var i = 0; i < cats.length; i++) {
                    $$('#history-category-' + cats[i]).text(0);
                    $$('#history-category-new-' + cats[i]).text("folder");
                }

                window.localStorage.setItem("sh-scan-cache-history-category", JSON.stringify(data));
                window.localStorage.setItem("sh-scan-cache-history-category-expiry", getNewExpiry() + "");

                for (var i = 0; i < data.length; i++) {
                    var count = $$('#history-category-' + data[i].category).text();
                    count++;
                    $$('#history-category-' + data[i].category).text(count);

                    if (data[i].isnew == "Y") {
                        var icon = $$('#history-category-new-' + data[i].category).text();
                        icon += "_fill";
                        $$('#history-category-new-' + data[i].category).text(icon);
                    }
                }
                myApp.hidePreloader();
            },
            error: function (xhr, status) {
                myApp.hidePreloader();
                myApp.alert("Error History Category: " + xhr.responseText);
            }
        });
    } else {
        console.log("cache not expired - history category page");
        if (historyPageCache == null || historyPageCache == "") {
            console.log("No valid cache - history category page");

            $$.ajax({
                type: "GET",
                headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
                data: "",
                url: getApiBasePath() + "scans?filter[where][patient]=" + getPatientId(),
                timeout: 15000,
                dataType: 'json',
                cache: false,
                success: function (data) {
                    for (var i = 0; i < cats.length; i++) {
                        $$('#history-category-' + cats[i]).text(0);
                        $$('#history-category-new-' + cats[i]).text("folder");
                    }

                    window.localStorage.setItem("sh-scan-cache-history-category", JSON.stringify(data));
                    window.localStorage.setItem("sh-scan-cache-history-category-expiry", getNewExpiry() + "");

                    for (var i = 0; i < data.length; i++) {
                        var count = $$('#history-category-' + data[i].category).text();
                        count++;
                        $$('#history-category-' + data[i].category).text(count);

                        if (data[i].isnew == "Y") {
                            var icon = $$('#history-category-new-' + data[i].category).text();
                            icon += "_fill";
                            $$('#history-category-new-' + data[i].category).text(icon);
                        }
                    }
                    myApp.hidePreloader();
                },
                error: function (xhr, status) {
                    myApp.hidePreloader();
                    myApp.alert("Error History Category: " + xhr.responseText);
                }
            });
            
        } else {
            console.log("cache valid - history category page");
            for (var i = 0; i < cats.length; i++) {
                $$('#history-category-' + cats[i]).text(0);
                $$('#history-category-new-' + cats[i]).text("folder");
            }

            var cache = JSON.parse(window.localStorage.getItem("sh-scan-cache-history-category"));

            for (var i = 0; i < cache.length; i++) {
                var count = $$('#history-category-' + cache[i].category).text();
                count++;
                $$('#history-category-' + cache[i].category).text(count);
                if (cache[i].isnew == "Y") {
                    var icon = $$('#history-category-new-' + cache[i].category).text();
                    icon += "_fill";
                    $$('#history-category-new-' + cache[i].category).text(icon);
                }
            }
            myApp.hidePreloader();
        }
    }  
}

function clearHistoryCategoryCache() {
    window.localStorage.removeItem("sh-scan-new-notification");
    window.localStorage.removeItem("sh-scan-cache-history-category");
    window.localStorage.removeItem("sh-scan-cache-history-category-expiry");
}

function openPhotoBrowser(scanid, isNewScan) {
    $$.ajax({
        type: "GET",
        headers: { "X-IBM-Client-Id": getClientId(), "X-IBM-Client-Secret": getClientSecret() },
        data: "",
        url: getApiBasePath() + "images?filter[where][and][0][scan]=" + scanid + "&filter[where][and][1][patient]=" + getPatientId(),
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
                navbar: false,
                toolbar: false,
                exposition: false
            });

            if (isNewScan == "Y")
                updateScanReadValue(scanid);

            myPhotoBrowserPage.open();
        },
        error: function (xhr, status) {
            myApp.alert("Error Image Viewer: " + xhr.responseText);
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
        url: getApiBasePath() + "scans/update?where[and][0][id]=" + scanid + "&where[and][1][patient]=" + getPatientId(),
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            var newNotificationCount = window.localStorage.getItem("sh-scan-new-notification");
            if (newNotificationCount > 0) {
                newNotificationCount--;
                window.localStorage.setItem("sh-scan-new-notification", newNotificationCount + "");
            }
            var notificationHtml = "bell";
            if (newNotificationCount > 0) {
                $$('i[name="new-scans-notification"]').html(notificationHtml + '<span class="badge bg-red">' + newNotificationCount + '</span>');
            } else {
                $$('i[name="new-scans-notification"]').html(notificationHtml);
            }
        },
        error: function (xhr, status) {
            myApp.alert("Error Update Scan: " + xhr.responseText);
        }
    });
}

function login(username, password) {
    myApp.showPreloader();
    var obj = { 'email': username, 'hash': password };
    $$.ajax({
        type: "POST",
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: getSecurityBasePath() + "login",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data.code == 0) {
                ibmClientId = data.key;
                ibmClientSecret = data.secret;
                patientId = data.patientid;
                window.localStorage.setItem("sh-scan-id", patientId);
                window.localStorage.setItem("sh-scan-device-id", data.deviceid);
                if (data.active) {
                    window.localStorage.setItem("sh-scan-activated", "true");
                } else {
                    window.localStorage.setItem("sh-scan-activated", "false");
                }                
                loadIndexPage();
                myApp.closeModal('.login-screen');                
                
                myApp.hidePreloader();
            } else {
                myApp.hidePreloader();
                myApp.alert("Invalid credentials");
            }
        },
        error: function (xhr, status) {
            myApp.hidePreloader();
            myApp.alert("Error during login: " + xhr.status);
        }
    });
}

function loginDevice() {

    var obj = { 'deviceid': window.localStorage.getItem("sh-scan-device-id") };
    console.log(JSON.stringify(obj));
    var activated = window.localStorage.getItem("sh-scan-activated");
    console.log(activated);
    if (activated == "false") {
        console.log("Not activated");
        $$('#activateScreen').removeClass('hiddenItem');
        $$('#loginScreen').addClass('hiddenItem');
        myApp.hidePreloader();
        myApp.loginScreen();
    } else {
        console.log("activated");
        $$.ajax({
            type: "POST",
            data: JSON.stringify(obj),
            contentType: 'application/json',
            url: getSecurityBasePath() + "logindevice",
            timeout: 15000,
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.code === 0) {
                    if (data.active) {
                        ibmClientId = data.key;
                        ibmClientSecret = data.secret;
                        patientId = data.patientid;
                        console.log("here");
                        window.localStorage.setItem("sh-scan-id", patientId);
                        window.localStorage.setItem("sh-scan-device-id", obj.deviceid);
                        window.localStorage.setItem("sh-scan-activated", "true");
                        loadIndexPage();
                        myApp.hidePreloader();
                    } else {
                        console.log("Not activated");
                        window.localStorage.setItem("sh-scan-activated", "false");
                        $$('#activateScreen').removeClass('hiddenItem');
                        $$('#loginScreen').addClass('hiddenItem');
                        myApp.hidePreloader();
                        myApp.loginScreen();
                    }
                } else {
                    myApp.hidePreloader();
                    myApp.loginScreen();
                }
            },
            error: function (xhr, status) {
                myApp.hidePreloader();
                myApp.alert("Error during login: " + xhr.responseText);
                console.log("Error during login: " + xhr.status);
            }
        });
    }
}

function loadSettings() {
    var lang = window.localStorage.getItem("sh-scan-lang");
    if(lang == null || lang == "") {
        window.localStorage.setItem("sh-scan-lang", "en");  
    }
    var lang = window.localStorage.getItem("sh-scan-lang");
    $$("#settings-lang-input-" + lang).prop('checked', true);
    if (lang == "ar") {
        $$("head").append('<link id="css-rtl-support" rel="stylesheet" href="lib/framework7/css/framework7.ios.rtl.min.css">');
    }
}

function isCacheExpired(timestamp) {
    if (timestamp == null || timestamp == "") {
        return true;
    }

    var current = Math.floor(Date.now() / 1000);
    if (timestamp >= current) {
        return false;
    }
    return true;
}

function getNewExpiry() {
    var current = Math.floor(Date.now() / 1000);
    current += 300;
    return current;
}

$$('#loginBtn').on('click', function () {
    var username = $$('#loginEmail').val().trim();
    var password = $$('#loginPassword').val();
    login(username, password); 
});

// Handle Cordova Device Events
$$(document).on('deviceready', function () {
    myApp.showPreloader();
    loginDevice();
    //loadIndexPage();
    //myApp.alert("No Wait");
    //myApp.loginScreen();
});

$$(document).on('pageReinit', '.page[data-page="index"]', function (e) {
    loadIndexPage();
    //myApp.loginScreen();
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
    openPhotoBrowser(scanid, isNewScan);

    //if (isNewScan == "Y")
    //    updateScanReadValue(scanid);
});

$$(document).on('click', 'a[scan-type="history-category"]', function (e) {
    scanValue = $$(this).attr("scan-value");
    loadHistory(scanValue);
});

$$(document).on('click', 'a[linktype="share"]', function (e) {
    console.log("Contacts: " + navigator.contacts.length);
    navigator.contacts.pickContact(function (contact) {
        var name = contact.displayName;
        console.log('The following contact has been selected:' + name);
        myApp.alert("Sharing scan with "+name);
    }, function (err) {
        console.log('Error: ' + err);
    });
    //myApp.alert("Sharing scan " + $$(this).attr("scanid") + "...");
});

$$(document).on('click', 'a[id="sidenav-home"]', function (e) {
    console.log($$("head"));
    $$("head").append('<link rel="stylesheet" href="lib/framework7/css/framework7.ios.rtl.min.css">');
});

$$(document).on('click', 'div[id="settings-lang-ar"]', function (e) {
    console.log("ar");
    window.localStorage.setItem("sh-scan-lang", "ar");
    window.location.reload(true);
});

$$(document).on('click', 'div[id="settings-lang-en"]', function (e) {
    console.log("en");
    window.localStorage.setItem("sh-scan-lang", "en");
    window.location.reload(true);
});

$$(document).on('taphold', '.sharescan', function (e) {
    var scanid = $$(this).attr("scanid");
    var isNewScan = $$(this).attr("isnewscan");
    
    var buttons = [
        {
            text: 'Open',
            color: 'teal',
            onClick: function () {
                openPhotoBrowser(scanid, isNewScan);

                //if (isNewScan == "Y")
                //    updateScanReadValue(scanid);
            }
        },
        {
            text: 'Share',
            color: 'teal',
            onClick: function () {
                console.log("Contacts: " + navigator.contacts.length);
                navigator.contacts.pickContact(function (contact) {
                    var name = contact.displayName;
                    console.log('The following contact has been selected:' + name);
                    myApp.alert("Sharing scan with " + name);
                }, function (err) {
                    console.log('Error: ' + err);
                });
            }
        },
        {
            text: 'More Information',
            color: 'teal',
            onClick: function () {
                
            }
        },
        {
            text: 'Cancel',
            color: 'red',
            onClick: function () {
                
            }
        },
    ];
    myApp.actions(buttons);
    
    //myApp.alert("Sharing scan " + $$(this).attr("scanid") + "...");
});

$$('#registerBtn').on('click', function () {
    var invalid = false;
    var username = $$('#registerEmail').val().trim();
    if (!validateEmail(username)) {
        invalid = true;
    }
    var password = $$('#registerPassword').val();
    var confirmPassword = $$('#registerPasswordConfirm').val();
    if (password.length == 0 || password != confirmPassword) {
        invalid = true;
    }

    var patientName = $$('#registerName').val();
    if (patientName.length == 0) {
        invalid = true;
    }
    var country = $$('#registerCountry').val();
    var phone = $$('#registerMobile').val().trim();
    
    phone = phone.replace("+", "");
    if (phone.startsWith("0")) {
        phone = phone.replace(/^0+/, "");
    }

    if (phone.length < 10) {
        invalid = true;
    } else {
        phone = country + phone;
    }

    var active = false;

    if (invalid) {
        myApp.alert("Invalid");
    } else {
        myApp.showPreloader();
        register(username, password, patientName, phone);
    }
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


$$('#activateBtn').on('click', function () {
    var code = $$('#activateCode').val().trim();
    myApp.showPreloader();
    activate(code);
});

$$('#logoutBtn').on('click', function () {
    logout();
});

function activate(code) {
    var patientId = window.localStorage.getItem("sh-scan-id");
    var obj = {
        'patientid': patientId,
        'code': code
    }
    $$.ajax({
        type: "POST",
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: getSecurityBasePath() + "activate",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data.code === 0) {
                clearHistoryCategoryCache();
                myApp.hidePreloader();
                window.localStorage.setItem("sh-scan-activated", "true");
                loginDevice();
                console.log("active");
                window.location.reload(true);
            } else {
                myApp.hidePreloader();
                myApp.alert("fail");
            }
        },
        error: function (xhr, status) {
            myApp.hidePreloader();
            console.log("Error during activation: " + xhr.responseText);
        }
    });
}

function register(username, password, patientName, phone) {
    var deviceId = uuidv4();
    var obj = {
        'email': username,
        'hash': password,
        'name': patientName,
        'phone': phone,
        'active': false,
        'registered': currentTimestamp = Math.floor(Date.now() / 1000) + '',
        'deviceid': deviceId
    };

    $$.ajax({
        type: "POST",
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: getSecurityBasePath() + "register",
        timeout: 15000,
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data.code === 0) {
                myApp.hidePreloader();
                window.localStorage.setItem("sh-scan-id", data.id);
                window.localStorage.setItem("sh-scan-device-id", deviceId);
                window.localStorage.setItem("sh-scan-activated", "false");
                console.log("Patient: " + data.id);
                console.log("Device: " + deviceId);
                console.log("Activation Code: " + data.activationcode);

                $$('#activateScreen').removeClass('hiddenItem');
                $$('#loginScreen').addClass('hiddenItem');
                window.location.reload(true);
            } else {
                myApp.hidePreloader();
                myApp.alert("fail");
            }
        },
        error: function (xhr, status) {
            myApp.hidePreloader();
            console.log("Error during registeration: " + xhr.responseText);
        }
    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function logout() {
    clearHistoryCategoryCache();
    window.localStorage.removeItem("sh-scan-id");
    window.localStorage.removeItem("sh-scan-device-id");
    window.localStorage.removeItem("sh-scan-activated");
    window.location.reload(true);
}

