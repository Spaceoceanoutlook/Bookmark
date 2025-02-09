document.addEventListener('DOMContentLoaded', function () {
    // Показать форму для добавления записи
    document.getElementById('addPostButton').addEventListener('click', function () {
        document.getElementById('addPostForm').style.display = 'block';
    });

    // Отображение миниатюры при выборе изображения
    document.getElementById('postPhoto').addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let preview = document.getElementById('photoPreview');
                if (!preview) {
                    preview = document.createElement('img');
                    preview.id = 'photoPreview';
                    preview.classList.add('post-image');
                    document.getElementById('addPostForm').appendChild(preview);
                }
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Сохранение нового поста
    document.getElementById('savePostButton').addEventListener('click', function () {
        const postContent = document.getElementById('postContent').value;
        const postPhoto = document.getElementById('postPhoto').files[0];
        const topicId = document.getElementById('addPostForm').dataset.topicId;

        const formData = new FormData();
        formData.append('topicId', topicId);
        if (postContent) {
            formData.append('postContent', postContent);
        }
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
                // Очистка формы и превью фото
                document.getElementById('postContent').value = '';
                document.getElementById('postPhoto').value = '';

                const preview = document.getElementById('photoPreview');
                if (preview) {
                    preview.remove();
                }

                document.getElementById('addPostForm').style.display = 'none';

                // Добавление поста в список
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.setAttribute('data-post-id', data.postId);
                postDiv.innerHTML = `
                    <div class="post-title">${data.postContent || ''}</div>
                    <div class="actions">
                        <button class="editPostButton" data-post-id="${data.postId}" data-post-text="${data.postContent || ''}">Редактировать</button>
                        <button class="pinPostButton">Закрепить</button>
                        <button class="deletePostButton">Удалить</button>
                    </div>
                    <div class="edit-post-form" style="display: none;">
                        <div class="input-group">
                            <input type="text" class="editPostContent" placeholder="Введите новую запись">
                            <label for="editPostPhoto_${data.postId}" class="file-upload-wrapper">
                                <span class="upload-icon">📁</span>
                                <input type="file" id="editPostPhoto_${data.postId}" class="editPostPhoto" accept="image/*">
                            </label>
                        </div>
                        <button class="saveEditPostButton">Сохранить</button>
                    </div>
                `;

                if (data.photoFilename) {
                    const img = document.createElement('img');
                    img.src = `/static/uploads/${data.photoFilename}`;
                    img.classList.add('post-image');
                    postDiv.insertBefore(img, postDiv.querySelector('.actions'));
                }

                document.getElementById('posts').prepend(postDiv);
            } else {
                alert(data.message);
            }
        })
        .catch(console.error);
    });

    // Удаление поста
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

    // Закрепление поста
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
                if (!data.success) {
                    alert(data.message);
                }
            })
            .catch(console.error);
        }
    });

    // Редактирование поста
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('editPostButton')) {
            const post = event.target.closest('.post');
            const editForm = post.querySelector('.edit-post-form');
            const input = editForm.querySelector('.editPostContent');
            const fileInput = editForm.querySelector('.editPostPhoto');

            // Получаем текст поста из data-атрибута кнопки редактирования
            const postText = event.target.getAttribute('data-post-text');

            input.value = postText || '';
            input.placeholder = 'Введите новую запись';
            editForm.style.display = 'block';

            editForm.querySelector('.saveEditPostButton').onclick = function () {
                const newPostContent = input.value;
                const newPostPhoto = fileInput.files[0];

                const formData = new FormData();
                formData.append('postId', post.dataset.postId);
                if (newPostContent) {
                    formData.append('postContent', newPostContent);
                }
                if (newPostPhoto) {
                    formData.append('postPhoto', newPostPhoto);
                }

                fetch('/edit_post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        postId: post.dataset.postId,
                        postContent: newPostContent,
                        postPhoto: newPostPhoto ? newPostPhoto.name : null
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        post.querySelector('.post-title').textContent = newPostContent || '';
                        editForm.style.display = 'none';

                        if (data.photoFilename) {
                            const img = post.querySelector('img');
                            if (img) {
                                img.src = `/static/uploads/${data.photoFilename}`;
                            } else {
                                const newImg = document.createElement('img');
                                newImg.src = `/static/uploads/${data.photoFilename}`;
                                newImg.classList.add('post-image');
                                post.insertBefore(newImg, post.querySelector('.actions'));
                            }
                        }
                    } else {
                        alert(data.message);
                    }
                })
                .catch(console.error);
            };
        }
    });
});
