// 将 dishes 数组的初始化改为函数
function getInitialDishes() {
    return [
        {
            id: 1,
            name: '干锅排骨',
            price: '¥18.8/份',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 2,
            name: '干锅虾',
            price: '¥18.8/份',
            image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 3,
            name: '鸡丝拌面',
            price: '¥14/份',
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 4,
            name: '糯米排骨饭',
            price: '¥18/份',
            image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        }
    ];
}

// 声明全局变量
let dishes = getInitialDishes();
let editingDishId = null;
let isLoggedIn = false;

// 添加登录函数
function login() {
    const username = prompt('请输入用户名：');
    const password = prompt('请输入密码：');
    
    if (username === 'lizefeng' && password === '00000000') {
        isLoggedIn = true;
        alert('登录成功！');
        renderDishes(); // 重新渲染页面以显示编辑按钮
    } else {
        alert('用户名或密码错误！');
    }
}

// 修改初始化代码
document.addEventListener('DOMContentLoaded', () => {
    // 从 localStorage 加载菜品数据
    const savedDishes = localStorage.getItem('dishes');
    if (savedDishes) {
        try {
            dishes = JSON.parse(savedDishes);
        } catch (e) {
            console.error('加载保存的菜品数据失败，使用初始数据');
            dishes = getInitialDishes();
        }
    }

    // 确保DOM元素存在
    const dishesGrid = document.getElementById('dishesGrid');
    const voteOptions = document.getElementById('voteOptions');
    const voteResults = document.getElementById('voteResults');
    
    if (!dishesGrid || !voteOptions || !voteResults) {
        console.error('必要的DOM元素未找到');
        return;
    }

    renderDishes();
    renderVoteOptions();
    updateVoteResults();
});

// 渲染菜品卡片
function renderDishes() {
    const dishesGrid = document.getElementById('dishesGrid');
    if (!dishesGrid) return;

    dishesGrid.innerHTML = dishes.map((dish, index) => `
        <div class="dish-card">
            <div class="dish-number">#${index + 1}</div>
            <img src="${dish.image}" alt="${dish.name}" class="dish-image" onerror="this.src='https://via.placeholder.com/300x200?text=暂无图片'">
            <div class="dish-info">
                <h3 class="dish-name">${dish.name}</h3>
                <p class="dish-price">${dish.price}</p>
                ${isLoggedIn ? `<button class="edit-button" onclick="showEditForm(${index + 1})">编辑</button>` : ''}
            </div>
        </div>
    `).join('');
}

// 渲染投票选项
function renderVoteOptions() {
    const voteOptions = document.getElementById('voteOptions');
    if (!voteOptions) return;

    voteOptions.innerHTML = dishes.map(dish => `
        <label class="vote-option">
            <input type="radio" name="dish" value="${dish.id}">
            ${dish.name}
        </label>
    `).join('');
}

// 检查是否已投票
function hasVoted() {
    return localStorage.getItem('hasVoted') === 'true';
}

// 更新投票按钮状态
function updateVoteButton() {
    const voteButton = document.getElementById('voteButton');
    if (voteButton) {
        voteButton.disabled = hasVoted();
    }
}

// 更新投票结果
function updateVoteResults() {
    const results = document.getElementById('voteResults');
    if (!results) return;

    const votes = JSON.parse(localStorage.getItem('votes') || '{}');
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

    results.innerHTML = dishes.map(dish => {
        const voteCount = votes[dish.id] || 0;
        const percentage = totalVotes ? (voteCount / totalVotes * 100).toFixed(1) : 0;
        return `
            <div class="result-bar">
                <div class="result-label">
                    <span>${dish.name}</span>
                    <span>${voteCount}票 (${percentage}%)</span>
                </div>
                <div class="result-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
    }).join('');
}

// 处理投票提交
document.addEventListener('DOMContentLoaded', () => {
    const voteForm = document.getElementById('voteForm');
    if (voteForm) {
        voteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (hasVoted()) {
                alert('您已经投过票了！');
                return;
            }

            const selectedDish = document.querySelector('input[name="dish"]:checked');
            if (!selectedDish) {
                alert('请选择一个菜品！');
                return;
            }

            const dishId = selectedDish.value;
            const votes = JSON.parse(localStorage.getItem('votes') || '{}');
            votes[dishId] = (votes[dishId] || 0) + 1;
            
            localStorage.setItem('votes', JSON.stringify(votes));
            localStorage.setItem('hasVoted', 'true');
            
            alert('投票成功！');
            updateVoteButton();
            updateVoteResults();
        });
    }
});

// 添加编辑相关的函数
function showEditForm(dishNumber) {
    const dish = dishes[dishNumber - 1]; // 因为序号从1开始，所以要减1
    if (!dish) return;

    // 移除可能存在的旧表单
    const oldForm = document.querySelector('.edit-form');
    if (oldForm) {
        oldForm.remove();
    }

    // 创建编辑表单
    const form = document.createElement('div');
    form.className = 'edit-form';
    form.innerHTML = `
        <div class="edit-form-content">
            <h3>编辑菜品 #${dishNumber}</h3>
            <input type="text" id="editName_${dishNumber}" value="${dish.name}" placeholder="菜品名称">
            <input type="text" id="editPrice_${dishNumber}" value="${dish.price}" placeholder="价格">
            <div class="image-upload">
                <input type="file" id="editImage_${dishNumber}" accept="image/*" onchange="previewImage(this, ${dishNumber})">
                <img id="imagePreview_${dishNumber}" src="${dish.image}" alt="预览图" class="preview-image">
            </div>
            <div class="edit-buttons">
                <button onclick="saveEdit(${dishNumber})">保存</button>
                <button onclick="cancelEdit()">取消</button>
            </div>
        </div>
    `;

    // 显示编辑表单
    document.body.appendChild(form);
}

// 修改图片预览函数
function previewImage(input, dishNumber) {
    const preview = document.getElementById(`imagePreview_${dishNumber}`);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 修改 saveEdit 函数
function saveEdit(dishNumber) {
    const nameInput = document.getElementById(`editName_${dishNumber}`);
    const priceInput = document.getElementById(`editPrice_${dishNumber}`);
    const imagePreview = document.getElementById(`imagePreview_${dishNumber}`);

    if (!nameInput || !priceInput || !imagePreview) {
        console.error('找不到表单元素');
        return;
    }

    // 更新菜品信息
    const dishIndex = dishNumber - 1; // 因为序号从1开始，所以要减1
    if (dishIndex < 0 || dishIndex >= dishes.length) {
        console.error('无效的菜品序号');
        return;
    }

    // 更新菜品信息
    const updatedDish = {
        id: dishes[dishIndex].id, // 保持原有的ID
        name: nameInput.value,
        price: priceInput.value,
        image: imagePreview.src
    };

    // 更新数组中的特定菜品
    dishes[dishIndex] = updatedDish;

    // 保存到 localStorage
    localStorage.setItem('dishes', JSON.stringify(dishes));

    // 重新渲染页面
    renderDishes();
    renderVoteOptions();
    updateVoteResults();

    // 关闭编辑表单
    cancelEdit();
}

function cancelEdit() {
    const form = document.querySelector('.edit-form');
    if (form) {
        form.remove();
    }
    editingDishId = null;
}