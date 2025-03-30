// 将 dishes 数组的初始化改为函数
function getInitialDishes() {
    return [
        {
            id: 1,
            name: '干锅排骨',
            price: '¥18.8/份',
            image: 'https://raw.githubusercontent.com/lizefeng524/campus-meal-voting/main/images/dish_1.jpg'
        },
        {
            id: 2,
            name: '干锅虾',
            price: '¥18.8/份',
            image: 'https://raw.githubusercontent.com/lizefeng524/campus-meal-voting/main/images/dish_2.jpg'
        },
        {
            id: 3,
            name: '鸡丝拌面',
            price: '¥14/份',
            image: 'https://raw.githubusercontent.com/lizefeng524/campus-meal-voting/main/images/dish_3.jpg'
        },
        {
            id: 4,
            name: '糯米排骨饭',
            price: '¥18/份',
            image: 'https://raw.githubusercontent.com/lizefeng524/campus-meal-voting/main/images/dish_4.jpg'
        }
    ];
}

// 添加 GitHub API 相关配置
const GITHUB_API_URL = 'https://api.github.com/repos/lizefeng524/campus-meal-voting/contents/dishes.json';
const GITHUB_TOKEN = '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'; // 需要替换为你的实际token

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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 从 GitHub 加载菜品数据
        const response = await fetch(GITHUB_API_URL);
        if (response.ok) {
            const data = await response.json();
            const content = atob(data.content);
            // 正确处理中文字符
            const decodedContent = decodeURIComponent(escape(content));
            dishes = JSON.parse(decodedContent);
        } else {
            console.error('加载GitHub数据失败，使用初始数据');
            dishes = getInitialDishes();
        }
    } catch (e) {
        console.error('加载数据失败，使用初始数据');
        dishes = getInitialDishes();
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
            <img src="${dish.image}" alt="${dish.name}" class="dish-image" 
                onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=暂无图片'">
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

// 修改 previewImage 函数
async function previewImage(input, dishNumber) {
    const preview = document.getElementById(`imagePreview_${dishNumber}`);
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            // 先显示本地预览
            preview.src = e.target.result;
            
            try {
                // 将图片转换为 base64
                const base64Image = e.target.result.split(',')[1];
                
                // 生成文件名
                const fileName = `dish_${dishNumber}.jpg`;
                
                // 上传图片
                const uploadResponse = await fetch(`https://api.github.com/repos/lizefeng524/campus-meal-voting/contents/images/${fileName}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `更新菜品 ${dishNumber} 的图片`,
                        content: base64Image
                    })
                });

                if (uploadResponse.ok) {
                    // 使用原始内容 URL
                    const imageUrl = `https://raw.githubusercontent.com/lizefeng524/campus-meal-voting/main/images/${fileName}`;
                    preview.src = imageUrl;
                    
                    // 更新当前菜品的图片 URL
                    const dishIndex = dishNumber - 1;
                    if (dishIndex >= 0 && dishIndex < dishes.length) {
                        dishes[dishIndex].image = imageUrl;
                    }
                } else {
                    throw new Error('图片上传失败');
                }
            } catch (error) {
                console.error('图片上传失败:', error);
                alert('图片上传失败，请重试！');
                // 恢复原始图片
                const dishIndex = dishNumber - 1;
                if (dishIndex >= 0 && dishIndex < dishes.length) {
                    preview.src = dishes[dishIndex].image;
                }
            }
        }
        
        reader.readAsDataURL(file);
    }
}

// 修改 saveEdit 函数
async function saveEdit(dishNumber) {
    const nameInput = document.getElementById(`editName_${dishNumber}`);
    const priceInput = document.getElementById(`editPrice_${dishNumber}`);
    const imagePreview = document.getElementById(`imagePreview_${dishNumber}`);

    if (!nameInput || !priceInput || !imagePreview) {
        console.error('找不到表单元素');
        return;
    }

    // 更新菜品信息
    const dishIndex = dishNumber - 1;
    if (dishIndex < 0 || dishIndex >= dishes.length) {
        console.error('无效的菜品序号');
        return;
    }

    // 更新菜品信息
    const updatedDish = {
        id: dishes[dishIndex].id,
        name: nameInput.value,
        price: priceInput.value,
        image: imagePreview.src
    };

    // 更新数组中的特定菜品
    dishes[dishIndex] = updatedDish;

    try {
        // 获取当前文件内容
        const response = await fetch(GITHUB_API_URL);
        const data = await response.json();
        const currentContent = atob(data.content);
        const currentSha = data.sha;

        // 将 JSON 转换为字符串，确保正确处理中文字符
        const jsonString = JSON.stringify(dishes, null, 2);
        const content = btoa(unescape(encodeURIComponent(jsonString)));

        // 准备更新请求
        const updateResponse = await fetch(GITHUB_API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: '更新菜品信息',
                content: content,
                sha: currentSha
            })
        });

        if (!updateResponse.ok) {
            throw new Error('更新失败');
        }

        // 重新渲染页面
        renderDishes();
        renderVoteOptions();
        updateVoteResults();

        // 关闭编辑表单
        cancelEdit();
        
        alert('保存成功！');
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败，请重试！');
    }
}

function cancelEdit() {
    const form = document.querySelector('.edit-form');
    if (form) {
        form.remove();
    }
    editingDishId = null;
}
