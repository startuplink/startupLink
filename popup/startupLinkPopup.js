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

function loadLink(key, body) {
    $('.bd-main input[type="text"]').val(body.reference);
    $('.bd-main input[type="checkbox"]').prop('checked', body.pinned);
    $('.bd-main .form-group').attr('data-link-id', key);
}

function setLink(e) {
    var $event = $(e.target);
    var $baseElement = $event.closest('.form-group');

    var link = {};
    link.id = $baseElement.data('link-id');
    link.reference = $baseElement.find('input.form-control[type="text"]').val();
    link.pinned = $baseElement.find('input.form-control[type="checkbox"]').prop('checked');
    
    browser.storage.local.set({ [link.id]: link });
}


function addLinkForm(data) {
    var linkForm = `    
        <div class="form-group">
            <label>Link</label>
            <input type="text" class="form-control">
            <input type="checkbox" class="form-control">
            <input type="button" class="remove-link" value="Remove">
        </div>`;


    var $linkForm = $(linkForm);
    var $linkContainer = $('.link-container');
    $linkForm.attr("data-link-id", "link" + $linkContainer.children('.form-group').length);
    
    $linkContainer.append($linkForm);
    $linkForm.find('.remove-link').click(removeLinkForm);
    
    var $linkInput = $linkForm.find('input[type="text"]');
    var $linkPinned = $linkForm.find('input[type="checkbox"]');

    if (data) {
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

function initEvents() {
    $('.bd-main .add-link').click(addLinkForm);
}