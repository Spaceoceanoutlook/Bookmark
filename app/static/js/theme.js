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

                // Создание нового поста с иконками
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.setAttribute('data-post-id', data.postId);
                postDiv.innerHTML = `
                    <div class="post-title">${data.postContent || ''}</div>
                    <div class="post-created-at">${data.createdAt}</div>
                    <div class="actions">
                        <button class="editPostButton" data-post-id="${data.postId}" data-post-text="${data.postContent || ''}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="pinPostButton">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button class="deletePostButton">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="edit-post-form" style="display: none;">
                        <div class="input-group">
                            <textarea class="editPostContent" placeholder="Введите новую запись"></textarea>
                            <label for="editPostPhoto_${data.postId}" class="file-upload-wrapper">
                                <span class="upload-icon">📁</span>
                                <input type="file" id="editPostPhoto_${data.postId}" class="editPostPhoto" accept="image/*">
                            </label>
                        </div>
                        <button class="saveEditPostButton">Сохранить</button>
                    </div>
                `;

                // Если есть фото, добавляем его
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

    document.addEventListener('click', function (event) {
    const deleteButton = event.target.closest('.deletePostButton');
    if (deleteButton) {
        const postId = deleteButton.closest('.post').dataset.postId;
        const confirmationPopup = document.getElementById('confirmationPopup');
        const confirmationOk = document.getElementById('confirmationOk');
        const confirmationCancel = document.getElementById('confirmationCancel');

        confirmationPopup.style.display = 'block';

        confirmationOk.onclick = function () {
            fetch('/delete_post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: postId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Удалить элемент из DOM
                    const postElement = event.target.closest('.post');
                    postElement.remove();
                } else {
                    alert(data.message);
                }
                confirmationPopup.style.display = 'none';
            })
            .catch(console.error);
        };

        confirmationCancel.onclick = function () {
            confirmationPopup.style.display = 'none';
        };
    }
});


    // Закрепление поста
    document.addEventListener('click', function (event) {
    const pinButton = event.target.closest('.pinPostButton');
    if (pinButton) {
        const postId = pinButton.closest('.post').dataset.postId;

        fetch('/pin_post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: postId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Показать всплывающее окно на полсекунды
                const popup = document.getElementById('popup');
                popup.style.display = 'block';
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 1000); // 1 секунда
            } else {
                alert(data.message);
            }
        })
        .catch(console.error);
    }
});


    // Редактирование поста
    document.addEventListener('click', function (event) {
        const editButton = event.target.closest('.editPostButton');
        if (editButton) {
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
