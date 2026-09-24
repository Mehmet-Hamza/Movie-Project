/* Dokümantasyon sayfasının davranışı: menü, kartlar ve "Dene" konsolu. */
(function () {
  var tokenBox = document.getElementById('tokenBox');
  var nav = document.getElementById('nav');
  var main = document.getElementById('main');

  var savedToken = localStorage.getItem('movieapi_token');
  if (savedToken) tokenBox.value = savedToken;
  tokenBox.addEventListener('input', function () {
    localStorage.setItem('movieapi_token', tokenBox.value.trim());
  });

  function esc(text) {
    return String(text).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  // --- Sağlık göstergesi ---------------------------------------------------
  fetch('/api/health')
    .then(function (r) { return r.json(); })
    .then(function (j) {
      document.getElementById('healthPill').textContent =
        j.data.records.movies + ' film · ' + j.data.records.users + ' kullanıcı · v' + j.data.version;
    })
    .catch(function () {
      document.getElementById('healthPill').textContent = 'sunucuya ulaşılamadı';
    });

  // --- Hızlı giriş ---------------------------------------------------------
  function quickLogin(identifier) {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier, password: '123456' }),
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.success) {
          tokenBox.value = j.data.token;
          localStorage.setItem('movieapi_token', j.data.token);
          tokenBox.style.borderColor = 'var(--green)';
          setTimeout(function () { tokenBox.style.borderColor = ''; }, 1200);
        }
      });
  }
  document.getElementById('loginAdmin').onclick = function () { quickLogin('admin'); };
  document.getElementById('loginUser').onclick = function () { quickLogin('elif'); };
  document.getElementById('clearToken').onclick = function () {
    tokenBox.value = '';
    localStorage.removeItem('movieapi_token');
  };

  // --- Sayfayı kur ---------------------------------------------------------
  window.API_GROUPS.forEach(function (group) {
    var navGroup = document.createElement('div');
    navGroup.innerHTML = '<h3>' + esc(group.title) + '</h3>';
    group.endpoints.forEach(function (ep, i) {
      var id = group.id + '-' + i;
      navGroup.innerHTML +=
        '<a href="#' + id + '"><span style="opacity:.7">' + ep.m + '</span> ' + esc(ep.p.replace('/api', '')) + '</a>';
    });
    nav.appendChild(navGroup);

    var section = document.createElement('section');
    section.className = 'group';
    section.innerHTML = '<h2 id="' + group.id + '">' + esc(group.title) + '</h2><p class="desc">' + esc(group.desc) + '</p>';

    group.endpoints.forEach(function (ep, i) {
      section.appendChild(buildEndpoint(group, ep, group.id + '-' + i));
    });
    main.appendChild(section);
  });

  function buildEndpoint(group, ep, id) {
    var el = document.createElement('details');
    el.className = 'ep';
    el.id = id;

    var lock = ep.auth ? '<span class="lock">' + (ep.auth === 'admin' ? 'admin' : 'token') + '</span>' : '';
    var summary =
      '<summary><span class="m ' + ep.m + '">' + ep.m + '</span>' +
      '<span class="path">' + esc(ep.p) + '</span>' + lock +
      '<span class="sum">' + esc(ep.s) + '</span></summary>';

    var paramsTable = '';
    if (ep.params && ep.params.length) {
      paramsTable =
        '<div><table><thead><tr><th>Parametre</th><th>Tip</th><th>Açıklama</th></tr></thead><tbody>' +
        ep.params
          .map(function (p) {
            return '<tr><td><code>' + esc(p[0]) + '</code></td><td>' + esc(p[1]) + '</td><td>' + p[2] + '</td></tr>';
          })
          .join('') +
        '</tbody></table></div>';
    }

    // "Dene" için örnek yol: :id geçen uçlarda gerçek bir örnek kullanılır
    var testPath = ep.sample || ep.p + (ep.query || '');
    if (testPath.indexOf(':id') !== -1) testPath = testPath.replace(':idOrSlug', 'inception-2010').replace(':idOrUsername', 'elif').replace(':id', 'mv_043');

    var bodyArea = ep.body
      ? '<label style="font-size:12px;color:var(--muted)">İstek gövdesi (JSON)</label><textarea>' +
        esc(JSON.stringify(ep.body, null, 2)) +
        '</textarea>'
      : '';

    el.innerHTML =
      summary +
      '<div class="body">' +
      paramsTable +
      bodyArea +
      '<div class="try"><input value="' + esc(testPath) + '" /><button class="primary">Dene</button>' +
      '<span class="status"></span></div>' +
      '<pre class="out">Yanıtı görmek için "Dene" butonuna basın.</pre>' +
      '</div>';

    var input = el.querySelector('.try input');
    var button = el.querySelector('.try button');
    var status = el.querySelector('.status');
    var out = el.querySelector('pre.out');
    var textarea = el.querySelector('textarea');

    button.onclick = function () {
      var headers = { 'Content-Type': 'application/json' };
      var token = tokenBox.value.trim();
      if (token) headers.Authorization = 'Bearer ' + token;

      var options = { method: ep.m, headers: headers };
      if (textarea && ep.m !== 'GET' && ep.m !== 'DELETE') options.body = textarea.value;

      status.textContent = '…';
      status.className = 'status';
      var started = Date.now();

      fetch(input.value, options)
        .then(function (res) {
          var ms = Date.now() - started;
          status.textContent = res.status + ' · ' + ms + 'ms';
          status.className = 'status ' + (res.ok ? 'ok' : 'err');
          if (res.status === 204) return '(204 No Content — gövde yok)';
          return res.text().then(function (text) {
            try { return JSON.stringify(JSON.parse(text), null, 2); } catch (e) { return text; }
          });
        })
        .then(function (text) { out.textContent = text; })
        .catch(function (err) {
          status.textContent = 'hata';
          status.className = 'status err';
          out.textContent = String(err);
        });
    };

    return el;
  }
})();
