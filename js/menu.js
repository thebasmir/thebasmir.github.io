var globalMenu = null;

function readXML(file, callback)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                callback(allText);
            }
        }
    }
    rawFile.send(null);
}
function parseXml(xml, arrayTags) {
    let dom = null;
    if (window.DOMParser) dom = (new DOMParser()).parseFromString(xml, "text/xml");
    else if (window.ActiveXObject) {
        dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.async = false;
        if (!dom.loadXML(xml)) throw dom.parseError.reason + " " + dom.parseError.srcText;
    }
    else throw new Error("cannot parse xml string!");

    function parseNode(xmlNode, result) {
        if (xmlNode.nodeName == "#text") {
            let v = xmlNode.nodeValue;
            if (v.trim()) result['#text'] = v;
            return;
        }

        let jsonNode = {},
            existing = result[xmlNode.nodeName];
        if (existing) {
            if (!Array.isArray(existing)) result[xmlNode.nodeName] = [existing, jsonNode];
            else result[xmlNode.nodeName].push(jsonNode);
        }
        else {
            if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) result[xmlNode.nodeName] = [jsonNode];
            else result[xmlNode.nodeName] = jsonNode;
        }

        if (xmlNode.attributes) for (let attribute of xmlNode.attributes) jsonNode[attribute.nodeName] = attribute.nodeValue;

        for (let node of xmlNode.childNodes) parseNode(node, jsonNode);
    }

    let result = {};
    for (let node of dom.childNodes) parseNode(node, result);

    return result;
}
function makeMenu(menu) {
    let content = $(".catalog__content")
    for (const item of menu.dish) {
        
        let ingredients_raw = `<ul class="catalog-item__list">`;
        for (const ingredient of item.ingredients.ingredient) {
            ingredients_raw += `\n<li>${ingredient['#text']}</li>`
        }
        ingredients_raw += '\n<a href="#" class="catalog-item__back">Назад</a></ul>'

        content.append(
            $('<div/>', {class: 'catalog-item', 'data-category': item.category, style: 'display: none;' }).append(
                $('<div/>', { class: 'catalog-item__wrapper' }).append(
                    $('<div/>', { class: 'catalog-item__content catalog-item__content_active'}).append(
                        $('<img/>', { class: 'catalog-item__img', src: item.image['#text'] })
                    ).append(
                        $(`<div class="catalog-item__subtitle">${item.name['#text']}</div>`)
                    ).append(
                        $(`<div class="catalog-item__descr">${item.description['#text']}</div>`)
                    ).append(
                        $('<a href="#" class="catalog-item__link">ПОДРОБНЕЕ</a>')
                    )
                ).append(
                    ingredients_raw
                )
            ).append(
                '<hr/>'
            ).append(
                $('<div/>', { class: 'catalog-item__footer' }).append(
                    $('<div/>', { class: 'catalog-item__prices' }).append(
                        $(`<div class="catalog-item__old-price">${item.prices.oldPrice['#text']}</div>`)
                    ).append(
                        $(`<div class="catalog-item__price">${item.prices.newPrice['#text']}</div>`)
                    )
                ).append(
                    $('<button class="button button_mini">ЗАКАЗАТЬ</button>')
                )
            )
        )
    }
}
function setMenuCategory(category) {
    // $('.catalog__tab').removeClass('catalog__tab_active')
    $('.catalog-item').fadeOut(250)
    setTimeout(function () {
        // $(`.catalog__tab[data-category="${category}"]`).addClass('catalog__tab_active')
        $(`.catalog-item[data-category="${category}"]`).fadeIn(250)
    }, 300)
}
function handleMenuCategoryClick(e) {
    let category = e.currentTarget.attributes["data-category"].nodeValue;
    console.log(`Navigating to ${category}...`)
    setMenuCategory(category);
}
function loadMenu() {
    let menu = window.localStorage.getItem('menu')
    if (menu) {
        menu = JSON.parse(menu);
    } else {
        readXML('./menu.xml', (raw) => { window.localStorage.setItem('rawXML', raw) });
        menu = parseXml(localStorage.getItem('rawXML')).menu;
        window.localStorage.setItem('menu', JSON.stringify(menu));
    }
    return menu;
}