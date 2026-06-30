function openMenuOnly() {
    document.getElementById('menu').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.classList.add('menu-open');
  }
  
  function closeMenuOnly() {
    document.getElementById('menu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  
  function closeMenuFromOverlay() {
    return false;
  }
  
  let counted1 = false;
  let counted2 = false;
  let counted3 = false;

  function startCounter(element, targetId) {
    if (targetId === 'statBox1' && counted1) return;
    if (targetId === 'statBox2' && counted2) return;
    if (targetId === 'statBox3' && counted3) return;
    
    if (targetId === 'statBox1') counted1 = true;
    if (targetId === 'statBox2') counted2 = true;
    if (targetId === 'statBox3') counted3 = true;
    
    const target = +element.getAttribute('data-target');
    
    const updateCount = () => {
      const count = +element.innerText;
      const increment = target / 40;
      
      if (count < target) {
        element.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 15);
      } else {
        element.innerText = target + '+';
      }
    };
    updateCount();
  }

  const box1Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumber = entry.target.querySelector('.stat-number[data-target]');
        if (statNumber) {
          startCounter(statNumber, 'statBox1');
        }
      }
    });
  }, { threshold: 0.3 });
  
  const box2Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumber = entry.target.querySelector('.stat-number[data-target]');
        if (statNumber) {
          startCounter(statNumber, 'statBox2');
        }
      }
    });
  }, { threshold: 0.3 });
  
  const box3Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumber = entry.target.querySelector('.stat-number[data-target]');
        if (statNumber) {
          startCounter(statNumber, 'statBox3');
        }
      }
    });
  }, { threshold: 0.3 });

  const statBox1 = document.getElementById('statBox1');
  const statBox2 = document.getElementById('statBox2');
  const statBox3 = document.getElementById('statBox3');
  
  if (statBox1) box1Observer.observe(statBox1);
  if (statBox2) box2Observer.observe(statBox2);
  if (statBox3) box3Observer.observe(statBox3);

  const showObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.box, .community, .how-section, .text-section, .founder').forEach(el => {
    if (el.id !== 'community') {
      showObserver.observe(el);
    }
  });
  
  const communitySection = document.getElementById('community');
  if (communitySection) {
    showObserver.observe(communitySection);
  }