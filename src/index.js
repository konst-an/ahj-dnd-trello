import './style.css';

const defaultData = [
    { id: 1, name: 'TODO', cards: [] },
    { id: 2, name: 'IN PROGRESS', cards: [] },
    { id: 3, name: 'DONE', cards: [] },
];

function loadData() {
    return JSON.parse(localStorage.getItem('trello')) || defaultData;
}

function saveData(data) {
    localStorage.setItem('trello', JSON.stringify(data));
}

let dragged = null;

function render() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    const data = loadData();

    data.forEach((col, colIndex) => {
        const column = document.createElement('div');
        column.className = 'column';

        const title = document.createElement('h3');
        title.textContent = col.name;

        const cardsContainer = document.createElement('div');

        column.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        column.addEventListener('drop', () => {
        if (!dragged) return;

        const id = dragged.dataset.id;
        let movedCard = null;

        // удалить из старой колонки
        data.forEach(c => {
            c.cards = c.cards.filter(card => {
            if (card.id == id) {
                movedCard = card;
                return false;
            }
            return true;
            });
        });

        // добавить в новую колонку
        if (movedCard) {
            data[colIndex].cards.push(movedCard);
        }

        saveData(data);
        render();
        });

        col.cards.forEach((card) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.textContent = card.text;

        cardEl.setAttribute('draggable', true);
        cardEl.dataset.id = card.id;

        cardEl.addEventListener('dragstart', () => {
            dragged = cardEl;
            cardEl.classList.add('dragging');
        });

        cardEl.addEventListener('dragend', () => {
            dragged = null;
            cardEl.classList.remove('dragging');
        });

        // удаление
        cardEl.addEventListener('dblclick', () => {
            data[colIndex].cards = data[colIndex].cards.filter(c => c.id !== card.id);
            saveData(data);
            render();
        });

        cardsContainer.appendChild(cardEl);
        });

        // добавление
        const addBtn = document.createElement('div');
        addBtn.textContent = '+ Add another card';
        addBtn.className = 'add-btn';

        addBtn.addEventListener('click', () => {
        const text = prompt('Введите текст');
        if (!text) return;

        data[colIndex].cards.push({
            id: Date.now(),
            text: text,
        });

        saveData(data);
        render();
        });

        column.append(title, cardsContainer, addBtn);
        board.appendChild(column);
    });
    }

render();