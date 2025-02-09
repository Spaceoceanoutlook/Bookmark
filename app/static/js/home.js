document.getElementById('addTopicButton').addEventListener('click', function() {
    document.getElementById('addTopicForm').style.display = 'block';
});

document.getElementById('saveTopicButton').addEventListener('click', function() {
    const topicContent = document.getElementById('topicContent').value;

    if (topicContent) {
        fetch('/save_topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicName: topicContent })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const topicDiv = document.createElement('div');
                topicDiv.className = 'topic';
                topicDiv.innerHTML = `
                    <div class="topic-title">
                        <a href="/theme/${data.topicId}">${data.topicName}</a>
                    </div>
                    <div class="actions">
                        <button class="editTopicButton" data-topic-id="${data.topicId}" data-topic-name="${data.topicName}">Редактировать</button>
                        <button class="deleteTopicButton" data-topic-id="${data.topicId}">Удалить</button>
                    </div>
                    <div class="add-topic-form edit-topic-form" style="display: none;">
                        <input type="text" class="editTopicContent" placeholder="Введите новое название темы">
                        <button class="saveEditTopicButton">Сохранить</button>
                    </div>
                `;

                // Добавляем новую тему в начало списка
                const topicsContainer = document.querySelector('.topics');
                topicsContainer.insertBefore(topicDiv, topicsContainer.firstChild);

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
});

document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('editTopicButton')) {
        const topicId = event.target.getAttribute('data-topic-id');
        const topicName = event.target.getAttribute('data-topic-name');
        const editForm = event.target.parentElement.nextElementSibling;
        const input = editForm.querySelector('.editTopicContent');

        input.value = topicName;
        input.placeholder = 'Введите новое название темы';
        editForm.style.display = 'block';

        editForm.querySelector('.saveEditTopicButton').addEventListener('click', function() {
            const newTopicName = input.value;

            if (newTopicName) {
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
                        event.target.parentElement.previousElementSibling.querySelector('a').textContent = newTopicName;
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

    // Удаление темы
    if (event.target && event.target.classList.contains('deleteTopicButton')) {
        const topicId = event.target.getAttribute('data-topic-id');
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
                    const topicDiv = event.target.closest('.topic');
                    topicDiv.remove();
                    // Обновляем страницу после удаления темы
                    location.reload();
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

    if (event.target && event.target.classList.contains('editPostButton')) {
        const postId = event.target.getAttribute('data-post-id');
        const postName = event.target.getAttribute('data-post-name');
        const editForm = event.target.parentElement.nextElementSibling;
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
                        const postDiv = event.target.closest('.pinned-post');
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

    // Удаление записи
    if (event.target && event.target.classList.contains('deletePostButton')) {
        const postId = event.target.getAttribute('data-post-id');
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
                    const postDiv = event.target.closest('.pinned-post');
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

    if (event.target && event.target.classList.contains('unpinPostButton')) {
        const postId = event.target.getAttribute('data-post-id');

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
                const postDiv = event.target.closest('.pinned-post');
                postDiv.remove();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});