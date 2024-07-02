const form = document.querySelector('form');
const input = document.querySelector('form input');
const button = document.querySelector('form button');
const listItem = document.querySelector('.list_item');

const stateAll = document.querySelector('.state_all');
const stateDone = document.querySelector('.state_done');
const stateLeft = document.querySelector('.state_left');

const totalCountSpan = document.querySelector('.all_text');
const completedCountSpan = document.querySelector('.done_text');
const incompleteCountSpan = document.querySelector('.left_text');

const allDeleteButton = document.querySelector('.all_delete');

const ul = document.createElement('ul');
ul.classList.add('todo_ul');

const createTodoItem = (todo, id, completed = false) => {
  const li = document.createElement('li');
  li.classList.add('todo_li');
  li.setAttribute('data-id', id);
  listItem.appendChild(ul);
  ul.appendChild(li);
  li.innerHTML = `<span class="todo_text">${todo}</span>
                    <div class="icons">
                      <span class="check_icon">
                        <i class="fa-solid fa-check"></i>
                      </span>
                      <span class="delete_icon"
                        ><i class="fa-solid fa-xmark"></i
                      ></span>
                    </div>`;
  if (completed) {
    const todoText = li.querySelector('.todo_text');
    const icon = li.querySelector('.check_icon i');
    todoText.style.textDecoration = 'line-through';
    todoText.style.opacity = '0.5';
    icon.style.color = 'yellow';
  }
  updateCounters();
};

const saveToLocalStorage = (todo, id, completed = false) => {
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  todos.push({ id, todo, completed });
  localStorage.setItem('todos', JSON.stringify(todos));
};

const removeFromLocalStorage = (id) => {
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  todos = todos.filter((todo) => todo.id !== id);
  if (todos.length === 0) {
    localStorage.removeItem('todos');
  } else {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
};

const toggleCheckTodoItem = (li) => {
  const todoText = li.querySelector('.todo_text');
  const icon = li.querySelector('.check_icon i');
  const id = li.getAttribute('data-id');

  if (todoText.style.textDecoration === 'line-through') {
    todoText.style.textDecoration = 'none';
    todoText.style.opacity = '1';
    icon.style.color = 'inherit';
    updateTodoCompletionStatus(id, false);
  } else {
    todoText.style.textDecoration = 'line-through';
    todoText.style.opacity = '0.5';
    icon.style.color = 'yellow';
    updateTodoCompletionStatus(id, true);
  }

  updateCounters();
};

const editTodoItem = (li) => {
  const todoText = li.querySelector('.todo_text');
  const oldText = todoText.innerText;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldText;
  input.classList.add('edit_input');
  todoText.replaceWith(input);

  const saveEdit = () => {
    const newText = input.value;
    const newSpan = document.createElement('span');
    newSpan.classList.add('todo_text');
    newSpan.innerText = newText;
    input.replaceWith(newSpan);
    const id = li.getAttribute('data-id');
    updateTodoText(id, newText);
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
  });

  input.focus();
};

const updateCounters = () => {
  const todos = document.querySelectorAll('.todo_li');
  const total = todos.length;
  const completed = document.querySelectorAll(
    '.todo_li .todo_text[style*="line-through"]'
  ).length;
  const incomplete = total - completed;
  totalCountSpan.innerText = total;
  completedCountSpan.innerText = completed;
  incompleteCountSpan.innerText = incomplete;
};

const updateTodoCompletionStatus = (id, completed) => {
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  const todoIndex = todos.findIndex((todo) => todo.id === id);
  if (todoIndex > -1) {
    todos[todoIndex].completed = completed;
    localStorage.setItem('todos', JSON.stringify(todos));
  }
};

const updateTodoText = (id, newText) => {
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  const todoIndex = todos.findIndex((todo) => todo.id === id);
  if (todoIndex > -1) {
    todos[todoIndex].todo = newText;
    localStorage.setItem('todos', JSON.stringify(todos));
  }
};

const loadTodosFromLocalStorage = () => {
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  todos.forEach(({ id, todo, completed }) => {
    createTodoItem(todo, id, completed);
  });
  if (todos.length > 0) {
    createAllDeleteButton();
  }
};

const createAllDeleteButton = () => {
  document.querySelector('.all_delete').style.display = 'flex';
};

const filterTodos = (filter) => {
  const todos = document.querySelectorAll('.todo_li');
  todos.forEach((todo) => {
    const todoText = todo.querySelector('.todo_text');
    const isCompleted = todoText.style.textDecoration === 'line-through';

    switch (filter) {
      case 'all':
        todo.style.display = 'flex';
        break;
      case 'completed':
        if (isCompleted) {
          todo.style.display = 'flex';
        } else {
          todo.style.display = 'none';
        }
        break;
      case 'incomplete':
        if (!isCompleted) {
          todo.style.display = 'flex';
        } else {
          todo.style.display = 'none';
        }
        break;
    }
  });
};

const setActiveState = (activeSpan) => {
  stateAll.classList.remove('state_active');
  stateDone.classList.remove('state_active');
  stateLeft.classList.remove('state_active');
  activeSpan.classList.add('state_active');
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const todo = input.value;
  const id = new Date().getTime().toString();
  createTodoItem(todo, id);
  saveToLocalStorage(todo, id);
  createAllDeleteButton();
  input.value = '';
});

listItem.addEventListener('click', (e) => {
  if (e.target.closest('.delete_icon')) {
    const li = e.target.closest('.todo_li');
    if (li) {
      const id = li.getAttribute('data-id');
      li.remove();
      removeFromLocalStorage(id);
      updateCounters();
      // 전체 삭제 버튼 숨기기
      const todos = JSON.parse(localStorage.getItem('todos')) || [];
      if (todos.length === 0) {
        document.querySelector('.all_delete').style.display = 'none';
      }
    }
  }

  if (e.target.closest('.check_icon')) {
    const li = e.target.closest('.todo_li');
    if (li) {
      toggleCheckTodoItem(li);
    }
  }

  if (e.target.closest('.todo_text')) {
    const li = e.target.closest('.todo_li');
    if (li) {
      editTodoItem(li);
    }
  }
});

allDeleteButton.addEventListener('click', (e) => {
  ul.innerHTML = '';
  localStorage.removeItem('todos');
  updateCounters();
  document.querySelector('.all_delete').style.display = 'none';
});

stateAll.addEventListener('click', () => {
  filterTodos('all');
  setActiveState(stateAll);
});

stateDone.addEventListener('click', () => {
  filterTodos('completed');
  setActiveState(stateDone);
});

stateLeft.addEventListener('click', () => {
  filterTodos('incomplete');
  setActiveState(stateLeft);
});

updateCounters();
