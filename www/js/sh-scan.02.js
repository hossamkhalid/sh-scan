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
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

$$(document).on('pageInit', '.page[data-page="history"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page3 Init');
    //photoBroswer();
})

$$(document).on('pageReinit', '.page[data-page="history"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page3 Reinit');
    //photoBroswer();
})