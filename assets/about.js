// Fade-in section observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-section').forEach(section => {
  observer.observe(section);
});

// FAQ accordion
document.querySelectorAll('.faq-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const icon = btn.querySelector('span');

    answer.classList.toggle('open');
    icon.textContent = answer.classList.contains('open') ? '➖' : '➕';
  });
});

// Back to top button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Sidebar section highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.sidebar-link');

const highlightObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const link = document.querySelector(`.sidebar-link[href="#${id}"]`);

    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => highlightObserver.observe(section));

// Pawprint divider animation
document.querySelectorAll('.paw-divider').forEach(div => {
  observer.observe(div);
});
