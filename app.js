document.addEventListener('DOMContentLoaded', function(){
  // navbar toggle
  var hamb = document.getElementById('hamb');
  var nav = document.getElementById('nav');
  if(hamb && nav){
    hamb.addEventListener('click', function(){
      if(nav.style.display==='flex') nav.style.display='none'; else nav.style.display='flex';
    });
    document.addEventListener('click', function(e){
      if(window.innerWidth <= 900){
        if(!nav.contains(e.target) && e.target !== hamb){
          nav.style.display = 'none';
        }
      }
    });
  }

  // set active links
  document.querySelectorAll('.nav a').forEach(function(a){
    var href = a.getAttribute('href');
    var page = window.location.pathname.split('/').pop() || 'index.html';
    if(href === page) a.classList.add('active');
  });

  // Page-specific logic
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if(page === '' || page === 'index.html'){
    var hero = document.getElementById('hero');
    if(hero) hero.innerHTML = '<div><h1>AzLingo — Ingliz tilini o\'rganing</h1><p>Darajaga mos grammatika, 1000+ so\'z va interaktiv testlar.</p><a class="cta" href="grammar.html"><button>Darsni boshlash</button></a></div>';
  }

  if(page === 'grammar.html'){
    var levels = getLevels();
    var container = document.getElementById('levels');
    var lessons = document.getElementById('lessonsList');
    var content = document.getElementById('lessonContent');
    levels.forEach(function(lv){
      var b = document.createElement('button'); b.textContent = lv;
      b.addEventListener('click', function(){ showLessons(lv); });
      container.appendChild(b);
    });
    function showLessons(level){
      lessons.innerHTML='';
      var g = getGrammar(level);
      Object.keys(g).forEach(function(topic){
        var card = document.createElement('div'); card.className='lesson-card';
        card.innerHTML = '<h4>'+topic+'</h4><p class="small">Qoida va misollar</p>';
        card.addEventListener('click', function(){ renderTopic(level, topic); });
        lessons.appendChild(card);
      });
      content.innerHTML = '<p class="small">Darajani tanlang va mavzuni bosing.</p>';
    }
   window.renderTopic = function(level, topic){
    var g = getGrammar(level)[topic];
    if(!g) return;

    var structureStr = '';
    if(typeof g.structure === 'object'){
        if(Array.isArray(g.structure)){
            structureStr = g.structure.join('<br>');
        } else {
            for(var key in g.structure){
                if(g.structure.hasOwnProperty(key)){
                    structureStr += '<strong>' + key + '</strong>: ' + g.structure[key] + '<br>';
                }
            }
        }
    } else {
        structureStr = g.structure;
    }

    var html = '<h2>' + topic + ' — ' + level + '</h2>' +
               '<h3>Qoida (o\'zbekcha)</h3><p>' + g.rule_uz + '</p>' +
               '<h3>Structure</h3><p>' + structureStr + '</p>' +
               '<h3>Misollar</h3><ol>';

    g.examples.forEach(function(e){
        html += '<li><strong>' + e.en + '</strong> — ' + e.uz + '</li>';
    });

    html += '</ol>';
    content.innerHTML = html;
    window.scrollTo({top:0, behavior:'smooth'});
}
  }

  if(page === 'vocabulary.html'){
    var sel = document.getElementById('vocabLevel');
    var tbody = document.querySelector('#vocabAll tbody');
    getLevels().forEach(function(lv){ sel.appendChild(new Option(lv,lv)); });
    sel.addEventListener('change', function(){ fill(sel.value); });
    fill(getLevels()[0]);
    function fill(level){
      tbody.innerHTML='';
      var words = getWords(level);
      words.forEach(function(w,i){
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>'+(i+1)+'</td><td>'+level+'</td><td>'+w.en+'</td><td>'+w.uz+'</td>';
        tbody.appendChild(tr);
      });
    }
    var search = document.getElementById('vocabSearch');
    if(search) search.addEventListener('input', function(){
      var q = this.value.trim().toLowerCase();
      document.querySelectorAll('#vocabAll tbody tr').forEach(function(tr){
        var en = tr.cells[2].textContent.toLowerCase();
        var uz = tr.cells[3].textContent.toLowerCase();
        tr.style.display = (!q || en.indexOf(q) !== -1 || uz.indexOf(q) !== -1) ? '' : 'none';
      });
    });
  }

  if(page === 'test.html'){
    var levelSel = document.getElementById('testLevel');
    var lessonSel = document.getElementById('testLesson');
    var startBtn = document.getElementById('startTest');
    getLevels().forEach(function(lv){ levelSel.appendChild(new Option(lv,lv)); });
    function populate(lv){
      lessonSel.innerHTML = '<option value="">(any)</option>';
      Object.keys(getGrammar(lv)).forEach(function(t){ lessonSel.appendChild(new Option(t,t)); });
    }
    populate(getLevels()[0]);
    levelSel.addEventListener('change', function(){ populate(levelSel.value); });
    startBtn.addEventListener('click', function(){ startTest(levelSel.value, lessonSel.value); });

    var TEST = {q:[], i:0, score:0};

    function startTest(level, lesson){
      TEST.q = []; TEST.i=0; TEST.score=0;
      var words = getWords(level);
      var topics = Object.keys(getGrammar(level));
      for(var i=0;i<10;i++){ 
        var w = words[i % words.length]; 
        TEST.q.push({type:'vocab', q:'Translate to Uzbek: '+w.en, a:w.uz}); 
      }
      for(var j=0;j<10;j++){ 
        var t = topics[j % topics.length]; 
        var g = getGrammar(level)[t]; 
        var choices = shuffle(topics).slice(0,3); 
        if(choices.indexOf(t)===-1) choices.push(t); 
        TEST.q.push({type:'grammar', q:'Which topic matches this rule excerpt: '+g.rule_uz.substring(0,80)+'...', a:t, choices: shuffle(choices)}); 
      }
      document.getElementById('testArea').style.display='block';
      showQ();
    }

    function showQ(){
      var area = document.getElementById('testContent');
      if(TEST.i >= TEST.q.length){
        var resultMsg = '';
        if(TEST.score >= 16){
          resultMsg = 'Tabriklaymiz! Siz keyingi etabga o‘tasiz. Ball: ' + TEST.score + ' / ' + TEST.q.length;
        } else {
          resultMsg = 'Afsus! Siz yiqildingiz va boshqa etabga o‘ta olmaysiz. Ball: ' + TEST.score + ' / ' + TEST.q.length;
        }
        area.innerHTML = '<h3>Natija</h3><p>' + resultMsg + '</p>';
        return;
      }

      var cur = TEST.q[TEST.i];
      document.getElementById('testStage').textContent = 'Savol '+(TEST.i+1)+' / '+TEST.q.length;
      if(cur.type === 'vocab'){
        area.innerHTML = '<p>'+cur.q+'</p><input id="ans" class="search"><div style="margin-top:8px"><button id="check" class="cta">Tekshirish</button></div><p id="fb" class="small"></p>';
        document.getElementById('check').onclick = function(){
          var val = document.getElementById('ans').value.trim().toLowerCase();
          if(val === cur.a.toLowerCase()){
            TEST.score++;
            document.getElementById('fb').textContent = "To‘g‘ri";
          } else {
            document.getElementById('fb').textContent = "Noto‘g‘ri. Javob: "+cur.a;
          }
          TEST.i++;
          setTimeout(showQ,800);
        };
      } else {
        area.innerHTML = '<p>'+cur.q+'</p><div id="opts">' + cur.choices.map(function(ch){ return '<button class="opt">'+ch+'</button>'; }).join('') + '</div>';
        Array.from(area.querySelectorAll('.opt')).forEach(function(b){
          b.addEventListener('click', function(){
            if(b.textContent === cur.a) TEST.score++;
            TEST.i++;
            showQ();
          });
        });
      }
    }

    function shuffle(a){ return a.sort(function(){ return Math.random()-0.5; }); }
  }

  if(page === 'contact.html'){
    var lessonSelect = document.getElementById('lessonSelect');
    getLevels().forEach(function(lv){ Object.keys(getGrammar(lv)).forEach(function(t){ lessonSelect.appendChild(new Option(lv+' - '+t, lv+' - '+t)); }); });
    var sendBtn = document.getElementById('sendBtn');
    if(sendBtn){
      sendBtn.addEventListener('click', function(){
        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var lesson = document.getElementById('lessonSelect').value;
        var msg = document.getElementById('msg').value.trim();
        if(!name || !email || !msg){ alert('Iltimos barcha maydonlarni to\'ldiring'); return; }
        var BOT = '7532731670:AAEiF8NhlgO0ZIUyQmcmpKwmJz5TPEi2nRU'; 
        var CHAT = '7861521765';
        var text = encodeURIComponent('AzLingo Contact\nName:'+name+'\nEmail:'+email+'\nLesson:'+lesson+'\nMessage:'+msg);
        if(BOT.indexOf('REPLACE') !== -1){ alert('Bot token o\'rnatilmagan. Kontakt ma\'lumotlarini email orqali yuborishingiz mumkin.'); return; }
        var url = 'https://api.telegram.org/bot'+BOT+'/sendMessage?chat_id='+CHAT+'&text='+text;
        fetch(url).then(function(r){ if(r.ok){ alert('Xabaringiz yuborildi'); document.getElementById('contactForm').reset(); } else alert('Yuborishda xato'); }).catch(function(e){ alert('Xato: '+e); });
      });
    }
  }

}); 