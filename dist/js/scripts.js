(function () {
    'use strict';

    (() => {
        const spBreak = 767.98;
        const detectMobile = () => {
            return window.matchMedia(`(max-width: ${spBreak}px)`).matches;
        };
        const detectBrowsers = () => {
            const html = $('html');
            const ua = navigator.userAgent.toLowerCase();
            if (ua.includes('mac')) {
                html.addClass('is-mac');
            }
            if (ua.includes('safari')) {
                if (ua.includes('chrome')) {
                    html.addClass('is-chrome');
                }
                else {
                    html.addClass('is-safari');
                }
            }
            if (ua.includes('msie ') || ua.includes('trident/')) {
                html.addClass('is-ie');
            }
            if (ua.includes('firefox')) {
                html.addClass('is-firefox');
            }
            if (ua.includes('android')) {
                html.addClass('is-android');
            }
            if (/(iphone|ipod|ipad)/.test(ua)) {
                html.addClass('is-ios');
            }
            if (ua.includes('edg/')) {
                html.removeClass('is-chrome');
                html.addClass('is-chromium');
            }
        };
        const detectTablet = () => {
            const viewport = document.getElementById('viewport');
            if (!viewport) {
                return;
            }
            const setViewport = () => {
                const portrait = window.matchMedia('(orientation: portrait)').matches;
                const screenWidth = window.screen.width;
                const screenHeight = window.screen.height;
                if (screenWidth < 375 && portrait) {
                    viewport.setAttribute('content', 'width=375');
                }
                else if ((screenWidth >= 768 && screenWidth <= 1199) ||
                    (screenWidth < 768 && screenHeight >= 768 && !portrait)) {
                    viewport.setAttribute('content', 'width=1300');
                    const ua = navigator.userAgent.toLowerCase();
                    const isMacTouch = /macintosh/i.test(ua) &&
                        !!navigator.maxTouchPoints &&
                        navigator.maxTouchPoints > 1;
                    const isIosTablet = /(iphone|ipod|ipad)/.test(ua) && !detectMobile();
                    const isAndroidTablet = ua.includes('android') && !detectMobile();
                    if (isMacTouch || isIosTablet || isAndroidTablet) {
                        $('html').addClass('is-tablet');
                    }
                }
                else {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no');
                    $('html').removeClass('is-tablet');
                }
            };
            setViewport();
            let resizeTimer;
            $(window).on('load resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = window.setTimeout(setViewport, 100);
            });
        };
        const smoothScroll = () => {
            const headerHeight = 0;
            const speed = 500;
            const triggerScroll = (context) => {
                var _a, _b;
                try {
                    let href;
                    let jContext;
                    if (typeof context === 'string') {
                        href = context;
                        jContext = $(context);
                    }
                    else {
                        jContext = $(context);
                        href = '#' + (((_a = jContext.attr('href')) === null || _a === void 0 ? void 0 : _a.split('#')[1]) || '');
                    }
                    if (href === '#') {
                        return true;
                    }
                    const target = $(href);
                    const hasScrollClass = jContext.hasClass('no-scroll');
                    if (!hasScrollClass && target.length) {
                        const position = (((_b = target.offset()) === null || _b === void 0 ? void 0 : _b.top) || 0) - headerHeight;
                        $('body, html').animate({ scrollTop: position }, speed, 'swing');
                        return false;
                    }
                }
                catch (e) {
                    // Fail silently for invalid selectors
                }
                return true;
            };
            setTimeout(() => {
                window.scroll(0, 0);
                $('html').removeClass('is-loading').addClass('is-visible');
            }, 1);
            if (window.location.hash) {
                window.scroll(0, 0);
                const ua = navigator.userAgent;
                const isIE = ua.includes('MSIE ') || ua.includes('Trident/');
                const timeout = isIE ? 0 : 500;
                setTimeout(() => {
                    triggerScroll(window.location.hash);
                }, timeout);
            }
            $('a[href*="#"]:not([href="#"])').on('click', (e) => {
                const anchor = e.target.closest('a');
                if (anchor) {
                    return triggerScroll(anchor);
                }
                return true;
            });
        };
        const hamburgerMenu = () => {
            const hamburger = $('.hambuger-common');
            const nav = $('.header-common__navigation');
            const overlay = $('.overlay-common');
            const body = $('body');
            const html = $('html');
            const toggleMenu = () => {
                const isOpening = !hamburger.hasClass('is-active');
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                hamburger.toggleClass('is-active');
                nav.toggleClass('is-active').toggleClass('is-open-menu');
                overlay.toggleClass('is-active');
                body.toggleClass('is-open-menu');
                html.toggleClass('is-open-menu');
                if (isOpening) {
                    const scrollY = $(window).scrollTop() || 0;
                    body.css({
                        position: 'fixed',
                        top: `-${scrollY}px`,
                        left: '0',
                        width: '100%',
                        paddingRight: `${scrollbarWidth}px`
                    });
                    body.data('scrollY', scrollY);
                }
                else {
                    const scrollY = body.data('scrollY') || 0;
                    body.css({
                        position: '',
                        top: '',
                        left: '',
                        width: '',
                        paddingRight: ''
                    });
                    window.scrollTo(0, scrollY);
                }
            };
            hamburger.on('click', (e) => {
                e.preventDefault();
                toggleMenu();
            });
            overlay.on('click', () => {
                if (hamburger.hasClass('is-active')) {
                    toggleMenu();
                }
            });
        };
        const loadWebFonts = () => {
            const script = document.createElement('script');
            script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
            script.async = true;
            script.onload = () => {
                if ('WebFont' in window) {
                    window.WebFont.load({
                        google: {
                            families: ['Roboto:400,500,700']
                        }
                    });
                }
            };
            document.head.appendChild(script);
        };
        $(() => {
            detectBrowsers();
            detectTablet();
            smoothScroll();
            hamburgerMenu();
            loadWebFonts();
        });
    })();

})();
