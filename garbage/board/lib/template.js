module.exports = {
  HTML: (title, list, body, control) =>{
    return `
    <!doctype html>
    <html>
    <head>
      <title>cre ground - ${title}</title>
      <meta charset="utf-8">
      <link rel="stylesheet" href="/main.css" />
    </head>
    <body>
      <nav>
        <ul>
          <li>
            <a href="/">default(logo)</a>
          </li>
          <li>
            <a href="/">Register</a>
          </li>
          <li>
            <a href="/">create</a>
          </li>
          <li>
            <a href="/">playground</a>
          </li>
          <li>
            <a href="/">Q&A</a>
          </li>
        </ul>
      </nav>
      

      ${list}
      ${control}
      ${body}
      */
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
