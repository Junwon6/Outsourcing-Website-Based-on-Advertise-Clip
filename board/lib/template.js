module.exports = {
  HTML: (title, list, body, control) =>{
    return `
    <!doctype html>
    <html>
    <head>
      <title>cre ground - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">default(logo)</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  }, list: (filelist) =>{
    var list = "<ul>";
    var i = 0;
    while(i<filelist.length){
      list=list + `<li><a href="/?id=${filelist[i]}"> ${filelist[i]}</a> </li>`;
      i=i+1;
    }
    list = list+'</ul>';
    return list;
  }
}
