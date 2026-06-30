window.addEventListener("load",function(){
let loader=document.getElementById("loader");
loader.style.opacity="0";
setTimeout(function(){loader.style.display="none"},500);
});

function openMenuOnly(){
  document.getElementById('menu').classList.add('active');
  document.getElementById('overlay').classList.add('active');
  document.body.classList.add('menu-open');
  document.body.style.top = `-${window.scrollY}px`;
}

function closeMenuOnly(){
  document.getElementById('menu').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  document.body.classList.remove('menu-open');
  const scrollY = document.body.style.top;
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

document.getElementById('openMenuBtn').addEventListener('click', openMenuOnly);
document.getElementById('menu').querySelector('.close-btn').addEventListener('click', closeMenuOnly);
const names = ["Rahul Sharma","Priya Patel","Amit Kumar","Sneha Reddy","Vikram Singh","Neha Gupta","Rajesh Mehta","Arjun Yadav"];
const reviews = [
  "Best decision of my life! Made ₹{amount} in just {days} days.",
  "Finally found something that actually works. ₹{amount} in {days} days!",
  "I was skeptical at first, but earned ₹{amount} in {days} days. Grateful!",
  "My one-day earning was ₹{amount}. This is real, guys!",
  "Started {days} days ago, already made ₹{amount}. Thank you Digital Earner!",
  "₹{amount} in {days} days – this platform changed my life."
];

function getDailyTestimonials() {
  const today = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = ((hash << 5) - hash) + today.charCodeAt(i), hash |= 0;
  const seed = Math.abs(hash);
  let testimonials = [];
  for (let i = 0; i < 4; i++) {
    const nameIndex = (seed + i * 3) % names.length;
    const days = [1,2,3][(seed + i) % 3];
    const dailyEarning = 1000 + ((seed + i * 7) % 500);
    const total = dailyEarning * days;
    const reviewIndex = (seed + i * 5) % reviews.length;
    let text = reviews[reviewIndex].replace('{days}', days).replace('{amount}', total.toLocaleString('en-IN'));
    testimonials.push({
      text: text,
      name: names[nameIndex],
      earnings: `₹${total.toLocaleString('en-IN')}+`,
      location: ["Delhi","Mumbai","Bangalore","Hyderabad"][(seed + i) % 4]
    });
  }
  return testimonials;
}

function renderTestimonials() {
  const container = document.getElementById('testimonialContainer');
  if (!container) return;
  const testimonials = getDailyTestimonials();
  let html = '';
  testimonials.forEach(t => {
    html += `<div class="testimonial-card"><div class="testimonial-text">"${t.text}"</div><div class="testimonial-author"><span class="author-name">${t.name}</span><span class="author-earnings">💰 Earned: ${t.earnings}</span><span class="author-location">📍 ${t.location}</span></div></div>`;
  });
  container.innerHTML = html;
}
renderTestimonials();
setInterval(renderTestimonials, 86400000);

let observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("show"); else entry.target.classList.remove("show"); });
}, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".box, .card").forEach(el => observer.observe(el));

const supabaseUrl = "https://pxxbwzfxhapbzpznabbe.supabase.co";
const supabaseKey = "EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGJ3emZ4aGFwYnpwem5hYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDE4MDAsImV4cCI6MjA5NDYxNzgwMH0.v4QD86JrDeIBvBnRfKaq2xWy1_9IYmcLp61UmtoZdE4";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById("getStartedBtn").addEventListener("click", async function(e){
  e.preventDefault();
  const { data:{ session } } = await supabaseClient.auth.getSession();
    if(session){
    window.location.href = "html/dashboard.html"; 
  }else{
    window.location.href = "html/index47.html";
  }
});