/* ============================================================
   class.js
   Reads CLASS_DATA_FILE (set in each class-X.html) and builds
   the entire class hub page dynamically.
   No libraries needed. Vanilla JS only.
   ============================================================ */

(function () {
    'use strict';

    /* ── STATE ─────────────────────────────────────────────── */
    let DATA = null;   // full JSON data

    /* ── BOOT ──────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        var file = (typeof CLASS_DATA_FILE !== 'undefined')
            ? CLASS_DATA_FILE
            : 'class-1.json';
        loadData(file);
    });

    /* ── LOAD JSON ─────────────────────────────────────────── */
    function loadData(file) {
        fetch(file)
            .then(function (res) {
                if (!res.ok) throw new Error('Could not load ' + file);
                return res.json();
            })
            .then(function (data) {
                DATA = data;
                buildPage();
            })
            .catch(function (err) {
                console.error('class.js:', err);
                showError();
            });
    }

    /* ── BUILD FULL PAGE ───────────────────────────────────── */
    function buildPage() {
        buildHero();
        buildTabPanels();
        initTabs();
    }

    /* ── HERO ──────────────────────────────────────────────── */
    function buildHero() {
        /* page <title> */
        document.title = 'ക്ലാസ് ' + DATA.class + ' | KuttyTeachers';

        /* hero section */
        var hero = document.getElementById('class-hero');
        if (!hero) return;

        var prevNum = DATA.class - 1;
        var nextNum = DATA.class + 1;

        hero.innerHTML = [
            '<div class="class-hero-top">',
              '<div class="class-hero-left">',
                '<a href="tutoring.html" class="class-back-link">← പഠന ഹോം</a>',
                '<h1 class="class-hero-title">Class ' + DATA.class + '</h1>',
                '<div class="class-hero-title-ml">' + escHtml(DATA.class_ml) + '</div>',
                '<div class="class-hero-age">' + escHtml(DATA.age_range) + ' &nbsp;·&nbsp; ' + escHtml(DATA.academic_year) + '</div>',
              '</div>',
              '<div class="class-switcher">',
                prevNum >= 1
                    ? '<a href="class-' + prevNum + '.html" class="class-switch-btn">← ക്ലാസ് ' + prevNum + '</a>'
                    : '<span class="class-switch-btn disabled">← ക്ലാസ് ' + prevNum + '</span>',
                nextNum <= 8
                    ? '<a href="class-' + nextNum + '.html" class="class-switch-btn">ക്ലാസ് ' + nextNum + ' →</a>'
                    : '<span class="class-switch-btn disabled">ക്ലാസ് ' + nextNum + ' →</span>',
              '</div>',
            '</div>',

            /* tabs bar */
            '<div class="class-tabs-bar" id="tabs-bar">',
              '<button class="tab-btn active" data-tab="subjects">📚 വിഷയങ്ങൾ</button>',
              '<button class="tab-btn" data-tab="attitude">🧠 മനോഭാവം</button>',
              '<button class="tab-btn" data-tab="parents">👨‍👩‍👧 രക്ഷകർ</button>',
              '<button class="tab-btn" data-tab="teachers">👩‍🏫 അദ്ധ്യാപകർ</button>',
              '<button class="tab-btn" data-tab="games">🎮 ഗെയിംസ്</button>',
              '<button class="tab-btn" data-tab="freeclass">💚 സൌജന്യ ക്ലാസ്</button>',
            '</div>',
        ].join('');
    }

    /* ── BUILD ALL TAB PANELS ──────────────────────────────── */
    function buildTabPanels() {
        var body = document.getElementById('class-body');
        if (!body) return;

        body.innerHTML = [
            buildSubjectsPanel(),
            buildAttitudePanel(),
            buildParentsPanel(),
            buildTeachersPanel(),
            buildGamesPanel(),
            buildFreeClassPanel(),
        ].join('');

        /* attach subject card toggle listeners */
        body.querySelectorAll('.subject-card-header').forEach(function (header) {
            header.addEventListener('click', function () {
                var card = header.closest('.subject-card');
                card.classList.toggle('open');
            });
        });

        /* attach curriculum tab listeners */
        body.querySelectorAll('.curr-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var subjectId = btn.dataset.subject;
                var currId    = btn.dataset.curr;
                switchCurriculum(subjectId, currId);
            });
        });
    }

    /* ── SUBJECTS PANEL ────────────────────────────────────── */
    function buildSubjectsPanel() {
        var subjects = DATA.subjects || [];
        var cards = subjects.map(function (subject) {
            return buildSubjectCard(subject);
        }).join('');

        return [
            '<div class="tab-panel active" id="panel-subjects">',
              '<div class="panel-header">',
                '<div class="panel-label">ക്ലാസ് ' + DATA.class + ' വിഷയങ്ങൾ</div>',
                '<h2 class="panel-title">വിഷയങ്ങൾ</h2>',
                '<p class="panel-desc">ഓരോ വിഷയവും click ചെയ്ത് expand ചെയ്യൂ. 5 പാഠ്യക്രമങ്ങൾ switch ചെയ്ത് compare ചെയ്യൂ.</p>',
              '</div>',
              '<div class="subjects-grid">', cards, '</div>',
            '</div>',
        ].join('');
    }

    function buildSubjectCard(subject) {
        var curricula = subject.curricula || {};
        var currKeys  = ['scert', 'ncert', 'icse', 'finland', 'japan'];
        var currLabels = {
            scert: '🇮🇳 SCERT', ncert: '🇮🇳 NCERT',
            icse: '🇮🇳 ICSE', finland: '🇫🇮 Finland', japan: '🇯🇵 Japan'
        };

        /* curriculum tab buttons */
        var currBtns = currKeys.map(function (key, i) {
            return '<button class="curr-btn' + (i === 0 ? ' active' : '') + '" ' +
                   'data-subject="' + subject.id + '" data-curr="' + key + '">' +
                   escHtml(currLabels[key]) + '</button>';
        }).join('');

        /* curriculum panels */
        var currPanels = currKeys.map(function (key, i) {
            var c = curricula[key];
            if (!c) return '';

            var topicsHTML = (c.topics || []).map(function (t) {
                return '<li>' + escHtml(t) + '</li>';
            }).join('');

            return [
                '<div class="curr-panel' + (i === 0 ? ' active' : '') + '" ',
                     'id="curr-' + subject.id + '-' + key + '">',
                  c.unit_title ? '<div class="curr-unit-title">' + escHtml(c.unit_title) + '</div>' : '',
                  topicsHTML ? '<ul class="topics-list">' + topicsHTML + '</ul>' : '',
                  c.your_insight ? [
                      '<div class="insight-box">',
                        '<div class="insight-label">💡 Teacher Insight</div>',
                        '<div class="insight-text">' + escHtml(c.your_insight) + '</div>',
                      '</div>'
                  ].join('') : '',
                '</div>',
            ].join('');
        }).join('');

        /* games inside subject */
        var gamesHTML = '';
        if (subject.games && subject.games.length > 0) {
            var gameCards = subject.games.map(function (g) {
                return buildInlineGameCard(g);
            }).join('');

            gamesHTML = [
                '<div class="games-divider"></div>',
                '<div class="games-section-label">🎮 ഈ വിഷയത്തിലെ ഗെയിംസ്</div>',
                '<div class="game-cards">', gameCards, '</div>',
            ].join('');
        }

        return [
            '<div class="subject-card" id="subject-' + subject.id + '">',

              /* header — click to expand */
              '<div class="subject-card-header">',
                '<div class="subject-icon">' + escHtml(subject.icon) + '</div>',
                '<div class="subject-name-wrap">',
                  '<div class="subject-name-ml">' + escHtml(subject.name_ml) + '</div>',
                  '<div class="subject-name-en">' + escHtml(subject.name_en) + '</div>',
                '</div>',
                '<div class="subject-chevron">',
                  svgChevron(),
                '</div>',
              '</div>',

              /* body — hidden until open */
              '<div class="subject-card-body">',
                '<div class="subject-card-inner">',
                  '<div class="curriculum-tabs">', currBtns, '</div>',
                  currPanels,
                  gamesHTML,
                '</div>',
              '</div>',

            '</div>',
        ].join('');
    }

    /* ── SWITCH CURRICULUM ─────────────────────────────────── */
    function switchCurriculum(subjectId, currId) {
        var card = document.getElementById('subject-' + subjectId);
        if (!card) return;

        /* update buttons */
        card.querySelectorAll('.curr-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.curr === currId);
        });

        /* update panels */
        card.querySelectorAll('.curr-panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === 'curr-' + subjectId + '-' + currId);
        });
    }

    /* ── INLINE GAME CARD (inside subject) ─────────────────── */
    function buildInlineGameCard(g) {
        return [
            '<div class="game-card">',
              '<div class="game-card-top">',
                '<div class="game-emoji">🎯</div>',
                '<div>',
                  '<div class="game-name-ml">' + escHtml(g.name_ml || g.name) + '</div>',
                  g.name !== g.name_ml ? '<div class="game-name-en">' + escHtml(g.name) + '</div>' : '',
                '</div>',
              '</div>',
              '<div class="game-meta-row">',
                g.portion ? '<span class="game-meta-chip">📌 ' + escHtml(g.portion) + '</span>' : '',
                g.players ? '<span class="game-meta-chip">👥 ' + escHtml(g.players) + '</span>' : '',
                g.materials ? '<span class="game-meta-chip">🧰 ' + escHtml(g.materials) + '</span>' : '',
              '</div>',
              g.how_to_play ? [
                  '<div class="game-how-label">എങ്ങനെ കളിക്കും</div>',
                  '<div class="game-how-text">' + escHtml(g.how_to_play) + '</div>',
              ].join('') : '',
              g.learning_outcome
                  ? '<span class="game-outcome">🎓 ' + escHtml(g.learning_outcome) + '</span>'
                  : '',
            '</div>',
        ].join('');
    }

    /* ── ATTITUDE PANEL ────────────────────────────────────── */
    function buildAttitudePanel() {
        var a = DATA.attitude_guide || {};

        var traitsHTML = buildList(a.key_traits, 'bullet-list');
        var doHTML     = buildList(a.do_list,    'do-list');
        var dontHTML   = buildList(a.dont_list,  'dont-list');

        return [
            '<div class="tab-panel" id="panel-attitude">',
              '<div class="panel-header">',
                '<div class="panel-label">ക്ലാസ് ' + DATA.class + ' · ' + escHtml(DATA.age_range) + '</div>',
                '<h2 class="panel-title">കുട്ടികളുടെ മനോഭാവം</h2>',
                '<p class="panel-desc">' + escHtml(a.overview || '') + '</p>',
              '</div>',
              '<div class="info-grid">',

                /* key traits */
                '<div class="info-card">',
                  '<div class="info-card-icon">🌱</div>',
                  '<div class="info-card-title">ഈ പ്രായത്തിലെ സ്വഭാവ സവിശേഷതകൾ</div>',
                  traitsHTML,
                '</div>',

                /* do list */
                '<div class="info-card">',
                  '<div class="info-card-icon">✅</div>',
                  '<div class="info-card-title">ചെയ്യേണ്ടവ</div>',
                  doHTML,
                '</div>',

                /* dont list */
                '<div class="info-card">',
                  '<div class="info-card-icon">🚫</div>',
                  '<div class="info-card-title">ഒഴിവാക്കേണ്ടവ</div>',
                  dontHTML,
                '</div>',

              '</div>',
            '</div>',
        ].join('');
    }

    /* ── PARENTS PANEL ─────────────────────────────────────── */
    function buildParentsPanel() {
        var p = DATA.for_parents || {};

        var tipsHTML     = buildList(p.tips,       'bullet-list');
        var redFlagHTML  = buildRedFlags(p.red_flags);

        return [
            '<div class="tab-panel" id="panel-parents">',
              '<div class="panel-header">',
                '<div class="panel-label">രക്ഷകർത്താക്കൾക്ക്</div>',
                '<h2 class="panel-title">രക്ഷകർ നിർദ്ദേശങ്ങൾ</h2>',
                '<p class="panel-desc">' + escHtml(p.overview || '') + '</p>',
              '</div>',
              '<div class="info-grid">',

                '<div class="info-card">',
                  '<div class="info-card-icon">💡</div>',
                  '<div class="info-card-title">വീട്ടിൽ ചെയ്യേണ്ടത്</div>',
                  tipsHTML,
                  redFlagHTML,
                '</div>',

              '</div>',
            '</div>',
        ].join('');
    }

    /* ── TEACHERS PANEL ────────────────────────────────────── */
    function buildTeachersPanel() {
        var t = DATA.for_teachers || {};

        var strategiesHTML  = buildList(t.strategies,      'bullet-list');
        var assessHTML      = buildList(t.assessment_tips,  'bullet-list');

        return [
            '<div class="tab-panel" id="panel-teachers">',
              '<div class="panel-header">',
                '<div class="panel-label">അദ്ധ്യാപകർക്ക്</div>',
                '<h2 class="panel-title">അദ്ധ്യാപക നിർദ്ദേശങ്ങൾ</h2>',
                '<p class="panel-desc">' + escHtml(t.overview || '') + '</p>',
              '</div>',
              '<div class="info-grid">',

                '<div class="info-card">',
                  '<div class="info-card-icon">🎯</div>',
                  '<div class="info-card-title">പഠന തന്ത്രങ്ങൾ</div>',
                  strategiesHTML,
                '</div>',

                t.assessment_tips ? [
                    '<div class="info-card">',
                      '<div class="info-card-icon">📝</div>',
                      '<div class="info-card-title">Assessment Tips</div>',
                      assessHTML,
                    '</div>',
                ].join('') : '',

              '</div>',
            '</div>',
        ].join('');
    }

    /* ── GAMES PANEL (all games collected) ─────────────────── */
    function buildGamesPanel() {
        var allGames = [];
        (DATA.subjects || []).forEach(function (subject) {
            (subject.games || []).forEach(function (game) {
                allGames.push({ game: game, subject: subject });
            });
        });

        var cardsHTML = '';
        if (allGames.length === 0) {
            cardsHTML = '<div class="empty-state"><div class="empty-state-icon">🎮</div><p>ഗെയിംസ് ഉടൻ വരും...</p></div>';
        } else {
            cardsHTML = allGames.map(function (entry) {
                var g = entry.game;
                var s = entry.subject;
                return [
                    '<div class="all-game-card">',
                      '<div class="all-game-subject-badge">' + escHtml(s.icon) + ' ' + escHtml(s.name_ml) + '</div>',
                      '<div class="all-game-title">' + escHtml(g.name_ml || g.name) + '</div>',
                      g.portion ? '<div class="all-game-portion">📌 ' + escHtml(g.portion) + '</div>' : '',
                      '<div class="all-game-meta">',
                        g.players   ? '<span class="game-meta-chip">👥 ' + escHtml(g.players) + '</span>'   : '',
                        g.materials ? '<span class="game-meta-chip">🧰 ' + escHtml(g.materials) + '</span>' : '',
                      '</div>',
                      g.how_to_play ? '<div class="all-game-how">' + escHtml(g.how_to_play) + '</div>' : '',
                      g.learning_outcome ? '<span class="game-outcome">🎓 ' + escHtml(g.learning_outcome) + '</span>' : '',
                    '</div>',
                ].join('');
            }).join('');
        }

        return [
            '<div class="tab-panel" id="panel-games">',
              '<div class="panel-header">',
                '<div class="panel-label">ക്ലാസ് ' + DATA.class + ' · എല്ലാ ഗെയിംസും</div>',
                '<h2 class="panel-title">ഗെയിംസ്</h2>',
                '<p class="panel-desc">ഓരോ വിഷയത്തിലെ ഗെയിംസ് ഇവിടെ ഒന്നിച്ച് കാണാം. ഓരോ ഗെയിമും ഒരു specific portion target ചെയ്യുന്നു.</p>',
              '</div>',
              '<div class="all-games-grid">', cardsHTML, '</div>',
            '</div>',
        ].join('');
    }

    /* ── FREE CLASS PANEL ──────────────────────────────────── */
    function buildFreeClassPanel() {
        var f = DATA.free_class_notes || {};

        var strugglesHTML    = buildList(f.common_struggles,   'bullet-list');
        var interventionHTML = buildList(f.intervention_tips,  'do-list');

        return [
            '<div class="tab-panel" id="panel-freeclass">',
              '<div class="panel-header">',
                '<div class="panel-label">സൌജന്യ ക്ലാസ്</div>',
                '<h2 class="panel-title">Extra Help</h2>',
                '<p class="panel-desc">ക്ലാസ് ' + DATA.class + '-ൽ പഠനം ബുദ്ധിമുട്ടാകുന്ന കുട്ടികൾക്കായി.</p>',
              '</div>',

              '<div class="free-class-overview">',
                '<p>' + escHtml(f.overview || '') + '</p>',
              '</div>',

              '<div class="free-class-cols">',
                '<div class="free-class-box">',
                  '<div class="free-class-box-title">⚠️ Common Struggles</div>',
                  strugglesHTML,
                '</div>',
                '<div class="free-class-box">',
                  '<div class="free-class-box-title">✅ Intervention Tips</div>',
                  interventionHTML,
                '</div>',
              '</div>',

              '<div class="contact-cta">',
                '<h3>സഹായം വേണോ?</h3>',
                '<p>' + escHtml(f.contact_note || 'നിങ്ങളുടെ കുട്ടിക്ക് extra help വേണമെങ്കിൽ ഞങ്ങളെ ബന്ധപ്പെടൂ.') + '</p>',
                '<a href="mailto:contact@kuttyteachers.in?subject=Free Class - Class ' + DATA.class + '">ഇമെയിൽ ചെയ്യൂ →</a>',
              '</div>',

            '</div>',
        ].join('');
    }

    /* ── TAB SWITCHING ─────────────────────────────────────── */
    function initTabs() {
        var tabsBar = document.getElementById('tabs-bar');
        if (!tabsBar) return;

        tabsBar.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tabId = btn.dataset.tab;

                /* update buttons */
                tabsBar.querySelectorAll('.tab-btn').forEach(function (b) {
                    b.classList.toggle('active', b === btn);
                });

                /* update panels */
                document.querySelectorAll('.tab-panel').forEach(function (panel) {
                    panel.classList.toggle('active', panel.id === 'panel-' + tabId);
                });

                /* scroll tabs bar to keep active btn in view */
                btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        });

        /* keyboard navigation for tabs */
        tabsBar.addEventListener('keydown', function (e) {
            var btns = Array.from(tabsBar.querySelectorAll('.tab-btn'));
            var idx  = btns.indexOf(document.activeElement);
            if (idx === -1) return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                btns[(idx + 1) % btns.length].focus();
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                btns[(idx - 1 + btns.length) % btns.length].focus();
            }
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.activeElement.click();
            }
        });
    }

    /* ── HELPER: build a list ──────────────────────────────── */
    function buildList(items, cls) {
        if (!items || items.length === 0) return '';
        var li = items.map(function (item) {
            return '<li>' + escHtml(item) + '</li>';
        }).join('');
        return '<ul class="trait-list ' + cls + '">' + li + '</ul>';
    }

    /* ── HELPER: build red flags ───────────────────────────── */
    function buildRedFlags(items) {
        if (!items || items.length === 0) return '';
        var li = items.map(function (item) {
            return '<li>' + escHtml(item) + '</li>';
        }).join('');
        return [
            '<div class="redflag-label">🚨 ശ്രദ്ധിക്കേണ്ട സൂചനകൾ</div>',
            '<ul class="redflag-list">' + li + '</ul>',
        ].join('');
    }

    /* ── HELPER: HTML escape ───────────────────────────────── */
    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#39;');
    }

    /* ── ERROR STATE ───────────────────────────────────────── */
    function showError() {
        var hero = document.getElementById('class-hero');
        var body = document.getElementById('class-body');
        if (hero) hero.innerHTML = '';
        if (body) {
            body.innerHTML = [
                '<div class="page-loading">',
                  '<div class="page-loading-icon">⚠️</div>',
                  '<p>JSON file ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.</p>',
                  '<p style="font-size:0.85rem;opacity:0.7;margin-top:4px">',
                  'Make sure class-X.json is in the same folder and you\'re using a local server.</p>',
                '</div>',
            ].join('');
        }
    }

    /* ── SVG ICONS ─────────────────────────────────────────── */
    function svgChevron() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg>';
    }

})();
