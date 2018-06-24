var $body = $(".body");

initialize();
initEvents();

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
    var $baseElement = $event.closest('.form-group');

    var link = {};
    link.id = $baseElement.data('link-id');
    link.reference = $baseElement.find('input.url').val();
    link.pinned = $baseElement.find('input.pinned').prop('checked');

    browser.storage.local.set({ [link.id]: link });
}


function addLinkForm(data) {
    var linkForm = `    
        <div class="form-group align-items-center">
            <label class="col-2 col-form-label">Link</label>
            <div class="col-8">
                <input type="url" class="form-control url">
            </div>
            <div class="col-1">
                <input type="checkbox" class="form-control pinned">
            </div>
            <div class="col-1">
                <input type="button" class="form-control btn btn-secondary remove-link" value="Remove">
            </div>
        </div>`;


    var $linkForm = $(linkForm);
    var $linkContainer = $('.link-container');
    $linkForm.attr("data-link-id", "link" + $linkContainer.children('.form-group').length);

    $linkContainer.append($linkForm);
    $linkForm.find('.remove-link').click(removeLinkForm);

    var $linkInput = $linkForm.find('input.url');
    var $linkPinned = $linkForm.find('input.pinned');

    if (data && data.id) {
        $linkForm.attr('data-link-id', data.id);
        $linkPinned[0].checked = data.pinned;
        $linkInput.val(data.reference);
    }

    $linkInput.keyup(setLink);
    $linkPinned.change(setLink);
}

function removeLinkForm(event) {
    var $target = $(event.target);
    var $formElement = $target.closest('.form-group');
    browser.storage.local.remove([$formElement.data('link-id')]);
    $target.closest('.form-group').remove();
}

function openLinks() {
    var $formLinks = $('.form-group');
    $.each($formLinks, (index, element) => {
        var $element = $(element);
        var $urlInput = $element.find('.url');
        if (!$urlInput.val() || $urlInput.is(':invalid')) {
            return;
        }
        browser.tabs.create({
            url: $urlInput.val(),
            pinned: $element.find('.pinned').prop('checked')
        });
    });
}

function initEvents() {
    $('.bd-main .add-link').click(addLinkForm);
    $('.bd-main .open-links').click(openLinks);
}