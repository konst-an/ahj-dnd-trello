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

const placeholder = document.createElement('div');
placeholder.className = 'placeholder';

function getAfterElement(container, y) {
  const cards = container.querySelectorAll('.card:not(.dragging)');
  let result = null;

  for (let i = 0; i < cards.length; i++) {
    const box = cards[i].getBoundingClientRect();
    const middle = box.top + box.height / 2;

    if (y < middle) {
      result = cards[i];
      break;
    }
  }

  return result;
}

function render() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  const data = loadData();

  data.forEach((col, colIndex) => {
    const column = document.createElement('div');
    column.className = 'column';

    const title = document.createElement('h3');
    title.textContent = col.name;

    const container = document.createElement('div');

    column.addEventListener('dragover', (e) => {
      e.preventDefault();

      if (!container.contains(placeholder)) {
        container.appendChild(placeholder);
      }
    });

    column.addEventListener('drop', () => {
      if (!dragged) return;

      const id = dragged.dataset.id;
      let moved = null;

      data.forEach((c) => {
        c.cards = c.cards.filter((card) => {
          if (card.id == id) {
            moved = card;
            return false;
          }

          return true;
        });
      });

      if (moved) {
        data[colIndex].cards.push(moved);
      }

      placeholder.remove();

      saveData(data);
      render();
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();

      const cards = container.querySelectorAll(
        '.card:not(.dragging)',
      );

      if (cards.length === 0) {
        container.appendChild(placeholder);
        return;
      }

      const after = getAfterElement(container, e.clientY);

      if (after == null) {
        container.appendChild(placeholder);
      } else {
        container.insertBefore(placeholder, after);
      }
    });

    container.addEventListener('drop', () => {
      if (!dragged) return;

      const id = dragged.dataset.id;
      let moved = null;

      data.forEach((c) => {
        c.cards = c.cards.filter((card) => {
          if (card.id == id) {
            moved = card;
            return false;
          }

          return true;
        });
      });

      if (moved) {
        const children = Array.from(container.children);
        const index = children.indexOf(placeholder);

        if (index === -1) {
          data[colIndex].cards.push(moved);
        } else {
          data[colIndex].cards.splice(index, 0, moved);
        }
      }

      placeholder.remove();

      saveData(data);
      render();
    });

    col.cards.forEach((card) => {
      const el = document.createElement('div');
      el.className = 'card';
      el.textContent = card.text;

      el.setAttribute('draggable', true);
      el.dataset.id = card.id;

      const del = document.createElement('span');
      del.className = 'delete';
      del.textContent = '✖';

      del.addEventListener('click', (e) => {
        e.stopPropagation();

        data[colIndex].cards =
          data[colIndex].cards.filter(
            (c) => c.id !== card.id,
          );

        saveData(data);
        render();
      });

      el.appendChild(del);

      el.addEventListener('dragstart', (e) => {
        dragged = el;

        const rect = el.getBoundingClientRect();

        const shiftX = e.clientX - rect.left;
        const shiftY = e.clientY - rect.top;

        e.dataTransfer.setDragImage(
          el,
          shiftX,
          shiftY,
        );

        placeholder.style.height = el.offsetHeight + 'px';

        placeholder.remove();

        el.classList.add('dragging');
      });

      el.addEventListener('dragend', () => {
        dragged = null;

        el.classList.remove('dragging');

        placeholder.remove();
      });

      container.appendChild(el);
    });

    const addBtn = document.createElement('div');
    addBtn.className = 'add-btn';
    addBtn.textContent = '+ Add another card';

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

    column.append(title, container, addBtn);

    board.appendChild(column);
  });
}

render();