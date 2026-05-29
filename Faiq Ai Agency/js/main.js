/**
 * Faiq AI Agency - Core Client-Side Logic
 */

// Immediate Theme Initializer
(function() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        // Apply to body immediately if available (prevents layout flashes)
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('light-theme');
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    initTransitions();
    initMobileNav();
    initCanvasBackground();
    init3DTilt();
    initParallax();
    initThemeSelector();
    init3DScene();
    initChatbotWidget();
});

/* ==========================================================================
   1. SEAMLESS PAGE TRANSITION OVERLAY
   ========================================================================== */
function initTransitions() {
    const overlay = document.querySelector('.transition-overlay');
    if (!overlay) return;

    // Fade out the overlay once the page is fully loaded
    window.addEventListener('pageshow', () => {
        overlay.classList.add('fade-out');
        overlay.classList.remove('fade-in');
    });

    // Intercept clicks on links for smooth transitions
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        // Check if the link is a local site page and not a hash link or external target
        if (
            href &&
            !href.startsWith('#') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            (!target || target === '_self') &&
            (href.endsWith('.html') || !href.includes(':'))
        ) {
            e.preventDefault();
            overlay.classList.remove('fade-out');
            overlay.classList.add('fade-in');

            // Navigate to the target page after the overlay animation completes
            setTimeout(() => {
                window.location.href = href;
            }, 500); // Matches the 0.5s CSS transition duration
        }
    });
}

/* ==========================================================================
   2. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.header-nav');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile nav when clicking a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // Scroll header styling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Binary Stream Configuration
    const fontSize = 14;
    let columnsCount = Math.floor(width / 24);
    const streams = [];

    class BinaryStream {
        constructor(x) {
            this.x = x;
            this.y = Math.random() * -height; // Random offset above screen
            this.speed = Math.random() * 1.5 + 0.8; // Smooth slow crawl
            this.chars = [];
            this.maxLength = Math.floor(Math.random() * 20) + 12;
            this.color = Math.random() > 0.5 ? 'var(--color-cyan)' : 'var(--color-violet)';
            this.opacity = Math.random() * 0.18 + 0.05; // Keep it clean and subtle
        }

        update() {
            this.y += this.speed;
            if (this.y > height + 200) {
                this.y = Math.random() * -150 - 50;
                this.speed = Math.random() * 1.5 + 0.8;
                this.maxLength = Math.floor(Math.random() * 20) + 12;
            }

            // Generate characters occasionally
            if (Math.random() < 0.18 || this.chars.length === 0) {
                this.chars.push({
                    value: Math.random() > 0.5 ? '1' : '0',
                    y: this.y
                });
            }

            // Evict old elements to maintain length
            if (this.chars.length > this.maxLength) {
                this.chars.shift();
            }

            // Position characters relative to head
            this.chars.forEach((char, idx) => {
                char.y = this.y - (this.chars.length - idx) * fontSize;
            });
        }

        draw() {
            ctx.font = `600 ${fontSize}px var(--font-heading)`;
            
            this.chars.forEach((char, idx) => {
                if (char.y < -20 || char.y > height + 20) return;

                const isHead = idx === this.chars.length - 1;
                let alpha = this.opacity;
                if (isHead) alpha = Math.min(1.0, alpha * 2.8);

                const isLight = document.body.classList.contains('light-theme');
                if (isLight) {
                    ctx.fillStyle = isHead 
                        ? 'rgba(79, 172, 254, 0.4)' 
                        : `rgba(148, 163, 184, ${alpha * 0.45})`;
                } else {
                    if (this.color === 'var(--color-cyan)') {
                        ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
                    } else {
                        ctx.fillStyle = `rgba(79, 172, 254, ${alpha})`;
                    }
                }

                ctx.fillText(char.value, this.x, char.y);
            });
        }
    }

    function initStreams() {
        streams.length = 0;
        columnsCount = Math.floor(width / 24);
        for (let i = 0; i < columnsCount; i++) {
            streams.push(new BinaryStream(i * 24));
        }
    }

    initStreams();

    // Handle Resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initStreams();
    });

    // Render loop
    function animate() {
        const isLight = document.body.classList.contains('light-theme');
        // Clear screen with a slight trace for trailing graphics
        ctx.fillStyle = isLight ? 'rgba(248, 250, 252, 0.22)' : 'rgba(7, 10, 19, 0.22)';
        ctx.fillRect(0, 0, width, height);

        streams.forEach((stream) => {
            stream.update();
            stream.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   4. INTERACTIVE 3D TILT EFFECT WITH GLARE
   ========================================================================== */
