const load = () => {

    const AdminView = {
        initialized: false,
        visible: false,

        init: function () {
            this.initialized = true;
            this.button = document.getElementById('js-admin-button');
            this.form = document.getElementById('js-admin-form');
            this.catName = document.querySelector('input#cat-name');
            this.catUrl = document.querySelector('input#cat-url');
            this.catClicks = document.querySelector('input#cat-clicks');
            this.clearButton = document.querySelector('button#js-admin-reset');

            this.button.classList.toggle('hidden');

            this.button.onclick = () => {
                if (this.isVisible()) {
                    this.hide();
                } else {
                    this.renderAdminFields();
                    this.show();
                }
            };

            this.form.onsubmit = e => {
                e.preventDefault();
                const data = {
                    name: this.catName.value,
                    picUrl: this.catUrl.value,
                    clicks: this.catClicks.value
                };
                CatController.updateCat(data);
                this.hide();
            };

            this.clearButton.onclick = () => {
                this.button.click();
            }
        },

        renderAdminFields: function () {
            const cat = CatController.getCurrentCat();
            this.catName.value = cat.name;
            this.catUrl.value = cat.picUrl;
            this.catClicks.value = cat.clicks;
        },

        updateAdminClicks: function (clicks) {
            if (this.isVisible()) {
                this.catClicks.value = clicks;
            }
        },

        isInitialized: function () {
            return this.initialized;
        },

        isVisible: function () {
            return this.visible;
        },

        hide: function () {
            this.visible = false;
            this.form.classList.add('hidden');
        },

        show: function () {
            this.visible = true;
            this.form.classList.remove('hidden');
        }
    };

    const ListView = {

        init: function () {
            this.button = document.getElementById('js-make-cat-button');
            this.input = document.getElementById('js-name-input');
            this.list = document.querySelector('ul.cat-list');

            this.button.onclick = e => {
                if (this.input.value === '') { e.stopPropagation(); }
                else {
                    const cat = CatController.makeCat(this.input.value);
                    const li = document.createElement('li'),
                        a = document.createElement('a');
                    a.href = `javascript:console.log('${cat.name}')`;
                    a.setAttribute('id', 'js-get-cat-' + cat.id);
                    a.innerText = cat.name;
                    li.appendChild(a);
                    this.list.appendChild(li);
                    CatController.requestHideAdmin();
                }
            };
            this.list.onclick = e => {
                if (e.target.nodeName !== 'A') {
                    e.stopPropagation();
                } else {
                    const id = e.target.getAttribute('id'),
                        num = Number.parseInt(id.charAt(id.length - 1));
                    CatController.listClicked(num);
                }
            };
            document.onkeyup = e => {
                if (e.key === "Enter") {
                    switch (document.activeElement.nodeName) {
                        case 'INPUT':
                            this.button.click();
                    }
                }
            };
        }
    };

    const CatView = {

        init: function () {
            this.title = document.querySelector('section#js-cat-container h2');
            this.img = document.querySelector('section#js-cat-container figure img');
            this.caption = document.querySelector('section#js-cat-container figure figcaption');
        },

        render: function (cat) {
            const id = cat.id;

            this.title.innerText = cat.name;
            this.img.setAttribute('id', id + '-pic');
            this.img.src = cat.picUrl;
            this.img.onclick = () => {
                CatController.incCounter();
            };
            if (this.img.classList.contains('hidden')) {
                this.img.classList.toggle('hidden');
            }
            if (cat.clicks > 0) {
                this.caption.innerText = `You've clicked ${cat.name} ` + (cat.clicks === 1 ? '1 time!': cat.clicks.toString() + ' times!');
            } else {
                this.caption.innerText = `You've clicked ${cat.name} 0 times!`;
            }
        },

        updateClickView: function (cat) {
            this.caption.innerText = `You've clicked ${cat.name} ` + (cat.clicks === 1 ? '1 time!': cat.clicks.toString() + ' times!');
        }

    };

    const CatsModel = {

        currentCat: undefined,
        cats: [],

        getCurrentCat: function () {
            return this.currentCat;
        },

        setCurrentCat: function (cat) {
            this.currentCat = cat;
        },

        updateCat: function (cat) {
            this.cats[cat.id] = cat;
            this.setCurrentCat(cat);
        }
    };

    const CatController = {
        list: document.querySelector('ul.cat-list'),

        init: function () {
            ListView.init();
            CatView.init();

            setTimeout(() => {
                simType(0, 'Timothy', '#js-name-input', function () {
                    document.querySelector('#js-make-cat-button').click();
                    document.querySelector('#js-name-input').value = '';
                });
            }, 500);
        },

        incCounter: function () {
            const cat = CatsModel.getCurrentCat();
            cat.clicks++;
            CatView.updateClickView(cat);
            AdminView.updateAdminClicks(cat.clicks);
        },

        makeCat: function (name) {

            if (AdminView.isVisible()) {
                AdminView.hide();
            }

            const cat = new Cat(name, CatsModel.cats.length);
            CatsModel.cats.push(cat);
            CatsModel.setCurrentCat(cat);
            CatView.render(cat);

            if (!AdminView.isInitialized()) {
                AdminView.init();
            }

            return cat;
        },

        listClicked: function (num) {
            CatsModel.setCurrentCat(CatsModel.cats[num]);
            this.requestHideAdmin();
            CatView.render(CatsModel.getCurrentCat());
        },

        getCurrentCat: function() {
            return CatsModel.getCurrentCat();
        },

        updateCat: function (data) {
            const currentCat = this.getCurrentCat();
            data.id = currentCat.id;
            CatsModel.updateCat(data);
            CatView.render(this.getCurrentCat());
        },

        requestHideAdmin: function () {
            if (AdminView.isVisible()) {
                AdminView.hide();
            }
        }

    };

    CatController.init();
};

/**
 * Allows typing simulation on input field.
 *
 * @param i {Number} should be called initially with 0
 * @param str {String} string to be typed in input field
 * @param inputSelector {String} css selector for querySelector
 * @param callback {Function} OPTIONAL - a callback to fire after
 *      final character is typed;
 */
function simType(i, str, inputSelector, callback) {
    const stringArr = str.split(''),
        len = stringArr.length,
        input = document.querySelector(inputSelector),
        inputLength = input.value.length;

    if (inputLength < len) {
        input.value += stringArr[i];
        i++;
        setTimeout(() => {
            simType(i, str, inputSelector, callback);
        }, 150); // variable time between "type"
    } else {
        if (typeof callback !== "undefined") {
            callback();
        }
    }
}

class Cat {
    constructor(name, id, url) {
        this.clicks = 0;
        this.name = name;
        this.id = id;
        if (typeof url === "undefined") {
            this.picUrl = 'http://thecatapi.com/api/images/get?image_id=a' + (this.id + 2) + '&format=src&type=png&size=small';
        } else {
            this.picUrl = url;
        }
    }
}
document.addEventListener('DOMContentLoaded', load);