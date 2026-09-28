/* ------------------------------------------------------------------
   main.js — 交互脚本：导航高亮 / 展开收起 / 条形图动画 / 一键复制引用
   一般无需修改即可直接使用
------------------------------------------------------------------ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* 1. 导航栏滚动状态（加底部分隔线和阴影） */
    var navbar = document.getElementById('navbar');
    function onScrollNav() {
      if (window.scrollY > 8) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();

    /* 2. 滚动时高亮当前版块对应的导航链接 */
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var sections = links.map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    });
    function spy() {
      var pos = window.scrollY + 130;
      var idx = -1;
      sections.forEach(function (sec, i) {
        if (sec && sec.offsetTop <= pos) idx = i;
      });
      links.forEach(function (a, i) {
        a.classList.toggle('active', i === idx);
      });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();

    /* 3. "Show more" 按钮的展开与收起 */
    document.querySelectorAll('[data-toggle]').forEach(function (btn) {
      var label = btn.querySelector('.btn-label');
      var defaultLabel = label ? label.textContent : 'Show more';
      btn.addEventListener('click', function () {
        var target = document.querySelector(btn.getAttribute('data-toggle'));
        if (!target) return;
        var open = target.classList.toggle('open');
        btn.classList.toggle('open', open);
        if (label) label.textContent = open ? 'Show less' : defaultLabel;
      });
    });

    /* 4. 进入视口时：块淡入 + 用户研究条形图从 0 生长 */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('visible');
          en.target.querySelectorAll('.bar').forEach(function (bar, i) {
            bar.style.transitionDelay = (i * 70) + 'ms';
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                bar.style.width = bar.getAttribute('data-w') + '%';
              });
            });
          });
          io.unobserve(en.target);
        });
      }, { threshold: 0.18 });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    } else {
      /* 老浏览器降级：直接显示，并把条形图拉满 */
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
      document.querySelectorAll('.bar').forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-w') + '%';
      });
    }

    /* 5. 一键复制 BibTeX */
    var copyBtn = document.getElementById('copyBib');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = document.getElementById('bibText').innerText;
        function done() {
          copyBtn.textContent = 'Copied';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    }
  });
})();
