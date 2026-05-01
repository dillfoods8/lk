document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Navbar scroll effect (Optimized)
    const navbar = document.getElementById('navbar');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Scroll Reveal Animation (Optimized with IntersectionObserver)
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        reveals.forEach(reveal => revealObserver.observe(reveal));
    } else {
        reveals.forEach(reveal => reveal.classList.add('active'));
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active');

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- CART AND ORDERING SYSTEM ---
    let cart = [];
    const cartFloatingBtn = document.getElementById('cart-floating-btn');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const sendOrderBtn = document.getElementById('send-order-btn');

    // Inject Add to Cart buttons
    document.querySelectorAll('.menu-list li').forEach(li => {
        const nameEl = li.querySelector('.item-name');
        const priceEl = li.querySelector('.item-price');
        if(!nameEl || !priceEl) return;

        const name = nameEl.innerText.trim();
        const priceText = priceEl.innerText.trim();
        const price = parseInt(priceText.replace(/\D/g, ''));

        const actionDiv = document.createElement('div');
        actionDiv.className = 'price-action';
        
        const addBtn = document.createElement('button');
        addBtn.className = 'add-to-cart-btn';
        addBtn.innerHTML = '+';
        addBtn.title = 'Add to Order';
        addBtn.onclick = () => addToCart(name, price);

        li.appendChild(actionDiv);
        actionDiv.appendChild(priceEl);
        actionDiv.appendChild(addBtn);
    });

    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ name, price, qty: 1 });
        }
        updateCartUI();
        
        if(cartFloatingBtn) {
            cartFloatingBtn.classList.add('pop');
            setTimeout(() => cartFloatingBtn.classList.remove('pop'), 300);
        }
    }

    function removeFromCart(name) {
        cart = cart.filter(item => item.name !== name);
        updateCartUI();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartCount) cartCount.innerText = totalItems;
        
        if (totalItems > 0) {
            cartFloatingBtn.classList.add('visible');
        } else {
            cartFloatingBtn.classList.remove('visible');
            if(cartModal) cartModal.classList.remove('active');
        }

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            let totalCost = 0;
            cart.forEach(item => {
                totalCost += item.price * item.qty;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name} <span style="color:var(--color-text-muted)">x${item.qty}</span></span>
                        <span class="cart-item-price">Rs.${item.price * item.qty}</span>
                    </div>
                    <button class="remove-item" onclick="window.removeFromCart('${item.name}')">&times;</button>
                `;
                cartItemsContainer.appendChild(div);
            });
            if (cartTotalEl) cartTotalEl.innerText = `Rs.${totalCost}`;
        }
    }

    window.removeFromCart = removeFromCart;

    if (cartFloatingBtn) {
        cartFloatingBtn.addEventListener('click', () => cartModal.classList.add('active'));
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));
    }

    if (sendOrderBtn) {
        sendOrderBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            const custName = document.getElementById('customer-name').value.trim() || 'Customer';
            const orderType = document.getElementById('order-type').value;
            const specialNotes = document.getElementById('special-notes').value.trim();

            let message = `Hello! I would like to place a *${orderType}* order.%0A`;
            message += `*Name:* ${custName}%0A%0A`;
            message += `*Order Details:*%0A`;
            
            let total = 0;
            cart.forEach(item => {
                message += `- ${item.name} x${item.qty} (Rs.${item.price * item.qty})%0A`;
                total += item.price * item.qty;
            });
            message += `%0A*Total: Rs.${total}*`;

            if (specialNotes) {
                message += `%0A%0A*Notes/Address:*%0A${specialNotes}`;
            }
            
            const whatsappNumber = "94781863777";
            const url = `https://wa.me/${whatsappNumber}?text=${message}`;
            window.open(url, '_blank');
            
            // clear inputs and cart
            cart = [];
            updateCartUI();
            cartModal.classList.remove('active');
            document.getElementById('customer-name').value = '';
            document.getElementById('special-notes').value = '';
        });
    }

    // --- LANGUAGE TOGGLE ---
    const langToggleBtn = document.getElementById('lang-toggle');
    let currentLang = 'en';

    const translations = {
        ".nav-links a[href='#home']": { en: "Home", si: "මුල් පිටුව" },
        ".nav-links a[href='#menu']": { en: "Our Menu", si: "මෙනුව" },
        ".nav-links a[href='#gallery']": { en: "Gallery", si: "ඡායාරූප" },
        ".nav-links a[href='#contact']": { en: "Contact", si: "සම්බන්ධ වන්න" },
        ".subtitle": { en: "Experience Culinary Excellence &bull; Delivery Available", si: "සුපිරි ආහාර අත්දැකීමක් &bull; බෙදාහැරීම ඇත" },
        ".hero h1": { en: "A Taste of <br> Pure Luxury", si: "සුපිරි <br> රසවත් ආහාර" },
        ".hero p": { en: "Finest ingredients, masterfully crafted dishes, and unforgettable spices.", si: "විශිෂ්ට අමුද්‍රව්‍ය සහ අමතක නොවන රසයන්ගෙන් යුත් ආහාර." },
        ".hero-buttons .btn-primary": { en: "Explore Menu", si: "මෙනුව බලන්න" },
        ".hero-buttons .btn-secondary": { en: "Customize Orders", si: "ඇණවුම් සකස් කරන්න" },
        ".section-header h2": { en: "Our Delicious Menu", si: "අපගේ රසවත් මෙනුව" },
        ".section-header p": { en: "Curated selections for the refined palate", si: "ඔබ වෙනුවෙන්ම සැකසූ ආහාර" },
        ".menu-category:nth-child(1) h3": { en: "Savory Bites", si: "කෙටි කෑම" },
        ".menu-category:nth-child(2) h3": { en: "Sweets & Desserts", si: "රසකැවිලි සහ කේක්" },
        ".menu-category:nth-child(3) h3": { en: "Premium Cakes (1kg)", si: "විශේෂ කේක් (1kg)" },
        ".menu-category:nth-child(4) h3": { en: "Beverages", si: "බීම වර්ග" },
        ".menu-category:nth-child(5) h3": { en: "Traditional Specials", si: "සාම්ප්‍රදායික කෑම" },
        ".menu-category:nth-child(6) h3": { en: "Rice Specialties", si: "බත් වර්ග" },
        ".menu-category:nth-child(6) .rice-specials": { en: "Biriyani, Pot Biriyani, Yellow Rice, Ghee Rice, Fried Rice, Milk Rice, Rice and Curry.", si: "බිරියානි, කහ බත්, ගී රයිස්, ෆ්‍රයිඩ් රයිස්, කිරිබත්, බත් සහ කරි." },
        ".menu-category:nth-child(6) .rice-note": { en: "Available upon request. Please inquire for daily availability.", si: "ඇණවුම් මත පමණි. කරුණාකර විමසන්න." },
        ".menu-category:nth-child(7) h3": { en: "Customize Orders", si: "විශේෂ ඇණවුම්" },
        ".menu-category:nth-child(7) .rice-specials": { en: "Need a custom birthday cake or a special party menu? We craft personalized culinary experiences tailored exactly to your needs.", si: "උපන්දින කේක් හෝ විශේෂ සාද සඳහා මෙනුවක් අවශ්‍යද? ඔබගේ අවශ්‍යතාවයට අනුව අප එය සකස් කර දෙන්නෙමු." },
        ".menu-category:nth-child(7) .btn-primary": { en: "Discuss Custom Order", si: "කතා කරන්න" },
        "#gallery h2": { en: "Our Creations", si: "අපගේ නිර්මාණ" },
        "#gallery p": { en: "A glimpse into our culinary artistry", si: "අපගේ ආහාර කලාවේ අලංකාරය" },
        ".brand-info p": { en: "Elevating the art of dining.", si: "ආහාර ගැනීමේ කලාව ඉහළටම." },
        ".contact-info h4": { en: "Connect With Us", si: "අප හා සම්බන්ධ වන්න" },
        ".contact-info p:nth-child(4)": { en: "🛵 Delivery Available", si: "🛵 බෙදාහැරීම ඇත" },
        ".cart-header h3": { en: "Your Order", si: "ඔබගේ ඇණවුම" },
        ".cart-total-row span:first-child": { en: "Total:", si: "එකතුව:" },
        "#send-order-btn": { en: "Send Order via WhatsApp", si: "WhatsApp හරහා යවන්න" },
    };

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'si' : 'en';
            langToggleBtn.innerText = currentLang === 'en' ? 'සිංහල' : 'English';
            
            for (const selector in translations) {
                const el = document.querySelector(selector);
                if (el) {
                    el.innerHTML = translations[selector][currentLang];
                }
            }
            
            // Handle placeholders
            const nameInput = document.getElementById('customer-name');
            const notesInput = document.getElementById('special-notes');
            if (nameInput) nameInput.placeholder = currentLang === 'en' ? 'Your Name' : 'ඔබේ නම';
            if (notesInput) notesInput.placeholder = currentLang === 'en' ? 'Special Instructions or Delivery Address' : 'විශේෂ උපදෙස් හෝ ලිපිනය';
        });
    }
});
