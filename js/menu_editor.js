var globals = {
    menu: null,
    currentId: null,
}

var elements = {
    editor: $('.editor__container'),
    editor_placeholder: $('.editor__placeholder'),
    editor_title: $('.editor__title'),
    inputs: {
        category: $('select[name="category"]'),
        name: $('input[name="name"]'),
        image: $('input[name="image"]'),
        description: $('textarea[name="description"]'),
        ingredients: $('textarea[name="ingredients"]'),
        oldPrice: $('input[name="oldPrice"]'),
        newPrice: $('input[name="newPrice"]'),
    },
}

function makeMenuEditorItems(menu) {
    globals.menu = menu;
    let list = $('.items__container');
    list.empty();

    for (const item of menu.dish) {
        const renderedItem = $(`<div class="item" data-id="${item.name['#text']}"></div>`)
        renderedItem.click(handleItemClicked);
        list.append(renderedItem)

        const renderedItemDeleteButton = $(`<button data-id="${item.name['#text']}">Удалить</button>`)
        renderedItemDeleteButton.click(handleItemDeleted);

        renderedItem.append(
            $(`<div class="item__header"></div>`).append(
                $(`<div>${item.name['#text']}</div>`)
            )
        ).append(
            $(`<div class="item__controls"></div>`).append(
                renderedItemDeleteButton      
            )
        )
    }
}

function loadEditorItem(item) {
    const inputs = elements.inputs;
    elements.editor_placeholder.hide();
    elements.editor.fadeIn(250);

    globals.currentId = item.name['#text'];

    elements.editor_title.text(`Редактирование: ${globals.currentId}`)

    inputs.category.val(item.category)
    inputs.name.val(item.name['#text']);
    inputs.image.val(item.image['#text']);
    inputs.description.val(item.description['#text']);
    inputs.ingredients.val(item.ingredients.ingredient.map((i) => i['#text']).join('\n'));
    inputs.oldPrice.val(item.prices.oldPrice['#text']);
    inputs.newPrice.val(item.prices.newPrice['#text']);
}

function saveEditorItem() {
    if (!elements.inputs.category.val()) return alert('Не указана категория блюда')
    let item = null;
    if (globals.currentId) {
        item = globals.menu.dish.find((i) => i.name['#text'] === globals.currentId)
    } else {
        item = {
            category: null,
            name: {},
            image: {},
            description: {},
            ingredients: {
                ingredient: []
            },
            prices: {
                oldPrice: {},
                newPrice: {},
            }
        }
        globals.menu.dish.push(item);
    }
    
    console.log(item);

    let inputs = elements.inputs

    item.category = inputs.category.val();
    item.name['#text'] = inputs.name.val();
    item.image['#text'] = inputs.image.val();
    item.description['#text'] = inputs.description.val();
    item.ingredients.ingredient = inputs.ingredients.val().split('\n').map((i) => {
        return {
            '#text': i
        }
    })
    item.prices.oldPrice['#text'] = inputs.oldPrice.val();
    item.prices.newPrice['#text'] = inputs.newPrice.val();

    commitChanges();
    unloadEditorItem();
}

function createEditorItem() {
    globals.currentId = null;

    elements.editor_placeholder.hide();
    elements.editor.fadeIn(250);

    elements.editor_title.text(`Создание блюда`)

    for (const [key, input] of Object.entries(elements.inputs)) {
        input.val('')
    }
}

function unloadEditorItem() {
    globals.currentId = null;
    elements.editor.fadeOut(250, function () {
        elements.editor_placeholder.show();
    })
}

function deleteItem(id) {
    console.log(`Deleted item id=${id} (is currentId? ${globals.currentId === id}; it is '${globals.currentId}')`);
    if (globals.currentId === id) unloadEditorItem();
    globals.menu.dish = globals.menu.dish.filter((item) => item.name['#text'] !== id);
    commitChanges();
}

function commitChanges() {
    window.localStorage.setItem('menu', JSON.stringify(globals.menu));
    makeMenuEditorItems(globals.menu);
}

function handleItemClicked(e) {
    const id = e.currentTarget.attributes["data-id"].nodeValue;
    console.log(`Trying to load ${id}...`)
    console.log(globals.menu.dish);
    item = globals.menu.dish.find((item) => item.name['#text'] === id);
    if (item) {
        loadEditorItem(item);
    }
}        
function handleItemDeleted(e) {
    const what = e.currentTarget.attributes["data-id"].nodeValue;
    const confirmed = confirm(`Точно удалить "${what}"?`);
    if (confirmed) {
        deleteItem(what);
    }
}

function handleItemCreated(e) {
    createEditorItem();
}

function handleItemSaved(e) {
    saveEditorItem();
}