document.addEventListener('DOMContentLoaded', function () {
    // Показать форму для добавления записи
    document.getElementById('addPostButton').addEventListener('click', function () {
        document.getElementById('addPostForm').style.display = 'block';
    });

    // Сохранить новую запись
    document.getElementById('savePostButton').addEventListener('click', function () {
        const postContent = document.getElementById('postContent').value;
        const postPhoto = document.getElementById('postPhoto').files[0];
        const topicId = document.getElementById('addPostForm').dataset.topicId; // Получаем ID темы

        if (postContent) {
            const formData = new FormData();
            formData.append('postContent', postContent);
            formData.append('topicId', topicId);
            if (postPhoto) {
                formData.append('postPhoto', postPhoto);
            }

            fetch('/save_post', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const postDiv = document.createElement('div');
                    postDiv.className = 'post';
                    postDiv.setAttribute('data-post-id', data.postId);
                    postDiv.innerHTML = `
                        <div class="post-title">${data.postContent}</div>
                        <div class="actions">
                            <button class="editPostButton" data-post-id="${data.postId}" data-post-text="${data.postContent}">Редактировать</button>
                            <button class="pinPostButton">Закрепить</button>
                            <button class="deletePostButton">Удалить</button>
                        </div>
                        <div class="add-postform edit-post-form" style="display: none;">
                            <input type="text" class="editPostContent" placeholder="Введите новое название записи">
                            <button class="saveeditPostButton">Сохранить</button>
                        </div>
                    `;

                    if (data.photoFilename) {
                        const img = document.createElement('img');
                        img.src = `/static/uploads/${data.photoFilename}`;
                        postDiv.insertBefore(img, postDiv.querySelector('.actions'));
                    }

                    document.getElementById('posts').prepend(postDiv);
                    document.getElementById('addPostForm').style.display = 'none';
                    document.getElementById('postContent').value = '';
                    document.getElementById('postPhoto').value = '';
                } else {
                    alert(data.message);
                }
            })
            .catch(console.error);
        }
    });

    // Удалить запись
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('deletePostButton')) {
            const postId = event.target.closest('.post').dataset.postId;

            if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                fetch('/delete_post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId: postId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        event.target.closest('.post').remove();
                    } else {
                        alert(data.message);
                    }
                })
                .catch(console.error);
            }
        }
    });

    // Закрепить запись
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('pinPostButton')) {
            const postId = event.target.closest('.post').dataset.postId;

            fetch('/pin_post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: postId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Запись успешно закреплена!');
                } else {
                    alert(data.message);
                }
            })
            .catch(console.error);
        }
    });

    // Редактировать запись
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('editPostButton')) {
            const post = event.target.closest('.post');
            const editForm = post.querySelector('.edit-post-form');
            const input = editForm.querySelector('.editPostContent');

            input.value = event.target.dataset.postText;
            editForm.style.display = 'block';

            editForm.querySelector('.saveeditPostButton').onclick = function () {
                const newPostName = input.value;
                if (newPostName) {
                    fetch('/edit_post', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postId: post.dataset.postId, postName: newPostName })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            post.querySelector('.post-title').textContent = newPostName;
                            editForm.style.display = 'none';
                        }
                    })
                    .catch(console.error);
                }
            };
        }
    });
});
