window.onload = () => {
    init();
}

async function init() {
    const items   = await getValueFromStroage(['sources', 'destinations']);
    const storage = isSource() ? 
                        items.sources[getTargetIndex()]:
                        items.destinations[getTargetIndex()];

    if (isSource()) {
        $('.container-overwrite').hide();
    } else {
        $('.container-overwrite').show();
    }

    $('#field_name').val(storage[`field_${getFieldIndex()}`].name);
    $('#field_value').val(storage[`field_${getFieldIndex()}`].value);
    $('#field_label').val(storage[`field_${getFieldIndex()}`].label);
    $('#field_id').val(storage[`field_${getFieldIndex()}`].id);
    $('#field_type').val(storage[`field_${getFieldIndex()}`].type);
    $('#allow_data_overwrite').prop('checked', storage[`field_${getFieldIndex()}`].overwrite);

    $('.btn-save').click(saveButtonClicked);
}

async function saveButtonClicked() {
    const items = await getValueFromStroage(['sources', 'destinations']);
    const obj   = {
        name: $('#field_name').val(),
        label: $('#field_label').val(),
        id: $('#field_id').val(),
        value: $('#field_value').val(),
        type: $('#field_type').val(),
        overwrite: $('#allow_data_overwrite').is(':checked')
    };
    
    if (isSource()) {
        obj.enabled = items.sources[getTargetIndex()][`field_${getFieldIndex()}`].enabled;
        items.sources[getTargetIndex()][`field_${getFieldIndex()}`] = obj;
        setValueToStorage({'sources': items.sources});
    } else {
        obj.enabled = items.destinations[getTargetIndex()][`field_${getFieldIndex()}`].enabled;
        items.destinations[getTargetIndex()][`field_${getFieldIndex()}`] = obj;
        setValueToStorage({'destinations': items.destinations});
    }

    location.href = chrome.extension.getURL(`html/fields.html?target=${getTarget()}&target_index=${getTargetIndex()}&edit=true`);
}