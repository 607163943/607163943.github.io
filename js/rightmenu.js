// RightMenu 鼠标右键菜单
let rmf = {};

// 显示右键菜单
rmf.showRightMenu = function(isTrue, x=0, y=0){
    let $rightMenu = $('#rightMenu');
    $rightMenu.css('top',x+'px').css('left',y+'px');

    if(isTrue){
        $rightMenu.show();
    }else{
        $rightMenu.hide();
    }
}

// 昼夜切换
rmf.switchDarkMode = function(){
    const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    if (nowMode === 'light') {
        btf.activateDarkMode()
        btf.saveToLocal.set('theme', 'dark', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
    } else {
        btf.activateLightMode()
        btf.saveToLocal.set('theme', 'light', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
    }
    // handle some cases
    typeof utterancesTheme === 'function' && utterancesTheme()
    typeof FB === 'object' && window.loadFBComment()
    window.DISQUS && document.getElementById('disqus_thread').children.length && setTimeout(() => window.disqusReset(), 200)
};

// 动态更新菜单文本
rmf.updateMenuText = function(){
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const isHideAside = document.documentElement.classList.contains('hide-aside')
    document.getElementById('menu-darkmode-text').textContent = isDark ? '日间模式' : '夜间模式'
    document.getElementById('menu-aside-text').textContent = isHideAside ? '显示侧栏' : '隐藏侧栏'
}

// 隐藏/显示侧栏
rmf.toggleSidebar = function(){
    const $htmlDom = document.documentElement.classList
    const saveStatus = $htmlDom.contains('hide-aside') ? 'show' : 'hide'
    btf.saveToLocal.set('aside-status', saveStatus, 2)
    $htmlDom.toggle('hide-aside')
}

//复制选中文字
rmf.copySelect = function(){
    document.execCommand('Copy',false,null);
    //这里可以写点东西提示一下 已复制
}

//回到顶部
rmf.scrollToTop = function(){
    btf.scrollToDest(0, 500);
}

// 右键菜单事件
if(! (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))){
    window.oncontextmenu = function(event){
        $('.rightMenu-group.hide').hide();
        //如果有文字选中，则显示 文字选中相关的菜单项
        if(document.getSelection().toString()){
            $('#menu-text').show();
        }

        // console.log(event.target);
        let pageX = event.clientX + 10;
        let pageY = event.clientY;
        let rmWidth = $('#rightMenu').width();
        let rmHeight = $('#rightMenu').height();
        if(pageX + rmWidth > window.innerWidth){
            pageX -= rmWidth+10;
        }
        if(pageY + rmHeight > window.innerHeight){
            pageY -= pageY + rmHeight - window.innerHeight;
        }



        rmf.updateMenuText();
        rmf.showRightMenu(true, pageY, pageX);
        return false;
    };

    window.addEventListener('click',function(){rmf.showRightMenu(false);});
    // window.addEventListener('load',function(){rmf.switchTheme(true);});
}
