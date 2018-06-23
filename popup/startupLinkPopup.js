
initialize();
initEvents();

function initialize() {
    var storage = browser.storage.local.get(null);
    storage.then((result) => {
        var keys = Object.keys(result);
        for (let key of keys) {
            loadLink(key, result[key]);
        }
    });
}

function loadLink(key, body) {
    $('.bd-main input[type="text"]').val(body.reference);
    $('.bd-main input[type="checkbox"]').prop('checked', body.pinned);
    $('.bd-main .form-group').attr('data-item-id', key);
}

function setLink(e) {
    var $event = $(e.target);
    var $baseElement = $event.closest('.form-group');

    var link = {};
    link.id = $baseElement.data('item-id');
    link.reference = $baseElement.find('input.form-control[type="text"]').val();
    link.pinned = $baseElement.find('input.form-control[type="checkbox"]').prop('checked');
    
    browser.storage.local.set({ [link.id]: link });
}


function addLinkForm() {
    var linkForm = `    
        <div class="form-group">
            <label>Link</label>
            <input type="text" class="form-control">
            <input type="checkbox">
            <input type="button" class="remove-link" value="Remove">
        </div>`;

    var $linkForm = $(linkForm);
    var $linkContainer = $('.link-container');
    $linkForm.attr("data-item-id", "link" + $linkContainer.children('.form-group').length);
    
    $linkContainer.append($linkForm);
}

function initEvents() {
    $('.form-group input[type="text"]').keyup(setLink);
    $('.form-group input[type="checkbox"]').change(setLink);
    $('.bd-main .add-link').click(addLinkForm);
}