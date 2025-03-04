// Функция для отображения формы добавления темы
function showAddTopicForm() {
    document.getElementById('addTopicForm').style.display = 'block';
}

// Функция для создания HTML-структуры новой темы
function createTopicElement(topic) {
    const topicDiv = document.createElement('div');
    topicDiv.className = 'topic';

    topicDiv.innerHTML = `
        <div class="topic-header">
            <div class="topic-title">
                <a href="/theme/${topic.id}">${topic.name}</a>
            </div>
            <div class="actions-topic">
                <button class="editTopicButton" data-topic-id="${topic.id}" data-topic-name="${topic.name}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="deleteTopicButton" data-topic-id="${topic.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="add-topic-form edit-topic-form" style="display: none;">
            <input type="text" class="editTopicContent" placeholder="Введите новое название темы">
            <button class="saveEditTopicButton">Сохранить</button>
        </div>
    `;

    return topicDiv;
}

// Функция для добавления новой темы в список
function addTopicToList(topic) {
    const topicsContainer = document.querySelector('.topics');
    const topicElement = createTopicElement(topic);
    topicsContainer.insertBefore(topicElement, topicsContainer.firstChild);
}

// Функция для сохранения темы на сервере
function saveTopic(topicContent) {
    return fetch('/save_topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topicName: topicContent })
    })
    .then(response => response.json());
}

// Функция для обработки сохранения темы
function handleSaveTopic() {
    const topicContent = document.getElementById('topicContent').value;

    if (!topicContent) return;

    saveTopic(topicContent)
        .then(data => {
            if (data.success) {
                addTopicToList({ id: data.topicId, name: data.topicName });
                document.getElementById('addTopicForm').style.display = 'none';
                document.getElementById('topicContent').value = '';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Навешиваем обработчики событий
document.getElementById('addTopicButton').addEventListener('click', showAddTopicForm);
document.getElementById('saveTopicButton').addEventListener('click', handleSaveTopic);

// Функция для отображения формы редактирования темы
function showEditTopicForm(editButton) {
    const topicId = editButton.getAttribute('data-topic-id');
    const topicName = editButton.getAttribute('data-topic-name');
    const editForm = editButton.closest('.topic').querySelector('.edit-topic-form');
    const input = editForm.querySelector('.editTopicContent');

    input.value = topicName;
    input.placeholder = 'Введите новое название темы';
    editForm.style.display = 'block';
}

// Функция для сохранения изменений темы
function saveEditedTopic(saveEditButton) {
    const editForm = saveEditButton.closest('.edit-topic-form');
    const input = editForm.querySelector('.editTopicContent');
    const topicId = editForm.previousElementSibling.querySelector('.editTopicButton').getAttribute('data-topic-id');
    const newTopicName = input.value;

    if (!newTopicName) return;

    fetch('/edit_topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topicId: topicId, topicName: newTopicName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const topicTitle = editForm.closest('.topic').querySelector('.topic-title a');
            topicTitle.textContent = newTopicName;
            editForm.style.display = 'none';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Функция для удаления темы
function deleteTopic(deleteButton) {
    const topicId = deleteButton.getAttribute('data-topic-id');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const confirmationOk = document.getElementById('confirmationOk');
    const confirmationCancel = document.getElementById('confirmationCancel');
    const confirmationMessage = document.getElementById('confirmationMessage');

    confirmationMessage.textContent = 'Вы уверены, что хотите удалить эту тему?';
    confirmationPopup.style.display = 'block';

    confirmationOk.onclick = function () {
        fetch('/delete_topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicId: topicId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload(); // Перезагрузка страницы после удаления
            } else {
                alert(data.message);
            }
            confirmationPopup.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            confirmationPopup.style.display = 'none';
        });
    };

    confirmationCancel.onclick = function () {
        confirmationPopup.style.display = 'none';
    };
}

// Функция для отображения формы редактирования поста
function showEditPostForm(editPostButton) {
    const postId = editPostButton.getAttribute('data-post-id');
    const postName = editPostButton.getAttribute('data-post-text');
    const editForm = editPostButton.closest('.pinned-post').querySelector('.edit-post-form');
    const input = editForm.querySelector('.editPostContent');

    input.value = postName;
    input.placeholder = 'Введите новую запись';
    editForm.style.display = 'block';

    editForm.querySelector('.saveEditPostButton').addEventListener('click', function() {
        const newPostContent = input.value;

        if (newPostContent) {
            fetch('/edit_post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId: postId, postContent: newPostContent })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const postDiv = editPostButton.closest('.pinned-post');
                    postDiv.querySelector('.post-title').textContent = newPostContent;
                    editForm.style.display = 'none';
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
}

// Функция для удаления поста
function deletePost(deletePostButton) {
    const postId = deletePostButton.getAttribute('data-post-id');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const confirmationOk = document.getElementById('confirmationOk');
    const confirmationCancel = document.getElementById('confirmationCancel');
    const confirmationMessage = document.getElementById('confirmationMessage');

    confirmationMessage.textContent = 'Вы уверены, что хотите удалить эту запись?';
    confirmationPopup.style.display = 'block';

    confirmationOk.onclick = function () {
        fetch('/delete_post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId: postId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const postDiv = deletePostButton.closest('.pinned-post');
                postDiv.remove();
            } else {
                alert(data.message);
            }
            confirmationPopup.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            confirmationPopup.style.display = 'none';
        });
    };

    confirmationCancel.onclick = function () {
        confirmationPopup.style.display = 'none';
    };
}

// Функция для открепления поста
function unpinPost(unpinPostButton) {
    const postId = unpinPostButton.getAttribute('data-post-id');

    fetch('/unpin_post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId: postId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const postDiv = unpinPostButton.closest('.pinned-post');
            postDiv.remove();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Обработка событий для тем
document.querySelector('.topics').addEventListener('click', function(event) {
    const editButton = event.target.closest('.editTopicButton');
    const deleteButton = event.target.closest('.deleteTopicButton');
    const saveEditButton = event.target.closest('.saveEditTopicButton');

    if (editButton) showEditTopicForm(editButton);
    if (saveEditButton) saveEditedTopic(saveEditButton);
    if (deleteButton) deleteTopic(deleteButton);
});

// Обработка событий для постов
document.addEventListener('click', function(event) {
    const editPostButton = event.target.closest('.editPostButton');
    const deletePostButton = event.target.closest('.deletePostButton');
    const unpinPostButton = event.target.closest('.unpinPostButton');

    if (editPostButton) showEditPostForm(editPostButton);
    if (deletePostButton) deletePost(deletePostButton);
    if (unpinPostButton) unpinPost(unpinPostButton);
});
