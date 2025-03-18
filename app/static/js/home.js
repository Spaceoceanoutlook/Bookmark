// Функция для отображения формы добавления темы
function showAddTopicForm() {
    const addTopicForm = document.getElementById('addTopicForm');
    if (addTopicForm) {
        addTopicForm.style.display = 'block';
    } else {
        console.error('Форма добавления темы не найдена');
    }
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
    if (!topicsContainer) {
        console.error('Контейнер для тем не найден');
        return;
    }

    const topicElement = createTopicElement(topic);
    if (topicsContainer.firstChild) {
        topicsContainer.insertBefore(topicElement, topicsContainer.firstChild);
    } else {
        topicsContainer.appendChild(topicElement);
    }
}

// Функция для сохранения темы на сервере
async function saveTopic(topicContent) {
    try {
        const response = await fetch('/save_topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicName: topicContent })
        });

        if (!response.ok) {
            throw new Error('Ошибка сети или сервера');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при сохранении темы:', error);
        throw error;
    }
}

// Функция для обработки сохранения темы
async function handleSaveTopic() {
    const topicContentInput = document.getElementById('topicContent');
    if (!topicContentInput) {
        console.error('Поле ввода темы не найдено');
        return;
    }

    const topicContent = topicContentInput.value.trim();
    if (!topicContent) {
        alert('Поле не может быть пустым');
        return;
    }

    try {
        const data = await saveTopic(topicContent);
        if (data.success) {
            addTopicToList({ id: data.topicId, name: data.topicName });
            document.getElementById('addTopicForm').style.display = 'none';
            topicContentInput.value = '';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при сохранении темы');
    }
}

// Функция для отображения формы редактирования темы
function showEditTopicForm(editButton) {
    const topicId = editButton.getAttribute('data-topic-id');
    const topicName = editButton.getAttribute('data-topic-name');
    const editForm = editButton.closest('.topic').querySelector('.edit-topic-form');
    const input = editForm.querySelector('.editTopicContent');

    if (input && editForm) {
        input.value = topicName;
        input.placeholder = 'Введите новое название темы';
        editForm.style.display = 'block';
    }
}

// Функция для сохранения изменений темы
async function saveEditedTopic(saveEditButton) {
    const editForm = saveEditButton.closest('.edit-topic-form');
    const input = editForm.querySelector('.editTopicContent');
    const topicId = editForm.previousElementSibling.querySelector('.editTopicButton').getAttribute('data-topic-id');
    const newTopicName = input.value.trim();

    if (!newTopicName) {
        alert('Поле не может быть пустым');
        return;
    }

    try {
        const response = await fetch('/edit_topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicId: topicId, topicName: newTopicName })
        });

        if (!response.ok) {
            throw new Error('Ошибка сети или сервера');
        }

        const data = await response.json();
        if (data.success) {
            const topicTitle = editForm.closest('.topic').querySelector('.topic-title a');
            topicTitle.textContent = newTopicName;
            editForm.style.display = 'none';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при редактировании темы');
    }
}

// Функция для отображения всплывающего окна подтверждения
function showConfirmationPopup(message, onConfirm) {
    const confirmationPopup = document.getElementById('confirmationPopup');
    const confirmationOk = document.getElementById('confirmationOk');
    const confirmationCancel = document.getElementById('confirmationCancel');
    const confirmationMessage = document.getElementById('confirmationMessage');

    if (!confirmationPopup || !confirmationOk || !confirmationCancel || !confirmationMessage) {
        console.error('Элементы всплывающего окна не найдены');
        return;
    }

    confirmationMessage.textContent = message;
    confirmationPopup.style.display = 'block';

    confirmationOk.onclick = function () {
        onConfirm();
        confirmationPopup.style.display = 'none';
    };

    confirmationCancel.onclick = function () {
        confirmationPopup.style.display = 'none';
    };
}

// Функция для удаления темы
function deleteTopic(deleteButton) {
    const topicId = deleteButton.getAttribute('data-topic-id');

    showConfirmationPopup('Вы уверены, что хотите удалить эту тему?', async () => {
        try {
            const response = await fetch(`/delete_topic/${topicId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка сети или сервера');
            }

            const data = await response.json();
            if (data.success) {
                location.reload();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при удалении темы');
        }
    });
}

// Функция для отображения формы редактирования поста
function showEditPostForm(editPostButton) {
    const postId = editPostButton.getAttribute('data-post-id');
    const postName = editPostButton.getAttribute('data-post-text');
    const editForm = editPostButton.closest('.pinned-post').querySelector('.edit-post-form');
    const input = editForm.querySelector('.editPostContent');

    if (input && editForm) {
        input.value = postName;
        input.placeholder = 'Введите новую запись';

        const inputValue = input.value.trim();
        if (inputValue.includes('<a href')) {
            const linknotchanges = document.getElementById('linknotchanges');
            if (linknotchanges) {
                linknotchanges.style.display = 'block';
                setTimeout(() => {
                    linknotchanges.style.display = 'none';
                }, 1000);
            }
            return;
        }

        editForm.style.display = 'block';

        editForm.querySelector('.saveEditPostButton').addEventListener('click', async () => {
            const newPostContent = input.value.trim();

            if (!newPostContent) {
                alert('Поле не может быть пустым');
                return;
            }

            try {
                const response = await fetch('/edit_post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        postId: postId,
                        postContent: newPostContent
                    })
                });

                if (!response.ok) {
                    throw new Error('Ошибка сети или сервера');
                }

                const data = await response.json();
                if (data.success) {
                    const postDiv = editPostButton.closest('.pinned-post');
                    postDiv.querySelector('.post-title').textContent = newPostContent;
                    editForm.style.display = 'none';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при редактировании поста');
            }
        });
    }
}

// Функция для удаления поста
function deletePost(deletePostButton) {
    const postId = deletePostButton.getAttribute('data-post-id');

    showConfirmationPopup('Вы уверены, что хотите удалить эту запись?', async () => {
        try {
            const response = await fetch(`/delete_post/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка сети или сервера');
            }

            const data = await response.json();
            if (data.success) {
                const postDiv = deletePostButton.closest('.pinned-post');
                postDiv.remove();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при удалении поста');
        }
    });
}

// Функция для открепления поста
async function unpinPost(unpinPostButton) {
    const postId = unpinPostButton.getAttribute('data-post-id');

    try {
        const response = await fetch('/unpin_post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId: postId })
        });

        if (!response.ok) {
            throw new Error('Ошибка сети или сервера');
        }

        const data = await response.json();
        if (data.success) {
            const postDiv = unpinPostButton.closest('.pinned-post');
            postDiv.remove();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при откреплении поста');
    }
}

// Обработка событий для тем
document.addEventListener('DOMContentLoaded', function () {
    const topicsContainer = document.querySelector('.topics');
    if (topicsContainer) {
        topicsContainer.addEventListener('click', function (event) {
            const editButton = event.target.closest('.editTopicButton');
            const deleteButton = event.target.closest('.deleteTopicButton');
            const saveEditButton = event.target.closest('.saveEditTopicButton');

            if (editButton) showEditTopicForm(editButton);
            if (saveEditButton) saveEditedTopic(saveEditButton);
            if (deleteButton) deleteTopic(deleteButton);
        });
    }

    document.addEventListener('click', function (event) {
        const editPostButton = event.target.closest('.editPostButton');
        const deletePostButton = event.target.closest('.deletePostButton');
        const unpinPostButton = event.target.closest('.unpinPostButton');

        if (editPostButton) showEditPostForm(editPostButton);
        if (deletePostButton) deletePost(deletePostButton);
        if (unpinPostButton) unpinPost(unpinPostButton);
    });

    const addTopicButton = document.getElementById('addTopicButton');
    if (addTopicButton) {
        addTopicButton.addEventListener('click', showAddTopicForm);
    }

    const saveTopicButton = document.getElementById('saveTopicButton');
    if (saveTopicButton) {
        saveTopicButton.addEventListener('click', handleSaveTopic);
    }

    // Перенесенный скрипт из шаблона
    let textBlocks = document.querySelectorAll(".post-title");
    let buttons = document.querySelectorAll(".toggleButton");

    textBlocks.forEach((textBlock, index) => {
        let computedStyle = window.getComputedStyle(textBlock);
        let lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        let maxHeight = lineHeight * 3;
        let scrollHeight = textBlock.scrollHeight;

        if (scrollHeight > maxHeight) {
            buttons[index].classList.remove("hidden");

            buttons[index].addEventListener("click", function () {
                textBlock.classList.toggle("expanded");
                this.textContent = textBlock.classList.contains("expanded") ? "Скрыть" : "Показать больше";
            });
        }
    });
});
