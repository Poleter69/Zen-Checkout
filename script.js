// Format currency in Indian Style (lakhs/crores)
function formatCurrency(amount) {
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹${crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2)} Crores`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// ----------------------------------------------------
// CATALOG PAGE (index.html) LOGIC
// ----------------------------------------------------
function filterCatalog(category) {
  // Update active tab button style
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // Find correct button based on click parameter
  const clickedBtn = Array.from(buttons).find(btn => 
    btn.getAttribute('onclick').includes(`'${category}'`)
  );
  if (clickedBtn) clickedBtn.classList.add('active');

  // Filter cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'flex';
      card.style.animation = 'fadeIn 0.4s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });
}

function checkoutMassage(name, price) {
  // Route to payment page with query params
  window.location.href = `pay.html?item=${encodeURIComponent(name)}&price=${price}`;
}

// ----------------------------------------------------
// PAYMENT PAGE (pay.html) LOGIC
// ----------------------------------------------------
let activeMethod = 'card';

function switchMethod(method) {
  activeMethod = method;
  const cardBtn = document.getElementById('method-card');
  const upiBtn = document.getElementById('method-upi');
  const cardFields = document.getElementById('card-fields');
  const upiFields = document.getElementById('upi-fields');
  const creditCard = document.getElementById('credit-card');

  if (method === 'card') {
    cardBtn.classList.add('active');
    upiBtn.classList.remove('active');
    cardFields.style.display = 'block';
    upiFields.classList.remove('active');
    if (creditCard) creditCard.style.opacity = '1';
  } else {
    upiBtn.classList.add('active');
    cardBtn.classList.remove('active');
    cardFields.style.display = 'none';
    upiFields.classList.add('active');
    if (creditCard) creditCard.style.opacity = '0.4';
  }
}

// Form dynamic visual updates on holographic card
function updateCardNumber(val) {
  // Format number as 4-digit chunks
  let cleanVal = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let matches = cleanVal.match(/\d{4,16}/g);
  let match = (matches && matches[0]) || '';
  let parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length > 0) {
    document.getElementById('card-number').value = parts.join(' ');
  }

  const cardDisplay = document.getElementById('card-display-number');
  cardDisplay.innerText = parts.join(' ') || '•••• •••• •••• ••••';
}

function updateCardName(val) {
  const cardDisplay = document.getElementById('card-display-name');
  cardDisplay.innerText = val.toUpperCase() || 'CHAD RIZZLER';
}

function updateCardExpiry(val) {
  let cleanVal = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (cleanVal.length >= 2) {
    const month = cleanVal.substring(0, 2);
    const year = cleanVal.substring(2, 4);
    document.getElementById('card-expiry').value = `${month}/${year}`;
    document.getElementById('card-display-expiry').innerText = `${month}/${year}`;
  } else {
    document.getElementById('card-display-expiry').innerText = val || '09/99';
  }
}

// Interactive holographic tilt effect
function initHoloCard() {
  const container = document.querySelector('.holo-card-container');
  const card = document.getElementById('credit-card');
  if (!container || !card) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    // Calculate rotation percentage (-15deg to 15deg)
    const rotateY = -((x / rect.width) - 0.5) * 30;
    const rotateX = ((y / rect.height) - 0.5) * 30;
    
    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  });

  container.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

// Web Audio API custom synth arpeggio for payment approval chime
function playSuccessArpeggio() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    // Classic ascending C major arpeggio
    playTone(523.25, now, 0.3);        // C5
    playTone(659.25, now + 0.1, 0.3);  // E5
    playTone(783.99, now + 0.2, 0.4);  // G5
    playTone(1046.50, now + 0.3, 0.5); // C6
  } catch (e) {
    console.log('Audio Context error: ', e);
  }
}

// Swipe-to-Pay logic
function initSwipeSlider() {
  const slider = document.getElementById('swipe-slider');
  const container = document.getElementById('swipe-container');
  const fillBg = document.getElementById('swipe-bg');
  const text = document.getElementById('swipe-text');
  
  if (!slider || !container) return;

  let isDragging = false;
  let startX = 0;
  const maxDrag = container.clientWidth - slider.clientWidth - 10; // offset bounds

  const onDragStart = (e) => {
    isDragging = true;
    startX = (e.type === 'touchstart') ? e.touches[0].clientX : e.clientX;
    slider.style.transition = 'none';
    fillBg.style.transition = 'none';
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const currentX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
    let deltaX = currentX - startX;
    
    // Boundary checks
    if (deltaX < 0) deltaX = 0;
    if (deltaX > maxDrag) deltaX = maxDrag;

    slider.style.transform = `translateX(${deltaX}px)`;
    fillBg.style.width = `${deltaX + (slider.clientWidth / 2)}px`;
    
    // Fade out text as we slide
    const progress = deltaX / maxDrag;
    text.style.opacity = 1 - progress;
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    
    const finalX = parseFloat(slider.style.transform.replace(/[^0-9.-]/g, '')) || 0;
    
    if (finalX >= maxDrag * 0.9) {
      // Locked in! Successful swipe trigger
      slider.style.transform = `translateX(${maxDrag}px)`;
      fillBg.style.width = '100%';
      text.innerText = "PROCESSING TRANSACTION...";
      text.style.opacity = '1';
      
      triggerPaymentFlow();
    } else {
      // Snap back to start state
      slider.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      fillBg.style.transition = 'width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      slider.style.transform = 'translateX(0px)';
      fillBg.style.width = '0px';
      text.style.opacity = '1';
    }
  };

  // Attach mouse listeners
  slider.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  // Attach touch listeners
  slider.addEventListener('touchstart', onDragStart);
  window.addEventListener('touchmove', onDragMove);
  window.addEventListener('touchend', onDragEnd);
}

function triggerPaymentFlow() {
  const container = document.getElementById('swipe-container');
  // Disable slider interface
  container.style.pointerEvents = 'none';

  // Play audio arpeggio chime immediately
  playSuccessArpeggio();

  // Change swipe text to processing state
  const text = document.getElementById('swipe-text');
  text.innerText = "⚡ SECURING TRANSACTION...";
  text.style.opacity = '1';

  // Redirect instantly after a short premium transition delay
  setTimeout(() => {
    window.location.href = 'https://discord.com/users/1238014084142862366';
  }, 1200);
}

// ----------------------------------------------------
// DOCUMENT INIT & ENTRY POINT
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // If we are on checkout page pay.html
  if (document.getElementById('checkout-item-name')) {
    const urlParams = new URLSearchParams(window.location.search);
    const itemName = urlParams.get('item') || 'Peacock Massage';
    const itemPrice = parseInt(urlParams.get('price')) || 999999;
    
    // Set dynamic elements on pay.html
    document.getElementById('checkout-item-name').innerText = itemName;
    document.getElementById('checkout-item-price').innerText = formatCurrency(itemPrice);
    
    // Update Holographic credit details if special packages
    if (itemName.includes('Peacock') || itemName.includes('Mod One') || itemName.includes('Modi')) {
      document.getElementById('card-display-name').innerText = 'VIP ASCENDED CHAD';
      document.getElementById('card-display-number').innerText = '7777 8888 9999 0000';
    }

    initHoloCard();
    initSwipeSlider();
  }
});
