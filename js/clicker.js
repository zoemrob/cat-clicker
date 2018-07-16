window.Cats = [];

const load = () => {
    const list = document.querySelector('ul.cat-list');
    const container = document.getElementById('js-cat-container');

    list.addEventListener('click', e => {
        if (e.target.nodeName !== 'A') {
            e.stopPropagation();
        } else {
            //container.firstElementChild.remove();
            const id = e.target.getAttribute('id');
            const num = Number.parseInt(id.charAt(id.length - 1)) - 1;
            window.Cats[num].render();
        }
    });

    setTimeout(() => {
        funScript(0);
    }, 500);

};
document.addEventListener('DOMContentLoaded', load);

function funScript(i) {
    const startCat = 'Timothy'.split('');
    const len = startCat.length;
    const input = document.getElementById('js-name-input');
    const inputLen = input.value.length;
    const button = document.getElementById('js-make-cat-button');

    if (inputLen < len) {
        input.value += startCat[i];
        i++;
        setTimeout(() => {
            funScript(i)
        }, 150);
    } else {
        button.click();
    }
}

function checkCats() {
    const input = document.getElementById('js-name-input');
    if (input.value === '') { return; }

    const cat = new Cat(input.value);
    input.value = '';
    const list = document.querySelector('ul.cat-list');
    const li = document.createElement('li');
    const a = document.createElement('a');

    a.href = `javascript:console.log('${cat.name}')`;
    a.setAttribute('id', 'js-get-cat-' + cat.id);
    a.innerText = cat.name;
    li.appendChild(a);
    list.appendChild(li);
}

class Cat {
    constructor(name) {
        this.clicks = 0;
        this.name = name;
        this.counterCaption = document.createElement('figcaption');
        window.Cats.push(this);
        this.id = window.Cats.length;
        this.pictureUrl = 'http://thecatapi.com/api/images/get?image_id=a' + (this.id + 2) + '&format=src&type=png&size=small';
        this.render();
    }

    render() {
        const catContainer = document.getElementById('js-cat-container'),
            wrapper = document.createElement('div'),
            figure = document.createElement('figure'),
            img = document.createElement('img'),
            cat = document.createDocumentFragment(),
            title = document.createElement('h2'),
            id = 'js-cat-' + window.Cats.length;

        if (catContainer.firstElementChild !== null) {
            catContainer.firstElementChild.remove();
        }
        // 'js-cat-1-counter'
        title.innerText = this.name;

        img.setAttribute('id', id + '-pic');
        img.src = this.pictureUrl;
        img.onclick = () => {
            this.clicks++;
            this.setCounter();
        };

        wrapper.classList.add('cat');

        this.setCounter();

        figure.appendChild(img);
        figure.appendChild(this.counterCaption);

        wrapper.appendChild(title);
        wrapper.appendChild(figure);

        cat.appendChild(wrapper);

        catContainer.appendChild(cat);
    }

    setCounter() {
        this.counterCaption.innerText = 'You have clicked ' + this.name + ' ' + this.clicks + ' ' + (this.clicks === 1 ? 'time': 'times') + '!';
    }
}