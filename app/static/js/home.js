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
        editForm.style.display = 'block';
        editForm.querySelector('.editTopicContent').value = topicName;

        editForm.querySelector('.saveEditTopicButton').addEventListener('click', function() {
            const newTopicName = editForm.querySelector('.editTopicContent').value;

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

    if (event.target && event.target.classList.contains('deleteTopicButton')) {
        const topicId = event.target.getAttribute('data-topic-id');

        if (confirm('Вы уверены, что хотите удалить эту тему?')) {
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
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }

    if (event.target && event.target.classList.contains('editPostButton')) {
        const postId = event.target.getAttribute('data-post-id');
        const postName = event.target.getAttribute('data-post-name');
        const editForm = event.target.parentElement.nextElementSibling;
        editForm.style.display = 'block';
        editForm.querySelector('.editPostContent').value = postName;

        editForm.querySelector('.saveeditPostButton').addEventListener('click', function() {
            const newPostName = editForm.querySelector('.editPostContent').value;

            if (newPostName) {
                fetch('/edit_post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ postId: postId, postName: newPostName })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        event.target.parentElement.previousElementSibling.textContent = newPostName;
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

    if (event.target && event.target.classList.contains('deletePostButton')) {
        const postId = event.target.getAttribute('data-post-id');

        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
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
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }

    if (event.target && event.target.classList.contains('unpinPostButton')) {
        const postId = event.target.getAttribute('data-post-id');

        // Удаляем вызов confirm
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

    if (event.target && event.target.classList.contains('pinPostButton')) {
        const postId = event.target.getAttribute('data-post-id');
        const postName = event.target.getAttribute('data-post-name');

        if (confirm('Вы уверены, что хотите закрепить эту запись?')) {
            fetch('/pin_post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId: postId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const postDiv = document.createElement('div');
                    postDiv.className = 'pinned-post';
                    postDiv.innerHTML = `
                        <div class="post-title">${postName}</div>
                        <div class="actions">
                            <button class="editPostButton" data-post-id="${postId}" data-post-name="${postName}">Редактировать</button>
                            <button class="unpinPostButton" data-post-id="${postId}">Открепить</button>
                            <button class="deletePostButton" data-post-id="${postId}">Удалить</button>
                        </div>
                        <div class="add-postform edit-post-form" style="display: none;">
                            <input type="text" class="editPostContent" placeholder="Введите новое название записи">
                            <button class="saveeditPostButton">Сохранить</button>
                        </div>
                    `;

                    // Добавляем новую закрепленную запись в начало списка
                    const pinnedContainer = document.querySelector('.pinned');
                    pinnedContainer.insertBefore(postDiv, pinnedContainer.firstChild);
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
});
