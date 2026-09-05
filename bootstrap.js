(async()=>{
 const root=document.getElementById('appRoot');
 const files=['fragments/shell.html','fragments/part1.html','fragments/part2.html','fragments/part3.html'];
 try{
  const [shell,p1,p2,p3]=await Promise.all(files.map(async f=>{const r=await fetch(f,{cache:'no-cache'});if(!r.ok)throw new Error(f+' '+r.status);return r.text()}));
  root.innerHTML=shell;
  document.getElementById('story').innerHTML=p1+p2+p3;
  const s=document.createElement('script');s.src='app.js';s.defer=true;document.body.appendChild(s);
 }catch(e){root.innerHTML='<main class="boot-error"><h1>Không tải được câu chuyện</h1><p>Hãy tải lại trang.</p></main>';console.error(e)}
})();
