document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

/* ---------- 3D background ---------- */
(function () {
  if (!window.THREE) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: $('#bg'), alpha: true, antialias: true }); } catch (e) { return; }
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  cam.position.z = 7;
  const cyan = 0x35d0f5, violet = 0x8b7bff;

  const hero = new THREE.Group();
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, 0.34, 160, 20),
    new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: 0.55 }));
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1),
    new THREE.MeshBasicMaterial({ color: violet, wireframe: true }));
  hero.add(knot, core);
  scene.add(hero);

  const geos = [new THREE.OctahedronGeometry(0.7), new THREE.BoxGeometry(1, 1, 1), new THREE.TetrahedronGeometry(0.8), new THREE.TorusGeometry(0.6, 0.18, 12, 28), new THREE.IcosahedronGeometry(0.7)];
  const floaters = geos.map((g, i) => {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: i % 2 ? violet : cyan, wireframe: true, transparent: true, opacity: 0.5 }));
    m.userData = { y: -3.2 - i * 3, side: i % 2 ? 1 : -1, s: 0.6 + Math.random() * 0.4 };
    scene.add(m); return m;
  });

  const N = innerWidth < 700 ? 500 : 1100, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 26; pos[i * 3 + 1] = -Math.random() * 30 + 4; pos[i * 3 + 2] = (Math.random() - .5) * 16 - 2; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9fdcff, size: 0.04, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(stars);

  let W, H, mx = 0, my = 0, tx = 0, ty = 0, prog = 0, sp = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
    const narrow = W < 820;
    hero.position.set(narrow ? 0 : 2.9, narrow ? 1.2 : 0, 0);
    hero.scale.setScalar(narrow ? 0.7 : 1);
    knot.material.opacity = narrow ? 0.3 : 0.55;
    floaters.forEach(f => f.position.set(f.userData.side * (narrow ? 2.4 : 4.6), f.userData.y, -1));
  }
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', e => { tx = e.clientX / W - .5; ty = e.clientY / H - .5; });
  addEventListener('scroll', () => { prog = scrollY / Math.max(1, document.documentElement.scrollHeight - H); }, { passive: true });

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const t = reduce ? 0 : clock.getElapsedTime();
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05; sp += (prog - sp) * 0.06;
    hero.rotation.y = t * 0.25 + mx * 1.2; hero.rotation.x = t * 0.15 + my * 0.8;
    core.rotation.y = -t * 0.6; core.rotation.x = t * 0.4;
    hero.position.y = (W < 820 ? 1.2 : 0) + Math.sin(t) * 0.12;
    floaters.forEach((f, i) => { f.rotation.x = t * 0.3 + i; f.rotation.y = t * 0.4 + i; f.position.y = f.userData.y + Math.sin(t + i) * 0.2; });
    stars.rotation.y = t * 0.01;
    cam.position.y = -sp * 14.5; cam.position.x = mx * 0.8; cam.lookAt(cam.position.x * 0.2, cam.position.y, 0);
    renderer.render(scene, cam);
  })();
})();

/* ---------- UI ---------- */
const btn = $('.menu-btn'), nav = $('#nav');
const setMenu = o => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); btn.firstElementChild.className = o ? 'fas fa-xmark' : 'fas fa-bars'; };
btn.onclick = () => setMenu(!nav.classList.contains('open'));
nav.onclick = e => { if (e.target.tagName === 'A') setMenu(false); };
addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

const links = $$('#nav a');
const spy = new IntersectionObserver(es => es.forEach(en => en.isIntersecting && links.forEach(a => a.classList.toggle('active', a.hash === '#' + en.target.id))), { rootMargin: '-45% 0px -50% 0px' });
$$('main section').forEach(s => spy.observe(s));
addEventListener('scroll', () => { $('#progress').style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%'; }, { passive: true });

// Tech marquee
const techs = ['C#', 'ASP.NET', 'SQL', 'Vertica', 'JavaScript', 'React.js', 'Express.js', 'MongoDB', 'HTML5', 'CSS3', 'Git', 'GitHub'];
$('#track').innerHTML = [...techs, ...techs].map(t => `<span>${t}</span>`).join('');

// Typing role
const roles = ['Software Developer', 'Full Stack Learner'], roleEl = $('#role');
if (!reduce) {
  let ri = 0, ci = roles[0].length, del = true;
  setTimeout(function tick() {
    const w = roles[ri];
    ci += del ? -1 : 1; roleEl.textContent = w.slice(0, ci);
    let d = del ? 40 : 80;
    if (!del && ci === w.length) { del = true; d = 1800; }
    else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; d = 300; }
    setTimeout(tick, d);
  }, 2200);
}

// Scroll reveal + counters
const rv = $$('main section:not(.home) .heading, .photo, .about > div:last-child, .group, .timeline > li, .project, .contact > *, .marquee');
rv.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver((es, o) => es.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in'); o.unobserve(en.target);
  $$('.stat b').forEach(b => { if (en.target.contains(b) && !b.dataset.done) { b.dataset.done = 1; const n = +b.dataset.n, s0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - s0) / 1400); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + b.dataset.s; k < 1 && requestAnimationFrame(f); })(s0); } });
}), { threshold: 0.12 });
rv.forEach(el => io.observe(el));

// 3D tilt cards (mouse devices only)
if (matchMedia('(hover: hover)').matches && !reduce) {
  $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateY(${(x - .5) * 14}deg) rotateX(${(.5 - y) * 14}deg) scale(1.02)`;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// Contact form
const form = $('#form'), st = $('#status');
form.onsubmit = e => {
  e.preventDefault();
  const f = { n: $('#name'), e: $('#email'), m: $('#message') };
  const ok = { n: !!f.n.value.trim(), e: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.e.value.trim()), m: !!f.m.value.trim() };
  Object.keys(f).forEach(k => f[k].classList.toggle('invalid', !ok[k]));
  if (!(ok.n && ok.e && ok.m)) { st.className = 'error'; st.textContent = 'Please enter your name, a valid email address and a message.'; return; }
  const body = encodeURIComponent(f.m.value.trim() + '\n\nFrom: ' + f.n.value.trim() + ' (' + f.e.value.trim() + ')');
  location.href = 'mailto:gowthambaby0304@gmail.com?subject=' + encodeURIComponent('Portfolio enquiry from ' + f.n.value.trim()) + '&body=' + body;
  st.className = 'ok'; st.textContent = 'Opening your email app. If nothing opens, write to gowthambaby0304@gmail.com.'; form.reset();
};
