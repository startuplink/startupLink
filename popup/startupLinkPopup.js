import $ from 'jquery';
import './startupLinkPopup.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'webextension-polyfill';

const URL = "https://startuplink-web.com"

var gettingCookies = browser.cookies.get({
    url: URL,
    name: "auth-session"
});

gettingCookies.then((cookie) => {
    if (cookie) {
        $('.bd-main .login').hide();
    } else {
        $('.bd-main .sync-data').hide();
    }

    initialize();
    initEvents();
});


function initialize() {
    var storage = browser.storage.local.get(null);
    storage.then((result) => {
        var keys = Object.keys(result);
        for (let key of keys) {
            addLinkForm(result[key]);
        }
    });
}

function setLink(e) {
    var $event = $(e.target);
    var $baseElement = $event.closest('.link-form-group');
    if (!$baseElement.find('.url').val()) {
        return;
    }

    var link = {};
    link.id = $baseElement.data('link-id');
    link.url = $baseElement.find('.url').val();
    link.pinned = $baseElement.find('.pinned').prop('checked');

    saveLinkInLocalStorage(link)
}

function saveArrayOfLinksInLocalStorage(links) {
    for (let i = 0; i < links.length; i++) {
        saveLinkInLocalStorage(links[i]);
    }
}

function saveLinkInLocalStorage(link) {
    browser.storage.local.set({[link.id]: link});
}


function addLinkForm(data) {
    cleanupAlertMessages();
    var linkForm = `
            <div class="row link-form-group">
                <label class="col-1 col-form-label">Link</label>
                <div class="col-7">
                  <input type="url" class="form-control url">
                </div>
                <div class="col-1 text-center">
                  <input type="checkbox" class="form-control pinned">
                </div>
                <div class="col-1">
                  <p>Pinned</p>
                </div>
                <div class="col-2 text-center"">
                  <a class="btn btn-danger remove-link"><i class="fas fa-eraser"></i></a>
                </div>
            </div>`;


    var $linkForm = $(linkForm);
    var $linkContainer = $('.link-container');

    $linkContainer.append($linkForm);
    $linkForm.find('.remove-link').click(removeLinkForm);

    var $linkInput = $linkForm.find('.url');
    var $linkPinned = $linkForm.find('.pinned');

    if (data && data.id) {
        $linkForm.attr('data-link-id', data.id);
        $linkPinned[0].checked = data.pinned;
        $linkInput.val(data.url);
    } else {
        $linkForm.attr("data-link-id", "link" + $linkContainer.children('.link-form-group').length);
    }

    $linkInput.keyup(setLink);
    $linkPinned.change(setLink);
}

function removeLinkForm(event) {
    var $target = $(event.target);
    var $formElement = $target.closest('.link-form-group');
    browser.storage.local.remove([$formElement.data('link-id')]);
    $formElement.remove();
}

function openLinks() {
    cleanupAlertMessages();
    browser.tabs.query({currentWindow: true}).then(
        function (tabsOnCurrentWindow) {
            var existedUrls = $.map(tabsOnCurrentWindow, (tab) => tab.url);

            var $formLinks = $('.link-form-group');
            var openedEvenOneTab = false;
            $.each($formLinks, (index, element) => {
                var $element = $(element);
                var $urlInput = $element.find('.url');
                if (!$urlInput.val() || $urlInput.is(':invalid')) {
                    return;
                }

                // check url by domains
                // if we have link with the same domain - don't open it
                if (existedUrls.includes($urlInput.val())) {
                    return;
                }
                openedEvenOneTab = true;
                browser.tabs.create({
                    url: $urlInput.val(),
                    pinned: $element.find('.pinned').prop('checked')
                });
            });

            if (!openedEvenOneTab) {
                $('.link-container').append(`
          <div class="alert alert-warning" role="alert">
            All links (domains) already opened!
          </div>
        `);
            }
        }
    );
}

function loginUser() {
    browser.tabs.create({
        url: URL + "/login"
    });
}

function fetchLinksFromServer() {
    $.get(URL + "/get-links", function (data) {
        let links = []
        for (const dataKey in data) {
            console.log(dataKey + ": " + data[dataKey].url);
            console.log(dataKey + ": " + data[dataKey].pinned);

            let link = {
                id: "link" + dataKey,
                url: data[dataKey].url,
                pinned: data[dataKey].pinned,
            };

            links.push(link)
        }
        browser.storage.local.clear();
        saveArrayOfLinksInLocalStorage(links);

        // reinit
        // because '$('.link-container').empty()' doesn't work I use this code
        document.getElementsByClassName('link-container')[0].innerHTML = ''
        initialize();
    });
}

function initEvents() {
    $('.bd-main .add-link').click(addLinkForm);
    $('.bd-main .open-links').click(openLinks);
    $('.bd-main .login').click(loginUser);
    $('.bd-main .sync-data').click(fetchLinksFromServer)
}

function getDomain(url) {
    return url.split('/')[2];
}

function cleanupAlertMessages() {
    $('.alert.alert-warning').remove();
}
