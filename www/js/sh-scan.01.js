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

var myPhotoBrowserPage = myApp.photoBrowser({
    photos: [
        'img/01.jpg',
        'http://lorempixel.com/1024/1024/sports/2/',
        'http://lorempixel.com/1024/1024/sports/3/',
    ],
    type: 'page',
    backLinkText: 'Back'
});

$$('.pb-page').on('click', function () {
    myPhotoBrowserPage.open();
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

$$(document).on('pageInit', '.page[data-page="history"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page3 Init');
})

$$(document).on('pageReinit', '.page[data-page="history"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page3 Reinit');
})