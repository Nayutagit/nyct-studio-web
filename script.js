document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Header Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Fade-in Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });

    // 3. Inline Video Playback
    window.playVideo = (element, videoId) => {
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.style.width = '100%';
        iframe.style.height = '100%'; // Will fill the aspect-ratio container
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        // Find the container (the relative div inside video-item)
        const container = element.querySelector('div[style*="position: relative"]');

        if (container) {
            container.innerHTML = ''; // Remove image and play button
            container.appendChild(iframe);
            container.style.paddingBottom = '56.25%'; // Ensure 16:9 aspect ratio
        }
    };

    // (Modal logic removed as requested for inline playback)

    // Modal listeners removed

    // 4. Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
            });
        });
    }
    // 6. Background Parallax (Sparks)
    const sparks = document.querySelectorAll('.spark');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        sparks.forEach((spark, index) => {
            const speed = (index + 1) * 0.2; // Different speeds
            spark.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    // 7. Contact Form AJAX Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const status = document.getElementById('form-status');
            const data = new FormData(e.target);

            status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
            status.style.color = '#ccc';

            fetch(e.target.action, {
                method: contactForm.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    status.innerHTML = '<i class="fas fa-check-circle"></i> 送信完了しました！<br>お問い合わせありがとうございます。';
                    status.style.color = 'var(--primary-neon)';
                    contactForm.reset();

                    // Google Ads Conversion Event
                    if (typeof gtag === 'function') {
                        gtag('event', 'conversion', {
                            'send_to': 'AW-17795566845/iAwCCKWK_tAbEP2Zy6VC',
                            'value': 1.0,
                            'currency': 'JPY'
                        });
                    }
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                        } else {
                            status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 送信に失敗しました。<br>時間をおいて再度お試しいただくか、<a href="https://instagram.com/udatsuageteko" target="_blank" style="color: inherit; text-decoration: underline;">Udatsu公式Instagram</a>のDMからご連絡ください。';
                        }
                        status.style.color = '#ff4d4d';
                    })
                }
            }).catch(error => {
                status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> エラーが発生しました。<br>送信サーバーに接続できませんでした。';
                status.style.color = '#ff4d4d';
            });
        });
    }
    // 8. Opening Animation
    function initOpeningAnimation() {
        const container = document.getElementById('opening-animation');
        if (!container) return;

        const curtain = container.querySelector('.black-curtain');
        const arrowCount = 50; // Number of arrows
        const width = window.innerWidth;

        // Spawn Arrows
        for (let i = 0; i < arrowCount; i++) {
            const arrow = document.createElement('i');
            arrow.classList.add('fas', 'fa-arrow-up', 'opening-arrow');

            // Random Position & Timing
            const leftPos = Math.random() * width;
            const delay = Math.random() * 0.5; // Random start delay
            const duration = 1 + Math.random() * 0.5; // Random speed
            const size = 1 + Math.random() * 1.5; // Random size from 1rem to 2.5rem

            arrow.style.left = `${leftPos}px`;
            arrow.style.fontSize = `${size}rem`;
            arrow.style.animation = `flyUp ${duration}s ease-in forwards ${delay}s`;

            container.appendChild(arrow);
        }

        // Timing Sequence
        // 1. Start Curtain Rise (following arrows)
        setTimeout(() => {
            curtain.style.height = '100%';
        }, 500); // Start rising shortly after arrows start

        // 2. Reveal Site (Slide Up)
        setTimeout(() => {
            container.classList.add('slide-up-reveal');
        }, 2200); // 1.5s (curtain) + buffer

        // 3. Cleanup
        setTimeout(() => {
            container.remove();
        }, 3200); // After slide up animation finishes
    }

    // Call Animation
    initOpeningAnimation();

});
