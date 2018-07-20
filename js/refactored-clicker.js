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
            this.catUrl.value = cat.img.src;
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

                    if (cat.error) {
                        e.stopPropagation();
                        console.log(cat.error);
                        return;
                    }

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
            this.wrapper = document.querySelector('div#js-pic-wrapper');
            this.caption = document.querySelector('section#js-cat-container figure figcaption');
        },

        render: function (cat) {
            const id = cat.id;
            const prevImg = this.wrapper.firstElementChild;

            if (prevImg !== null) {
                this.wrapper.removeChild(prevImg);
            }

            this.title.innerText = cat.name;
            cat.img.setAttribute('id', id + '-pic');
            //cat.img.src = cat.picUrl;
            this.wrapper.appendChild(cat.img);
            this.wrapper.onclick = () => {
                CatController.incCounter();
            };
            if (this.wrapper.classList.contains('hidden')) {
                this.wrapper.classList.toggle('hidden');
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
            const updatedCat = this.getCurrentCat();
            updatedCat.img.src = cat.picUrl;
            updatedCat.clicks = cat.clicks;
            updatedCat.name = cat.name;
            this.cats[cat.id] = updatedCat;
            this.setCurrentCat(updatedCat);
        }
    };

    const CatController = {
        list: document.querySelector('ul.cat-list'),

        init: function () {
            ImageFactory.init();
            ListView.init();
            CatView.init();

            setTimeout(() => {
                simType('Timothy', '#js-name-input', function () {
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

            const img = ImageFactory.getImg();
            if (img.error) {
                console.log(img.error);
                return img;
            }
            const cat = new Cat(name, CatsModel.cats.length, img);
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
        },


    };

    /**
     * Factory to prefetch and provide img elements from thecatapi.com
     * Improves image render times.
     *
     * @property availableImgs {array<HTMLElement>}: Prefetched img elements
     * @property availableImgUrls {array<String>}: Available img elements
     */
    const ImageFactory = {
        availableImgs: [],
        availableImgUrls: [
            'http://thecatapi.com/api/images/get?image_id=a2&format=src&type=png&size=small',
            'http://thecatapi.com/api/images/get?image_id=a3&format=src&type=png&size=small',
            'http://thecatapi.com/api/images/get?image_id=a4&format=src&type=png&size=small',
            'http://thecatapi.com/api/images/get?image_id=a5&format=src&type=png&size=small',
            'http://thecatapi.com/api/images/get?image_id=a6&format=src&type=png&size=small',
            'http://thecatapi.com/api/images/get?image_id=a7&format=src&type=png&size=small',
            'http://thecatapi.com/api/images/get?format=src&type=png&size=small'
        ],

        // load two images to start
        init: function () {
            this.createImgTag();
            this.createImgTag();
        },

        checkAvailableImgs: function () {
            return this.availableImgs.length;
        },

        /* for future use
        addAvailableImages: function (images) {
            this.availableImgs.concat(images);
        },
        */

        addAvailableImage: function (image) {
            this.availableImgs.push(image);
        },

        getImg: function () {
            if (this.checkAvailableImgs() > 0 && this.checkAvailableImgUrls() > 1) {
                this.createImgTag();
                return this.availableImgs.shift()
            } else if (this.checkAvailableImgs() > 0) {
                return this.availableImgs.shift();
            } else {
                    if (this.checkAvailableImgUrls() > 0) {
                        this.createImgTag();
                        return this.availableImgs.shift();
                    } else {
                        return {error: 'There are no images available!'};
                    }
                }
            },

        checkAvailableImgUrls: function () {
            return this.availableImgUrls.length;
        },

        /* for future use
        getAvailableUrls: function () {
            return this.availableImgUrls;
        },
        */

        getSingleAvailableUrl: function () {
            return this.availableImgUrls.shift();
        },

        /* for future use
        refillImgUrls: function (urls) {
            this.availableImgUrls.concat(urls);
        },
        */

        createImgTag: function () {
            const img = document.createElement('img');
            img.src = this.getSingleAvailableUrl();
            this.addAvailableImage(img);
        }
    };

    CatController.init();

    /**
     * Allows typing simulation on input field.
     *
     * @param i {Number} should be called initially with 0
     * @param str {String} string to be typed in input field
     * @param inputSelector {String} css selector for querySelector
     * @param callback {Function} OPTIONAL - a callback to fire after
     *      final character is typed;
     */
    function simType(str, inputSelector, callback, i = 0) {
        const stringArr = str.split(''),
            len = stringArr.length,
            input = document.querySelector(inputSelector),
            inputLength = input.value.length;

        if (inputLength < len) {
            input.value += stringArr[i];
            i++;
            setTimeout(() => {
                simType(str, inputSelector, callback, i);
            }, 150); // variable time between "type"
        } else {
            if (typeof callback === "function") {
                callback();
            }
        }
    }

    class Cat {
        constructor(name, id, img) {
            this.clicks = 0;
            this.name = name;
            this.id = id;
            this.img = img;
        }
    }
};
document.addEventListener('DOMContentLoaded', load);