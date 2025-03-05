document.addEventListener('DOMContentLoaded', function () {
    const addPostButton = document.getElementById('addPostButton');
    const addPostForm = document.getElementById('addPostForm');
    const postPhotoInput = document.getElementById('postPhoto');
    const savePostButton = document.getElementById('savePostButton');
    const postsContainer = document.getElementById('posts');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const confirmationOk = document.getElementById('confirmationOk');
    const confirmationCancel = document.getElementById('confirmationCancel');
    const popup = document.getElementById('popup');

    if (!addPostButton || !addPostForm || !postPhotoInput || !savePostButton || !postsContainer || !confirmationPopup || !confirmationOk || !confirmationCancel || !popup) {
        console.error('Один или несколько элементов DOM не найдены');
        return;
    }

    addPostButton.addEventListener('click', showAddPostForm);
    postPhotoInput.addEventListener('change', handlePhotoChange);
    savePostButton.addEventListener('click', saveNewPost);
    document.addEventListener('click', handlePostActions);

    function showAddPostForm() {
        addPostForm.style.display = 'block';
    }

    function handlePhotoChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let preview = document.getElementById('photoPreview');
                if (!preview) {
                    preview = document.createElement('img');
                    preview.id = 'photoPreview';
                    preview.classList.add('post-image');
                    addPostForm.appendChild(preview);
                }
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Функция для генерации случайного имени файла
    function generateRandomFileName(originalFileName) {
        const timestamp = new Date().getTime(); // Текущее время в миллисекундах
        const randomNumber = Math.floor(Math.random() * 10000); // Случайное число от 0 до 9999
        const fileExtension = originalFileName.split('.').pop(); // Получаем расширение файла
        return `photo_${timestamp}_${randomNumber}.${fileExtension}`;
    }

    async function saveNewPost() {
        const postContent = document.getElementById('postContent').value;
        const postPhoto = postPhotoInput.files[0];
        const topicId = addPostForm.dataset.topicId;

        if (!postContent && !postPhoto) {
            alert('Поле не может быть пустым');
            return;
        }

        const formData = new FormData();
        formData.append('topicId', topicId);
        formData.append('postContent', postContent || '');
        if (postPhoto) {
            const randomName = generateRandomFileName(postPhoto.name); // Генерация случайного имени
            formData.append('postPhoto', postPhoto, randomName);
        }

        try {
            const response = await fetch('/save_post', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ошибка сети или сервера');
            }

            const data = await response.json();
            if (data.success) {
                clearAddPostForm();
                createPostElement(data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при сохранении поста');
        }
    }

    function clearAddPostForm() {
        document.getElementById('postContent').value = '';
        postPhotoInput.value = '';
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.remove();
        }
        addPostForm.style.display = 'none';
    }

    function createPostElement(data) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.setAttribute('data-post-id', data.postId);
        postDiv.innerHTML = `
            <div class="post-title">${data.postContent || ''}</div>
            <div class="actions">
                <button class="editPostButton" data-post-text="${data.postContent || ''}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="pinPostButton">
                    <i class="fas fa-thumbtack"></i>
                </button>
                <button class="deletePostButton">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="post-created-at">${data.createdAt}</div>
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

        if (data.photoFilename) {
            const img = document.createElement('img');
            img.src = `/static/uploads/${data.photoFilename}`;
            img.classList.add('post-image');
            postDiv.insertBefore(img, postDiv.querySelector('.actions'));
        }

        postsContainer.prepend(postDiv);
    }

    function handlePostActions(event) {
        const deleteButton = event.target.closest('.deletePostButton');
        const pinButton = event.target.closest('.pinPostButton');
        const editButton = event.target.closest('.editPostButton');

        if (deleteButton) {
            handleDeletePost(deleteButton);
        } else if (pinButton) {
            handlePinPost(pinButton);
        } else if (editButton) {
            handleEditPost(editButton);
        }
    }

    function handleDeletePost(button) {
        const postId = button.closest('.post').dataset.postId;
        confirmationPopup.style.display = 'block';

        confirmationOk.onclick = async function () {
            try {
                const response = await fetch('/delete_post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId: postId })
                });

                if (!response.ok) {
                    throw new Error('Ошибка сети или сервера');
                }

                const data = await response.json();
                if (data.success) {
                    const postElement = button.closest('.post');
                    postElement.remove();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при удалении поста');
            } finally {
                confirmationPopup.style.display = 'none';
            }
        };

        confirmationCancel.onclick = function () {
            confirmationPopup.style.display = 'none';
        };
    }

    async function handlePinPost(button) {
        const postId = button.closest('.post').dataset.postId;

        try {
            const response = await fetch('/pin_post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: postId })
            });

            if (!response.ok) {
                throw new Error('Ошибка сети или сервера');
            }

            const data = await response.json();
            if (data.success) {
                popup.style.display = 'block';
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 1000);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при закреплении поста');
        }
    }

    function handleEditPost(button) {
        const post = button.closest('.post');
        const editForm = post.querySelector('.edit-post-form');
        const input = editForm.querySelector('.editPostContent');
        const fileInput = editForm.querySelector('.editPostPhoto');

        const postText = button.getAttribute('data-post-text');
        input.value = postText || '';
        input.placeholder = 'Введите новую запись';
        editForm.style.display = 'block';

        editForm.querySelector('.saveEditPostButton').onclick = async function () {
            const newPostContent = input.value;
            const newPostPhoto = fileInput.files[0];

            if (!newPostContent && !newPostPhoto) {
                alert('Поле не может быть пустым');
                return;
            }

            const formData = new FormData();
            formData.append('postId', post.dataset.postId);
            if (newPostContent) {
                formData.append('postContent', newPostContent);
            }
            if (newPostPhoto) {
                formData.append('postPhoto', newPostPhoto);
            }

            try {
                const response = await fetch('/edit_post', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Ошибка сети или сервера');
                }

                const data = await response.json();
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
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при редактировании поста');
            }
        };
    }
});