function init3DTilt() {
    const cards = document.querySelectorAll('.glass-card, .tilt-target');

    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse x position relative to card
            const y = e.clientY - rect.top;  // Mouse y position relative to card

            const midX = rect.width / 2;
            const midY = rect.height / 2;

            // Rotation angle limits (max 8 degrees tilt)
            const rotateX = -((y - midY) / midY) * 8;
            const rotateY = ((x - midX) / midX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Glare effect positioning coordinates
            const percentageX = (x / rect.width) * 100;
            const percentageY = (y / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${percentageX}%`);
            card.style.setProperty('--mouse-y', `${percentageY}%`);
        });

        card.addEventListener('mouseleave', () => {
            // Restore original state gently
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.08s ease';
        });
    });
}

/* ==========================================================================
   5. PARALLAX SCROLLING EFFECT
   ========================================================================== */
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-bg');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        parallaxElements.forEach((el) => {
            // Read target speed coefficient (defaults to 0.15)
            const speed = parseFloat(el.getAttribute('data-speed')) || 0.15;
            const yOffset = scrolled * speed;
            el.style.transform = `translateY(${yOffset}px)`;
        });
    });
}

/* ==========================================================================
   6. LIGHT / DARK MODE THEME SELECTOR
   ========================================================================== */
function initThemeSelector() {
    // Check local storage for theme, or default to dark
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // Attach event listeners to all theme toggle buttons on page
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            
            // Sync document element class as well
            if (isLight) {
                document.documentElement.classList.add('light-theme');
            } else {
                document.documentElement.classList.remove('light-theme');
            }
        });
    });
}

/* ==========================================================================
   7. INTERACTIVE 3D WEBGL AI CORE (Three.js Particle Sphere)
   ========================================================================== */
function init3DScene() {
    const container = document.getElementById('hero-3d-container');
    if (!container) return;

    // Verify THREE is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded.');
        return;
    }

    // Set up Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Globe Group
    const globeGroup = new THREE.Group();

    // 1. Earth Core Sphere
    const earthGeom = new THREE.SphereGeometry(1.1, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({ 
        color: 0x0A2540, 
        metalness: 0.85, 
        roughness: 0.15,
        transparent: true,
        opacity: 0.85
    });
    const earth = new THREE.Mesh(earthGeom, earthMat);
    globeGroup.add(earth);

    // 2. Earth Grid Wireframe Overlay (Tech scanning effect)
    const gridGeom = new THREE.SphereGeometry(1.13, 24, 24);
    const gridMat = new THREE.MeshBasicMaterial({ 
        color: 0x00F2FE, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.25 
    });
    const gridOverlay = new THREE.Mesh(gridGeom, gridMat);
    globeGroup.add(gridOverlay);

    // 3. Glowing Atmosphere Outer Shell
    const atmoGeom = new THREE.SphereGeometry(1.2, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x00F2FE,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmoGeom, atmoMat);
    globeGroup.add(atmosphere);

    // 4. Primary Orbital Ring (Cyan)
    const ring1Geom = new THREE.RingGeometry(1.45, 1.55, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ 
        color: 0x00F2FE, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.5 
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 2 + 0.3; // Tilt
    globeGroup.add(ring1);

    // 5. Secondary Orbital Ring (Violet)
    const ring2Geom = new THREE.RingGeometry(1.7, 1.76, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ 
        color: 0x4FACFE, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.35 
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = Math.PI / 2 - 0.4; // Opposite tilt
    globeGroup.add(ring2);

    // 6. Orbital Satellite Particles (Star fields orbiting earth)
    const particleCount = 180;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorCyan = new THREE.Color(0x00F2FE);
    const colorViolet = new THREE.Color(0x4FACFE);

    for (let i = 0; i < particleCount; i++) {
        // Orbit math: spread particles in an orbiting disk
        const radius = 1.3 + Math.random() * 0.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * 0.4; // spread near the disk plane

        positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

        // Mix colors
        const mixedColor = colorCyan.clone().lerp(colorViolet, Math.random());
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const orbitalParticles = new THREE.Points(particleGeom, particleMat);
    orbitalParticles.rotation.x = 0.2; // slight tilt
    globeGroup.add(orbitalParticles);

    // 7. Internal lighting
    const coreLight = new THREE.PointLight(0x00F2FE, 4, 6);
    globeGroup.add(coreLight);

    const coreLight2 = new THREE.PointLight(0x4FACFE, 3, 6);
    coreLight2.position.set(-1, -1, -1);
    globeGroup.add(coreLight2);

    scene.add(globeGroup);

    // Mouse Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    window.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        
        if (relX >= -100 && relX <= container.clientWidth + 100 && relY >= -100 && relY <= container.clientHeight + 100) {
            mouse.targetX = (relX / container.clientWidth) * 2 - 1;
            mouse.targetY = -(relY / container.clientHeight) * 2 + 1;
        }
    });

    // Dynamic Camera Distance adjustment based on aspect ratio (prevents clipping on mobile screen)
    function adjustCameraDistance() {
        const aspect = container.clientWidth / container.clientHeight;
        if (aspect < 1.0) {
            // Mobile portrait: scale distance back to fit entire globe system
            camera.position.z = Math.min(7.0, (4.8 / aspect) * 0.82);
        } else {
            camera.position.z = 4.8;
        }
    }

    // Resize Handler
    window.addEventListener('resize', () => {
        if (!container.clientWidth || !container.clientHeight) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        adjustCameraDistance();
    });

    // Initial scale call
    adjustCameraDistance();

    // Frame animations loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);

        time += 0.005;

        // Interactive mouse lag/easing
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Floating breath effect
        globeGroup.position.y = Math.sin(time) * 0.08;

        // Interactive rotation response to cursor coordinates
        globeGroup.rotation.x = mouse.y * 0.25;
        globeGroup.rotation.y = time * 0.5 + mouse.x * 0.25;

        // Orbit rotations
        gridOverlay.rotation.y -= 0.002;
        ring1.rotation.z -= 0.005;
        ring2.rotation.z += 0.008;
        orbitalParticles.rotation.y += 0.002;

        renderer.render(scene, camera);
    }

    animate();
}

/* ==========================================================================
   8. AI ASSISTANT CHATBOT WIDGET
   ========================================================================== */
function initChatbotWidget() {
    const chatbot = document.getElementById('chatbot');
    if (!chatbot) return;

    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chatbot-window');
    const messagesContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chips = document.querySelectorAll('.chat-chip');

    // Expand / Collapse window
    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Chip selections
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.textContent;
            sendUserMessage(query);
            respondToQuery(query);
        });
    });

    // Input submissions
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (query === '') return;

        sendUserMessage(query);
        chatInput.value = '';
        respondToQuery(query);
    });

    function sendUserMessage(text) {
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-msg user';
        msgEl.textContent = text;
        messagesContainer.appendChild(msgEl);
        scrollToBottom();
    }

    function sendBotMessageWithTyping(text, delay = 1200) {
        // Append typing spinner dots
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-msg bot typing';
        typingEl.innerHTML = `
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        messagesContainer.appendChild(typingEl);
        scrollToBottom();

        setTimeout(() => {
            typingEl.classList.remove('typing');
            typingEl.innerHTML = '';
            typingEl.innerHTML = text; // Allow HTML rendering for mailto links
            scrollToBottom();
        }, delay);
    }

    function respondToQuery(query) {
        const lower = query.toLowerCase();
        
        if (lower.includes('service') || lower.includes('what do you do') || lower.includes('capabilities')) {
            sendBotMessageWithTyping("Faiq AI Agency delivers Web Design & Dev, SEO, Graphic Design, GMB maps optimization, Social Media Marketing, and Cinematic Video Editing. All solutions utilize proprietary AI pipelines to accelerate conversion.");
        } else if (lower.includes('audit') || lower.includes('website audit') || lower.includes('free audit')) {
            sendBotMessageWithTyping("To request a free Web & SEO Audit, go to our Contact Page or use the booking calendar. We will audit your page speed, mobile breakpoints, and map visibility. You can also email us directly at <a href='mailto:faiqfiaz@gmail.com' style='color: var(--color-cyan); font-weight: bold;'>faiqfiaz@gmail.com</a>.");
        } else if (lower.includes('call') || lower.includes('book') || lower.includes('schedule') || lower.includes('contact')) {
            sendBotMessageWithTyping("You can schedule a 15-minute Strategy discovery call directly using our Calendly scheduler on the Contact Page, or reach us at <a href='mailto:faiqfiaz@gmail.com' style='color: var(--color-cyan); font-weight: bold;'>faiqfiaz@gmail.com</a>.");
        } else if (lower.includes('who is') || lower.includes('faiq') || lower.includes('agency')) {
            sendBotMessageWithTyping("We are Faiq AI Agency—a high-end developer and design engine. We merge premium creative design with artificial intelligence to scale business authority.");
        } else {
            // General query fallback response
            sendBotMessageWithTyping("Bypass signal established. Thank you for your inquiry. A strategic lead will assess this message and respond directly via email shortly! You can also email us directly at <a href='mailto:faiqfiaz@gmail.com' style='color: var(--color-cyan); font-weight: bold;'>faiqfiaz@gmail.com</a>.");
        }
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
