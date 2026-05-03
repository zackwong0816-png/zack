/* ========================================
   NOVA 品牌官网 - 全局脚本
   ======================================== */

// 工具函数
const Utils = {
  // 格式化金额
  formatPrice(price) {
    return '¥' + parseFloat(price).toFixed(2);
  },

  // 获取 URL 参数
  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  // 本地存储
  storage: {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
      localStorage.removeItem(key);
    }
  },

  // HTML 转义（防 XSS）
  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // HTML 属性转义
  escapeAttr(str) {
    if (str == null) return '';
    return String(str).replace(/"/g, '&quot;');
  },

  // Toast 提示
  toast(message, duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// 密码哈希（简单 hash，仅作演示防护）
function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
  }
  return 'h_' + Math.abs(hash);
}

// 购物车模块
const Cart = {
  KEY: 'nova_cart',

  getItems() {
    return Utils.storage.get(this.KEY) || [];
  },

  saveItems(items) {
    Utils.storage.set(this.KEY, items);
    this.updateCount();
  },

  addItem(product, quantity = 1) {
    const items = this.getItems();
    const index = items.findIndex(item => item.id === product.id);

    if (index > -1) {
      items[index].quantity += quantity;
    } else {
      items.push({ ...product, quantity });
    }

    this.saveItems(items);
    Utils.toast('已添加到购物车');
  },

  removeItem(productId) {
    const items = this.getItems().filter(item => item.id !== productId);
    this.saveItems(items);
  },

  updateQuantity(productId, quantity) {
    const items = this.getItems();
    const index = items.findIndex(item => item.id === productId);
    if (index > -1) {
      if (quantity <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = quantity;
      }
      this.saveItems(items);
    }
  },

  clear() {
    Utils.storage.remove(this.KEY);
    this.updateCount();
  },

  getTotal() {
    return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  updateCount() {
    const count = this.getCount();
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// 会员模块
const Member = {
  KEY: 'nova_member',
  CMS_KEY: 'nova_members',

  isLoggedIn() {
    return !!Utils.storage.get(this.KEY);
  },

  getInfo() {
    return Utils.storage.get(this.KEY);
  },

  login(phone, password) {
    var cmsMembers = Utils.storage.get(this.CMS_KEY) || [];
    var cmsMatch = cmsMembers.find(function(m){ return m.phone === phone && m.password === hashPassword(password); });
    if (cmsMatch) {
      var member = { id: cmsMatch.id, phone: cmsMatch.phone, nickname: cmsMatch.nickname, level: cmsMatch.level, points: cmsMatch.points || 0, avatar: null };
      Utils.storage.set(this.KEY, member);
      Utils.toast('登录成功');
      return member;
    }

    Utils.toast('手机号或密码错误');
    return null;
  },

  logout() {
    Utils.storage.remove(this.KEY);
    Utils.toast('已退出登录');
    window.location.reload();
  },

  register(data) {
    var cmsMembers = Utils.storage.get(this.CMS_KEY) || [];
    if (cmsMembers.find(function(m){ return m.phone === data.phone; })) {
      Utils.toast('该手机号已注册');
      return null;
    }
    var member = {
      id: Date.now(),
      nickname: data.nickname || '用户' + (data.phone||'').slice(-4),
      phone: data.phone,
      password: hashPassword(data.password || ''),
      level: 'bronze',
      points: 100,
      totalSpent: 0,
      orders: 0,
      createdAt: new Date().toISOString().substring(0,10),
      status: 'active'
    };
    cmsMembers.push(member);
    Utils.storage.set(this.CMS_KEY, cmsMembers);
    var simple = { id: member.id, phone: member.phone, nickname: member.nickname, level: member.level, points: member.points, avatar: null };
    Utils.storage.set(this.KEY, simple);
    Utils.toast('注册成功');
    return simple;
  },

  updatePoints(points) {
    var member = this.getInfo();
    if (member) {
      member.points += points;
      Utils.storage.set(this.KEY, member);
      var cmsMembers = Utils.storage.get(this.CMS_KEY) || [];
      var idx = cmsMembers.findIndex(function(m){ return m.id === member.id; });
      if (idx > -1) { cmsMembers[idx].points = member.points; Utils.storage.set(this.CMS_KEY, cmsMembers); }
    }
  },

  getOrders: function() {
    return (JSON.parse(localStorage.getItem('nova_orders') || '[]')).filter(function(o){ return o.phone && o.phone.indexOf('****') > 0; });
  }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  // 更新购物车数量
  Cart.updateCount();

  // 移动端菜单
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  // 表单验证
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      let valid = true;
      form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.classList.add('error');
        } else {
          input.classList.remove('error');
        }
      });
      if (!valid) {
        e.preventDefault();
        Utils.toast('请填写必填项');
      }
    });
  });

  // 平滑滚动到锚点
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// 轮播图模块
class Carousel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoplay: true,
      interval: 4000,
      ...options
    };
    this.currentIndex = 0;
    this.items = container.querySelectorAll('.carousel-item');
    this.init();
  }

  init() {
    if (this.items.length === 0) return;

    // 创建指示器
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';
    this.items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = i === 0 ? 'active' : '';
      dot.addEventListener('click', () => this.goTo(i));
      indicators.appendChild(dot);
    });
    this.container.appendChild(indicators);

    // 自动播放
    if (this.options.autoplay) {
      setInterval(() => this.next(), this.options.interval);
    }
  }

  goTo(index) {
    this.items[this.currentIndex].classList.remove('active');
    this.container.querySelectorAll('.carousel-indicators button')[this.currentIndex].classList.remove('active');

    this.currentIndex = index;
    if (this.currentIndex >= this.items.length) this.currentIndex = 0;
    if (this.currentIndex < 0) this.currentIndex = this.items.length - 1;

    this.items[this.currentIndex].classList.add('active');
    this.container.querySelectorAll('.carousel-indicators button')[this.currentIndex].classList.add('active');
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }
}

// 导出
window.NOVA = {
  Utils,
  Cart,
  Member,
  Carousel
};